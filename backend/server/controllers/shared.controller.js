import { randomUUID } from 'crypto';
import sql from '../db/index.js';
import { getTripById } from './trips.controller.js';

async function buildItinerary(tripId) {
  const tripRows = await sql`SELECT * FROM trips WHERE id = ${tripId} LIMIT 1`;
  const trip = tripRows[0];
  const stops = await sql`
    SELECT ts.*, c.city_name, c.country, c.image_url
    FROM trip_stops ts
    JOIN cities c ON c.id = ts.city_id
    WHERE ts.trip_id = ${tripId}
    ORDER BY ts.stop_order ASC
  `;
  const stopsWithActivities = await Promise.all(
    stops.map(async (stop) => {
      const activities = await sql`
        SELECT ta.*, a.title, a.category, a.image_url, a.estimated_cost
        FROM trip_activities ta
        JOIN activities a ON a.id = ta.activity_id
        WHERE ta.trip_stop_id = ${stop.id}
        ORDER BY ta.activity_order ASC
      `;
      const { city_name, country, image_url, ...stopFields } = stop;
      return { ...stopFields, city: { city_name, country, image_url }, activities };
    })
  );
  return { trip, stops: stopsWithActivities };
}

export async function shareTrip(req, res, next) {
  try {
    const trip = await getTripById(req.params.id);
    if (!trip) return res.status(404).json({ success: false, error: 'Trip not found' });
    if (trip.user_id !== req.user.id) return res.status(403).json({ success: false, error: 'Forbidden' });

    const existing = await sql`SELECT * FROM shared_trips WHERE trip_id = ${req.params.id} LIMIT 1`;
    if (existing.length > 0) {
      const row = existing[0];
      return res.status(200).json({
        success: true,
        data: {
          public_url: `/shared/${row.public_slug}`,
          slug: row.public_slug,
          allow_copy: row.allow_copy,
          total_views: row.total_views,
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
        public_url: `/shared/${row.public_slug}`,
        slug: row.public_slug,
        allow_copy: row.allow_copy,
        total_views: row.total_views,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function getSharedTrip(req, res, next) {
  try {
    const shared = await sql`SELECT * FROM shared_trips WHERE public_slug = ${req.params.slug} LIMIT 1`;
    if (shared.length === 0) return res.status(404).json({ success: false, error: 'Shared trip not found' });
    await sql`UPDATE shared_trips SET total_views = total_views + 1 WHERE public_slug = ${req.params.slug}`;
    const itinerary = await buildItinerary(shared[0].trip_id);
    return res.status(200).json({ success: true, data: itinerary });
  } catch (error) {
    return next(error);
  }
}

export async function copySharedTrip(req, res, next) {
  try {
    const shared = await sql`SELECT * FROM shared_trips WHERE public_slug = ${req.params.slug} LIMIT 1`;
    if (shared.length === 0) return res.status(404).json({ success: false, error: 'Shared trip not found' });
    if (!shared[0].allow_copy) return res.status(403).json({ success: false, error: 'Copying not allowed' });

    const originalTripRows = await sql`SELECT * FROM trips WHERE id = ${shared[0].trip_id} LIMIT 1`;
    const originalTrip = originalTripRows[0];
    const newTripRows = await sql`
      INSERT INTO trips (
        id, user_id, title, description, trip_type, start_date, end_date, cover_image, visibility, status, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), ${req.user.id}, ${originalTrip.title}, ${originalTrip.description}, ${originalTrip.trip_type}, ${originalTrip.start_date}, ${originalTrip.end_date}, ${originalTrip.cover_image}, ${originalTrip.visibility}, ${originalTrip.status}, NOW(), NOW()
      )
      RETURNING *
    `;
    const newTrip = newTripRows[0];

    const stops = await sql`SELECT * FROM trip_stops WHERE trip_id = ${originalTrip.id} ORDER BY stop_order ASC`;
    const stopMap = new Map();
    for (const stop of stops) {
      const inserted = await sql`
        INSERT INTO trip_stops (
          id, trip_id, city_id, arrival_date, departure_date, stop_order, hotel_name, stay_type, hotel_cost, transport_cost, food_cost, notes, created_at
        ) VALUES (
          gen_random_uuid(), ${newTrip.id}, ${stop.city_id}, ${stop.arrival_date}, ${stop.departure_date}, ${stop.stop_order}, ${stop.hotel_name}, ${stop.stay_type}, ${stop.hotel_cost}, ${stop.transport_cost}, ${stop.food_cost}, ${stop.notes}, NOW()
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
          id, trip_stop_id, activity_id, activity_date, start_time, end_time, custom_notes, custom_cost, activity_order, created_at
        ) VALUES (
          gen_random_uuid(), ${stopMap.get(activity.old_stop_id)}, ${activity.activity_id}, ${activity.activity_date}, ${activity.start_time}, ${activity.end_time}, ${activity.custom_notes}, ${activity.custom_cost}, ${activity.activity_order}, NOW()
        )
      `;
    }

    return res.status(201).json({ success: true, data: { new_trip_id: newTrip.id } });
  } catch (error) {
    return next(error);
  }
}
