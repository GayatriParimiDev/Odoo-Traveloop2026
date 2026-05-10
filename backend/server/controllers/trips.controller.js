import sql from '../db/index.js';

async function getTripOwnership(tripId, userId) {
  const rows = await sql`
    SELECT * FROM trips
    WHERE id = ${tripId} AND user_id = ${userId}
    LIMIT 1
  `;
  return rows[0] || null;
}

export async function getTripById(tripId) {
  const rows = await sql`
    SELECT * FROM trips WHERE id = ${tripId} LIMIT 1
  `;
  return rows[0] || null;
}

export async function createTrip(req, res, next) {
  try {
    const {
      title,
      description = null,
      trip_type = 'solo',
      start_date,
      end_date,
      visibility = 'private',
      cover_image = null,
    } = req.body;

    if (!title || !start_date || !end_date) {
      return res.status(400).json({ success: false, error: 'Trip name and travel dates are required' });
    }

    const rows = await sql`
      INSERT INTO trips (
        id, user_id, title, description, trip_type, start_date, end_date, cover_image, visibility, created_at, updated_at
      ) VALUES (
        uuid_generate_v4(), ${req.user.id}, ${title}, ${description}, ${trip_type}, ${start_date}, ${end_date}, ${cover_image}, ${visibility}, NOW(), NOW()
      )
      RETURNING *
    `;

    return res.status(201).json({ success: true, data: rows[0] });
  } catch (error) {
    return next(error);
  }
}

export async function getTrips(req, res, next) {
  try {
    const rows = await sql`
      SELECT
        t.*,
        COALESCE((
          SELECT COUNT(*)::int
          FROM trip_stops ts
          WHERE ts.trip_id = t.id
        ), 0) AS stop_count
      FROM trips t
      WHERE user_id = ${req.user.id}
      ORDER BY created_at DESC
    `;

    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    return next(error);
  }
}

export async function getTrip(req, res, next) {
  try {
    const trip = await getTripById(req.params.id);
    if (!trip) {
      return res.status(404).json({ success: false, error: 'Trip not found' });
    }
    if (trip.user_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    const rows = await sql`
      SELECT t.*, (
        SELECT COUNT(*)::int FROM trip_stops ts WHERE ts.trip_id = t.id
      ) AS stop_count
      FROM trips t
      WHERE t.id = ${req.params.id}
      LIMIT 1
    `;

    return res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    return next(error);
  }
}

export async function updateTrip(req, res, next) {
  try {
    const trip = await getTripById(req.params.id);
    if (!trip) return res.status(404).json({ success: false, error: 'Trip not found' });
    if (trip.user_id !== req.user.id) return res.status(403).json({ success: false, error: 'Forbidden' });

    const allowed = ['title', 'description', 'trip_type', 'start_date', 'end_date', 'cover_image', 'visibility', 'status'];
    const sets = [];
    const values = [];
    for (const field of allowed) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        sets.push(`${field} = $${values.length + 1}`);
        values.push(req.body[field]);
      }
    }
    if (sets.length === 0) return res.status(400).json({ success: false, error: 'No valid fields provided' });
    values.push(req.params.id);

    const rows = await sql.unsafe(
      `UPDATE trips SET ${sets.join(', ')}, updated_at = NOW() WHERE id = $${values.length} RETURNING *`,
      values
    );

    return res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    return next(error);
  }
}

export async function deleteTrip(req, res, next) {
  try {
    const trip = await getTripById(req.params.id);
    if (!trip) return res.status(404).json({ success: false, error: 'Trip not found' });
    if (trip.user_id !== req.user.id) return res.status(403).json({ success: false, error: 'Forbidden' });

    await sql`DELETE FROM trips WHERE id = ${req.params.id}`;
    return res.status(200).json({ success: true, data: { message: 'Trip deleted successfully' } });
  } catch (error) {
    return next(error);
  }
}

async function ensureTripOwnership(tripId, userId) {
  const rows = await sql`
    SELECT id, user_id
    FROM trips
    WHERE id = ${tripId} AND user_id = ${userId}
    LIMIT 1
  `;
  return rows[0] || null;
}

async function ensureStopOwnership(tripId, stopId, userId) {
  const rows = await sql`
    SELECT ts.*
    FROM trip_stops ts
    JOIN trips t ON t.id = ts.trip_id
    WHERE ts.id = ${stopId} AND ts.trip_id = ${tripId} AND t.user_id = ${userId}
    LIMIT 1
  `;
  return rows[0] || null;
}

