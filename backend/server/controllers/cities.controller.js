import sql from '../db/index.js';

export async function getCities(req, res, next) {
  try {
    const { search, country, sort_by = 'popularity', page = 1, limit = 20 } = req.query;
    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.max(parseInt(limit, 10) || 20, 1);
    const offset = (pageNumber - 1) * limitNumber;

    const filters = [];
    const values = [];

    if (search) {
      values.push(`%${search}%`);
      filters.push(`city_name ILIKE $${values.length}`);
    }

    if (country) {
      values.push(country);
      filters.push(`country = $${values.length}`);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    const orderBy =
      sort_by === 'cost'
        ? 'average_daily_cost ASC'
        : 'popularity_score DESC';

    const totalResult = await sql.unsafe(
      `SELECT COUNT(*)::int AS total FROM sqlcities ${whereClause}`,
      values
    );

    const cityValues = [...values, limitNumber, offset];
    const cities = await sql.unsafe(
      `SELECT * FROM sqlcities ${whereClause} ORDER BY ${orderBy} LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
      cityValues
    );

    return res.status(200).json({
      success: true,
      data: {
        cities,
        total: totalResult[0]?.total || 0,
        page: pageNumber,
        limit: limitNumber,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function getCityById(req, res, next) {
  try {
    const { id } = req.params;
    const rows = await sql`SELECT * FROM sqlcities WHERE id = ${id} LIMIT 1`;

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'City not found' });
    }

    return res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    return next(error);
  }
}
