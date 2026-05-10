import sql from '../db/index.js';

export async function getActivities(req, res, next) {
  try {
    const { city_id, category, max_cost, min_cost } = req.query;

    if (!city_id) {
      return res.status(400).json({ success: false, error: 'city_id is required' });
    }

    const filters = ['city_id = $1'];
    const values = [city_id];

    if (category) {
      values.push(category);
      filters.push(`category = $${values.length}`);
    }

    if (max_cost !== undefined) {
      values.push(max_cost);
      filters.push(`estimated_cost <= $${values.length}`);
    }

    if (min_cost !== undefined) {
      values.push(min_cost);
      filters.push(`estimated_cost >= $${values.length}`);
    }

    const rows = await sql.unsafe(
      `SELECT * FROM activities WHERE ${filters.join(' AND ')} ORDER BY rating DESC`,
      values
    );

    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    return next(error);
  }
}

export async function getActivityById(req, res, next) {
  try {
    const { id } = req.params;
    const rows = await sql`
      SELECT a.*, c.city_name, c.country
      FROM activities a
      JOIN sqlcities c ON a.city_id = c.id
      WHERE a.id = ${id}
      LIMIT 1
    `;

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Activity not found' });
    }

    return res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    return next(error);
  }
}