export async function createStop(req, res, next) {
  try {
    const ownership = await ensureTripOwnership(req.params.tripId, req.user.id);
    if (!ownership) return res.status(403).json({ success: false, error: 'Forbidden' });

    const { city_id, arrival_date, departure_date, stop_order, hotel_name, stay_type, hotel_cost, transport_cost, food_cost, notes } = req.body;
    const rows = await sql`
      INSERT INTO trip_stops (
        id, trip_id, city_id, arrival_date, departure_date, stop_order, hotel_name, stay_type, hotel_cost, transport_cost, food_cost, notes, created_at
      ) VALUES (
        gen_random_uuid(), ${req.params.tripId}, ${city_id}, ${arrival_date}, ${departure_date}, ${stop_order}, ${hotel_name}, ${stay_type}, ${hotel_cost}, ${transport_cost}, ${food_cost}, ${notes}, NOW()
      )
      RETURNING *
    `;

    return res.status(201).json({ success: true, data: rows[0] });
  } catch (error) {
    return next(error);
  }
}

export async function getStops(req, res, next) {
  try {
    const ownership = await ensureTripOwnership(req.params.tripId, req.user.id);
    if (!ownership) return res.status(403).json({ success: false, error: 'Forbidden' });

    const rows = await sql`
      SELECT ts.*, c.city_name, c.country, c.image_url
      FROM trip_stops ts
      JOIN cities c ON c.id = ts.city_id
      WHERE ts.trip_id = ${req.params.tripId}
      ORDER BY ts.stop_order ASC
    `;

    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    return next(error);
  }
}

export async function updateStop(req, res, next) {
  try {
    const ownership = await ensureStopOwnership(req.params.tripId, req.params.stopId, req.user.id);
    if (!ownership) return res.status(403).json({ success: false, error: 'Forbidden' });

    const allowed = ['arrival_date', 'departure_date', 'hotel_name', 'stay_type', 'hotel_cost', 'transport_cost', 'food_cost', 'notes'];
    const sets = [];
    const values = [];
    for (const field of allowed) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        sets.push(`${field} = $${values.length + 1}`);
        values.push(req.body[field]);
      }
    }
    if (sets.length === 0) return res.status(400).json({ success: false, error: 'No valid fields provided' });
    values.push(req.params.stopId);

    const rows = await sql.unsafe(
      `UPDATE trip_stops SET ${sets.join(', ')} WHERE id = $${values.length} RETURNING *`,
      values
    );

    return res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    return next(error);
  }
}

export async function deleteStop(req, res, next) {
  try {
    const ownership = await ensureStopOwnership(req.params.tripId, req.params.stopId, req.user.id);
    if (!ownership) return res.status(403).json({ success: false, error: 'Forbidden' });

    await sql`DELETE FROM trip_stops WHERE id = ${req.params.stopId}`;
    return res.status(200).json({ success: true, data: { message: 'Stop deleted successfully' } });
  } catch (error) {
    return next(error);
  }
}

export async function reorderStops(req, res, next) {
  try {
    const ownership = await ensureTripOwnership(req.params.tripId, req.user.id);
    if (!ownership) return res.status(403).json({ success: false, error: 'Forbidden' });

    const order = Array.isArray(req.body.order) ? req.body.order : [];
    for (const item of order) {
      const stop = await ensureStopOwnership(req.params.tripId, item.id, req.user.id);
      if (!stop) return res.status(403).json({ success: false, error: 'Forbidden' });
      await sql`UPDATE trip_stops SET stop_order = ${item.stop_order} WHERE id = ${item.id}`;
    }

    return res.status(200).json({ success: true, data: { message: 'Stops reordered successfully' } });
  } catch (error) {
    return next(error);
  }
}

async function verifyStopActivityOwnership(stopId, userId) {
  const rows = await sql`
    SELECT ts.id
    FROM trip_stops ts
    JOIN trips t ON t.id = ts.trip_id
    WHERE ts.id = ${stopId} AND t.user_id = ${userId}
    LIMIT 1
  `;
  return rows[0] || null;
}

export async function createStopActivity(req, res, next) {
  try {
    const ownership = await verifyStopActivityOwnership(req.params.stopId, req.user.id);
    if (!ownership) return res.status(403).json({ success: false, error: 'Forbidden' });

    const {
      activity_id,
      activity_date = null,
      start_time = null,
      end_time = null,
      custom_notes = null,
      custom_cost = 0,
      activity_order = 1,
    } = req.body;

    if (!activity_id) {
      return res.status(400).json({ success: false, error: 'activity_id is required' });
    }

    const rows = await sql`
      INSERT INTO trip_activities (
        id, trip_stop_id, activity_id, activity_date, start_time, end_time, custom_notes, custom_cost, activity_order, created_at
      ) VALUES (
        uuid_generate_v4(), ${req.params.stopId}, ${activity_id}, ${activity_date}, ${start_time}, ${end_time}, ${custom_notes}, ${custom_cost}, ${activity_order}, NOW()
      )
      RETURNING *
    `;

    return res.status(201).json({ success: true, data: rows[0] });
  } catch (error) {
    return next(error);
  }
}

