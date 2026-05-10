import sql from '../db/index.js';

export async function getSavedDestinations(req, res, next) {
  try {
    const rows = await sql`
      SELECT sd.*, c.id AS city_id, c.city_name, c.country, c.average_daily_cost, c.popularity_score, c.image_url
      FROM saved_destinations sd
      JOIN cities c ON c.id = sd.city_id
      WHERE sd.user_id = ${req.user.id}
      ORDER BY sd.created_at DESC
    `;
    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    return next(error);
  }
}

export async function saveDestination(req, res, next) {
  try {
    const { city_id } = req.body;
    if (!city_id) return res.status(400).json({ success: false, error: 'city_id is required' });
    const city = await sql`SELECT * FROM cities WHERE id = ${city_id} LIMIT 1`;
    if (city.length === 0) return res.status(404).json({ success: false, error: 'City not found' });
    const rows = await sql`
      INSERT INTO saved_destinations (id, user_id, city_id, created_at)
      VALUES (gen_random_uuid(), ${req.user.id}, ${city_id}, NOW())
      RETURNING *
    `;
    return res.status(201).json({ success: true, data: rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ success: false, error: 'City already saved' });
    }
    return next(error);
  }
}

export async function deleteSavedDestination(req, res, next) {
  try {
    const rows = await sql`
      DELETE FROM saved_destinations
      WHERE user_id = ${req.user.id} AND city_id = ${req.params.cityId}
      RETURNING id
    `;
    if (rows.length === 0) return res.status(404).json({ success: false, error: 'Saved destination not found' });
    return res.status(200).json({ success: true, data: { message: 'Saved destination deleted successfully' } });
  } catch (error) {
    return next(error);
  }
}
