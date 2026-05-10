import { randomUUID } from 'crypto';
import sql from '../db/index.js';
import { getTripById } from './trips.controller.js';

async function buildItinerary(tripId) {
  const tripRows = await sql`
    SELECT
      t.*,
      u.username AS owner_username,
      u.full_name AS owner_full_name,
      u.avatar_url AS owner_avatar_url
    FROM trips t
    LEFT JOIN users u ON u.id = t.user_id
    WHERE t.id = ${tripId}
    LIMIT 1
  `;

  const trip = tripRows[0];
  if (!trip) {
    return null;
  }

  const stops = await sql`
    SELECT
      ts.*,
      c.city_name,
      c.country,
      c.image_url
    FROM trip_stops ts
    LEFT JOIN cities c ON c.id = ts.city_id
    WHERE ts.trip_id = ${tripId}
    ORDER BY ts.stop_order ASC
  `;

  const stopsWithActivities = await Promise.all(
    stops.map(async (stop) => {
      const activities = await sql`
        SELECT
          ta.*,
          a.title,
          a.category,
          a.image_url,
          a.estimated_cost
        FROM trip_activities ta
        LEFT JOIN activities a ON a.id = ta.activity_id
        WHERE ta.trip_stop_id = ${stop.id}
        ORDER BY ta.activity_order ASC
      `;

      const { city_name, country, image_url, ...stopFields } = stop;
      return {
        ...stopFields,
        city: {
          city_name,
          country,
          image_url,
        },
        activities,
      };
    })
  );

  const packingItems = await sql`
    SELECT *
    FROM packing_items
    WHERE trip_id = ${tripId}
    ORDER BY is_essential DESC, category ASC, created_at ASC
  `;

  const [budgetSummary] = await sql`
    SELECT
      COALESCE(SUM(total_stop_cost), 0)::numeric AS stop_total,
      COUNT(*)::int AS stop_count
    FROM trip_stops
    WHERE trip_id = ${tripId}
  `;

  const [activitySummary] = await sql`
    SELECT
      COALESCE(SUM(COALESCE(ta.custom_cost, a.estimated_cost, 0)), 0)::numeric AS activity_total,
      COUNT(*)::int AS activity_count
    FROM trip_activities ta
    LEFT JOIN activities a ON a.id = ta.activity_id
    JOIN trip_stops ts ON ts.id = ta.trip_stop_id
    WHERE ts.trip_id = ${tripId}
  `;

  const [packingSummary] = await sql`
    SELECT
      COUNT(*)::int AS total_count,
      COUNT(*) FILTER (WHERE is_packed) ::int AS packed_count
    FROM packing_items
    WHERE trip_id = ${tripId}
  `;

  const sharedRows = await sql`
    SELECT *
    FROM shared_trips
    WHERE trip_id = ${tripId}
    LIMIT 1
  `;

  return {
    trip,
    shared: sharedRows[0] || null,
    stops: stopsWithActivities,
    packing_items: packingItems,
    stats: {
      stop_count: budgetSummary?.stop_count || 0,
      activity_count: activitySummary?.activity_count || 0,
      stop_total: budgetSummary?.stop_total || 0,
      activity_total: activitySummary?.activity_total || 0,
      estimated_total_cost:
        Number(budgetSummary?.stop_total || 0) + Number(activitySummary?.activity_total || 0),
      packing_total: packingSummary?.total_count || 0,
      packing_packed: packingSummary?.packed_count || 0,
      view_count: sharedRows[0]?.total_views || 0,
    },
  };
}