export async function getStopActivities(req, res, next) {
  try {
    const ownership = await verifyStopActivityOwnership(req.params.stopId, req.user.id);
    if (!ownership) return res.status(403).json({ success: false, error: 'Forbidden' });

    const rows = await sql`
      SELECT
        ta.*,
        a.title,
        a.description,
        a.category,
        a.image_url,
        a.estimated_cost,
        a.estimated_duration_hours,
        a.rating
      FROM trip_activities ta
      JOIN activities a ON a.id = ta.activity_id
      WHERE ta.trip_stop_id = ${req.params.stopId}
      ORDER BY ta.activity_order ASC
    `;

    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    return next(error);
  }
}

export async function deleteStopActivity(req, res, next) {
  try {
    const ownership = await verifyStopActivityOwnership(req.params.stopId, req.user.id);
    if (!ownership) return res.status(403).json({ success: false, error: 'Forbidden' });

    await sql`DELETE FROM trip_activities WHERE id = ${req.params.id} AND trip_stop_id = ${req.params.stopId}`;
    return res.status(200).json({ success: true, data: { message: 'Activity deleted successfully' } });
  } catch (error) {
    return next(error);
  }
}

export async function getItinerary(req, res, next) {
  try {
    const trip = await getTripById(req.params.id);
    if (!trip) return res.status(404).json({ success: false, error: 'Trip not found' });
    if (trip.user_id !== req.user.id) return res.status(403).json({ success: false, error: 'Forbidden' });

    const stops = await sql`
      SELECT ts.*, c.city_name, c.country, c.image_url
      FROM trip_stops ts
      JOIN cities c ON c.id = ts.city_id
      WHERE ts.trip_id = ${req.params.id}
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
        return {
          ...stopFields,
          city: { city_name, country, image_url },
          activities,
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: {
        trip,
        stops: stopsWithActivities,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function getTripBudget(req, res, next) {
  try {
    const trip = await getTripById(req.params.id);
    if (!trip) return res.status(404).json({ success: false, error: 'Trip not found' });
    if (trip.user_id !== req.user.id) return res.status(403).json({ success: false, error: 'Forbidden' });

    const [expenseSummary] = await sql`
      SELECT
        COALESCE(SUM(amount), 0)::numeric AS total_expenses,
        COUNT(*)::int AS expense_count
      FROM trip_expenses
      WHERE trip_id = ${req.params.id}
    `;

    const categoryBreakdown = await sql`
      SELECT
        category,
        COALESCE(SUM(amount), 0)::numeric AS total
      FROM trip_expenses
      WHERE trip_id = ${req.params.id}
      GROUP BY category
      ORDER BY total DESC
    `;

    const [stopSummary] = await sql`
      SELECT
        COALESCE(SUM(total_stop_cost), 0)::numeric AS stop_total,
        COUNT(*)::int AS stop_count
      FROM trip_stops
      WHERE trip_id = ${req.params.id}
    `;

    const [activitySummary] = await sql`
      SELECT
        COALESCE(SUM(COALESCE(ta.custom_cost, a.estimated_cost, 0)), 0)::numeric AS activity_total,
        COUNT(*)::int AS activity_count
      FROM trip_activities ta
      LEFT JOIN activities a ON a.id = ta.activity_id
      JOIN trip_stops ts ON ts.id = ta.trip_stop_id
      WHERE ts.trip_id = ${req.params.id}
    `;

    return res.status(200).json({
      success: true,
      data: {
        trip_id: req.params.id,
        total_expenses: expenseSummary?.total_expenses || 0,
        expense_count: expenseSummary?.expense_count || 0,
        stop_total: stopSummary?.stop_total || 0,
        stop_count: stopSummary?.stop_count || 0,
        activity_total: activitySummary?.activity_total || 0,
        activity_count: activitySummary?.activity_count || 0,
        category_breakdown: categoryBreakdown,
        estimated_total_cost:
          Number(stopSummary?.stop_total || 0) + Number(activitySummary?.activity_total || 0),
      },
    });
  } catch (error) {
    return next(error);
  }
}
