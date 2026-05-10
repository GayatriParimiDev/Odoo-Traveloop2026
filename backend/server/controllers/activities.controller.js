import sql from '../db/index.js';

export async function getActivities(req, res, next) {
  try {
    const { city_id, category, max_cost, min_cost, search, page = 1, limit = 24 } = req.query;
    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.max(parseInt(limit, 10) || 24, 1);
    const offset = (pageNumber - 1) * limitNumber;

    const filters = [];
    const values = [];

    if (city_id) {
      values.push(city_id);
      filters.push(`a.city_id = $${values.length}`);
    }

    if (category) {
      values.push(category);
      filters.push(`a.category = $${values.length}`);
    }

    if (max_cost !== undefined) {
      values.push(max_cost);
      filters.push(`a.estimated_cost <= $${values.length}`);
    }

    if (min_cost !== undefined) {
      values.push(min_cost);
      filters.push(`a.estimated_cost >= $${values.length}`);
    }

    if (search) {
      values.push(`%${search}%`);
      filters.push(`(a.title ILIKE $${values.length} OR a.description ILIKE $${values.length})`);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const totalResult = await sql.unsafe(
      `SELECT COUNT(*)::int AS total
       FROM activities a
       ${whereClause}`,
      values
    );

    const listValues = [...values, limitNumber, offset];
    const rows = await sql.unsafe(
      `
        SELECT a.*, c.city_name, c.country, c.average_daily_cost, c.popularity_score
        FROM activities a
        JOIN cities c ON c.id = a.city_id
        ${whereClause}
        ORDER BY COALESCE(a.rating, 0) DESC, a.title ASC
        LIMIT $${values.length + 1}
        OFFSET $${values.length + 2}
      `,
      listValues
    );

    return res.status(200).json({
      success: true,
      data: {
        activities: rows,
        total: totalResult[0]?.total || 0,
        page: pageNumber,
        limit: limitNumber,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function getActivityById(req, res, next) {
  try {
    const { id } = req.params;
    const rows = await sql`
      SELECT a.*, c.city_name, c.country, c.average_daily_cost, c.popularity_score
      FROM activities a
      JOIN cities c ON a.city_id = c.id
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