async function buildPublicTripCards(search = '') {
  const query = search.trim();

  const rows = await sql`
    SELECT
      st.public_slug,
      st.total_views,
      st.allow_copy,
      st.created_at AS shared_at,
      t.id,
      t.title,
      t.description,
      t.trip_type,
      t.start_date,
      t.end_date,
      t.cover_image,
      t.visibility,
      t.status,
      t.estimated_total_cost,
      t.created_at,
      t.updated_at,
      u.username AS owner_username,
      u.full_name AS owner_full_name,
      u.avatar_url AS owner_avatar_url,
      COALESCE((
        SELECT COUNT(*)::int
        FROM trip_stops ts
        WHERE ts.trip_id = t.id
      ), 0) AS stop_count,
      COALESCE((
        SELECT COUNT(*)::int
        FROM trip_activities ta
        JOIN trip_stops ts ON ts.id = ta.trip_stop_id
        WHERE ts.trip_id = t.id
      ), 0) AS activity_count,
      COALESCE((
        SELECT COUNT(*)::int
        FROM packing_items pi
        WHERE pi.trip_id = t.id
      ), 0) AS packing_count,
      COALESCE((
        SELECT SUM(total_stop_cost)
        FROM trip_stops ts
        WHERE ts.trip_id = t.id
      ), 0)::numeric AS stop_total,
      COALESCE((
        SELECT SUM(COALESCE(ta.custom_cost, a.estimated_cost, 0))
        FROM trip_activities ta
        LEFT JOIN activities a ON a.id = ta.activity_id
        JOIN trip_stops ts ON ts.id = ta.trip_stop_id
        WHERE ts.trip_id = t.id
      ), 0)::numeric AS activity_total
    FROM shared_trips st
    JOIN trips t ON t.id = st.trip_id
    LEFT JOIN users u ON u.id = t.user_id
    WHERE t.visibility = 'public'
      AND (
        ${query} = '' OR
        t.title ILIKE ${`%${query}%`} OR
        COALESCE(t.description, '') ILIKE ${`%${query}%`} OR
        COALESCE(u.full_name, '') ILIKE ${`%${query}%`} OR
        COALESCE(u.username, '') ILIKE ${`%${query}%`}
      )
    ORDER BY st.total_views DESC, st.created_at DESC
    LIMIT 48
  `;

  return rows.map((row) => ({
    ...row,
    public_url: `/shared-itinerary/${row.public_slug}`,
    budget_total: Number(row.stop_total || 0) + Number(row.activity_total || 0),
  }));
}

