import sql from '../db/index.js';

export async function getDashboardOverview(req, res, next) {
  try {
    const recentTrips = await sql`
      SELECT
        t.*,
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
      FROM trips t
      WHERE t.user_id = ${req.user.id}
      ORDER BY t.created_at DESC
      LIMIT 3
    `;

    const recommendations = await sql`
      SELECT id, city_name, country, average_daily_cost, popularity_score, description, image_url
      FROM cities
      ORDER BY popularity_score DESC, average_daily_cost ASC
      LIMIT 4
    `;

    const [stats] = await sql`
      SELECT
        (SELECT COUNT(*)::int FROM trips WHERE user_id = ${req.user.id}) AS trip_count,
        (SELECT COUNT(*)::int FROM saved_destinations WHERE user_id = ${req.user.id}) AS saved_count,
        (SELECT COUNT(*)::int FROM trip_notes WHERE user_id = ${req.user.id}) AS note_count,
        (SELECT COUNT(*)::int FROM packing_items pi JOIN trips t ON t.id = pi.trip_id WHERE t.user_id = ${req.user.id}) AS packing_count,
        (SELECT COUNT(*)::int FROM shared_trips st JOIN trips t ON t.id = st.trip_id WHERE t.user_id = ${req.user.id}) AS shared_count
    `;

    const [latestTrip] = recentTrips;
    const budget = latestTrip
      ? {
          trip_id: latestTrip.id,
          title: latestTrip.title,
          stop_total: latestTrip.stop_total || 0,
          activity_total: latestTrip.activity_total || 0,
          estimated_total_cost: Number(latestTrip.stop_total || 0) + Number(latestTrip.activity_total || 0),
          stop_count: latestTrip.stop_count || 0,
          activity_count: latestTrip.activity_count || 0,
        }
      : null;

    return res.status(200).json({
      success: true,
      data: {
        stats,
        recent_trips: recentTrips,
        recommendations,
        budget,
      },
    });
  } catch (error) {
    return next(error);
  }
}