export async function listPublicSharedTrips(req, res, next) {
  try {
    const items = await buildPublicTripCards(String(req.query.q || ''));

    return res.status(200).json({
      success: true,
      data: {
        items,
        total_count: items.length,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function shareTrip(req, res, next) {
  try {
    const trip = await getTripById(req.params.id);
    if (!trip) {
      return res.status(404).json({ success: false, error: 'Trip not found' });
    }

    if (trip.user_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    await sql`
      UPDATE trips
      SET visibility = 'public', updated_at = NOW()
      WHERE id = ${req.params.id}
    `;

    const existing = await sql`
      SELECT *
      FROM shared_trips
      WHERE trip_id = ${req.params.id}
      LIMIT 1
    `;

    if (existing.length > 0) {
      const row = existing[0];
      return res.status(200).json({
        success: true,
        data: {
          public_url: `/shared-itinerary/${row.public_slug}`,
          slug: row.public_slug,
          allow_copy: row.allow_copy,
          total_views: row.total_views,
          visibility: 'public',
        },
      });
    }

    const slug = randomUUID();
    const rows = await sql`
      INSERT INTO shared_trips (id, trip_id, public_slug, total_views, allow_copy, created_at)
      VALUES (gen_random_uuid(), ${req.params.id}, ${slug}, 0, true, NOW())
      RETURNING *
    `;
    const row = rows[0];

    return res.status(201).json({
      success: true,
      data: {
        public_url: `/shared-itinerary/${row.public_slug}`,
        slug: row.public_slug,
        allow_copy: row.allow_copy,
        total_views: row.total_views,
        visibility: 'public',
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function getSharedTrip(req, res, next) {
  try {
    const shared = await sql`
      SELECT *
      FROM shared_trips
      WHERE public_slug = ${req.params.slug}
      LIMIT 1
    `;

    if (shared.length === 0) {
      return res.status(404).json({ success: false, error: 'Shared trip not found' });
    }

    await sql`
      UPDATE shared_trips
      SET total_views = total_views + 1
      WHERE public_slug = ${req.params.slug}
    `;

    const itinerary = await buildItinerary(shared[0].trip_id);
    if (!itinerary) {
      return res.status(404).json({ success: false, error: 'Shared trip not found' });
    }

    return res.status(200).json({
      success: true,
      data: {
        ...itinerary,
        shared: {
          ...itinerary.shared,
          public_url: `/shared-itinerary/${req.params.slug}`,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function copySharedTrip(req, res, next) {
  try {
    const shared = await sql`
      SELECT *
      FROM shared_trips
      WHERE public_slug = ${req.params.slug}
      LIMIT 1
    `;

    if (shared.length === 0) {
      return res.status(404).json({ success: false, error: 'Shared trip not found' });
    }

    if (!shared[0].allow_copy) {
      return res.status(403).json({ success: false, error: 'Copying not allowed' });
    }

    const originalTripRows = await sql`
      SELECT *
      FROM trips
      WHERE id = ${shared[0].trip_id}
      LIMIT 1
    `;

    const originalTrip = originalTripRows[0];
    if (!originalTrip) {
      return res.status(404).json({ success: false, error: 'Trip not found' });
    }

    const newTripRows = await sql`
      INSERT INTO trips (
        id,
        user_id,
        title,
        description,
        trip_type,
        start_date,
        end_date,
        cover_image,
        visibility,
        status,
        created_at,
        updated_at
      ) VALUES (
        gen_random_uuid(),
        ${req.user.id},
        ${originalTrip.title},
        ${originalTrip.description},
        ${originalTrip.trip_type},
        ${originalTrip.start_date},
        ${originalTrip.end_date},
        ${originalTrip.cover_image},
        'private',
        'planning',
        NOW(),
        NOW()
      )
      RETURNING *
    `;

    const newTrip = newTripRows[0];

    const stops = await sql`
      SELECT *
      FROM trip_stops
      WHERE trip_id = ${originalTrip.id}
      ORDER BY stop_order ASC
    `;

    const stopMap = new Map();

    for (const stop of stops) {
      const inserted = await sql`
        INSERT INTO trip_stops (
          id,
          trip_id,
          city_id,
          arrival_date,
          departure_date,
          stop_order,
          hotel_name,
          stay_type,
          hotel_cost,
          transport_cost,
          food_cost,
          notes,
          created_at
        ) VALUES (
          gen_random_uuid(),
          ${newTrip.id},
          ${stop.city_id},
          ${stop.arrival_date},
          ${stop.departure_date},
          ${stop.stop_order},
          ${stop.hotel_name},
          ${stop.stay_type},
          ${stop.hotel_cost},
          ${stop.transport_cost},
          ${stop.food_cost},
          ${stop.notes},
          NOW()
        )
        RETURNING *
      `;

      stopMap.set(stop.id, inserted[0].id);
    }

    const activities = await sql`
      SELECT ta.*, ts.id AS old_stop_id
      FROM trip_activities ta
      JOIN trip_stops ts ON ts.id = ta.trip_stop_id
      WHERE ts.trip_id = ${originalTrip.id}
      ORDER BY ta.activity_order ASC
    `;

    for (const activity of activities) {
      await sql`
        INSERT INTO trip_activities (
          id,
          trip_stop_id,
          activity_id,
          activity_date,
          start_time,
          end_time,
          custom_notes,
          custom_cost,
          activity_order,
          created_at
        ) VALUES (
          gen_random_uuid(),
          ${stopMap.get(activity.old_stop_id)},
          ${activity.activity_id},
          ${activity.activity_date},
          ${activity.start_time},
          ${activity.end_time},
          ${activity.custom_notes},
          ${activity.custom_cost},
          ${activity.activity_order},
          NOW()
        )
      `;
    }

    const packingItems = await sql`
      SELECT *
      FROM packing_items
      WHERE trip_id = ${originalTrip.id}
      ORDER BY created_at ASC
    `;

    for (const item of packingItems) {
      await sql`
        INSERT INTO packing_items (
          id,
          trip_id,
          item_name,
          category,
          quantity,
          priority,
          notes,
          pack_by,
          is_essential,
          is_packed,
          packed_at,
          source,
          created_at,
          updated_at
        ) VALUES (
          gen_random_uuid(),
          ${newTrip.id},
          ${item.item_name},
          ${item.category},
          ${item.quantity},
          ${item.priority},
          ${item.notes},
          ${item.pack_by},
          ${item.is_essential},
          false,
          null,
          ${item.source || 'manual'},
          NOW(),
          NOW()
        )
      `;
    }

    return res.status(201).json({
      success: true,
      data: {
        new_trip_id: newTrip.id,
      },
    });
  } catch (error) {
    return next(error);
  }
}
