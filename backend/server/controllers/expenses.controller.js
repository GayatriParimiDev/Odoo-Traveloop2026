import sql from '../db/index.js';

async function ensureTrip(tripId, userId) {
  const rows = await sql`SELECT * FROM trips WHERE id = ${tripId} AND user_id = ${userId} LIMIT 1`;
  return rows[0] || null;
}

export async function createExpense(req, res, next) {
  try {
    const trip = await ensureTrip(req.params.id, req.user.id);
    if (!trip) return res.status(403).json({ success: false, error: 'Forbidden' });

    const { category, title, amount, payment_method, receipt_url, expense_date, expense_time, notes } = req.body;
    if (!category || !title || amount === undefined) {
      return res.status(400).json({ success: false, error: 'category, title, and amount are required' });
    }

    const rows = await sql`
      INSERT INTO trip_expenses (
        id, trip_id, category, title, amount, payment_method, receipt_url, expense_date, expense_time, notes, created_at
      ) VALUES (
        gen_random_uuid(), ${req.params.id}, ${category}, ${title}, ${amount}, ${payment_method}, ${receipt_url}, ${expense_date}, ${expense_time}, ${notes}, NOW()
      )
      RETURNING *
    `;
    return res.status(201).json({ success: true, data: rows[0] });
  } catch (error) {
    return next(error);
  }
}

export async function getExpenses(req, res, next) {
  try {
    const trip = await ensureTrip(req.params.id, req.user.id);
    if (!trip) return res.status(403).json({ success: false, error: 'Forbidden' });

    if (req.query.category) {
      const rows = await sql`
        SELECT *
        FROM trip_expenses
        WHERE trip_id = ${req.params.id} AND category = ${req.query.category}
        ORDER BY expense_date DESC, created_at DESC
      `;
      return res.status(200).json({ success: true, data: rows });
    }

    const rows = await sql`
      SELECT *
      FROM trip_expenses
      WHERE trip_id = ${req.params.id}
      ORDER BY expense_date DESC, created_at DESC
    `;
    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    return next(error);
  }
}

export async function updateExpense(req, res, next) {
  try {
    const trip = await ensureTrip(req.params.id, req.user.id);
    if (!trip) return res.status(403).json({ success: false, error: 'Forbidden' });

    const allowed = ['category', 'title', 'amount', 'payment_method', 'notes'];
    const sets = [];
    const values = [];
    for (const field of allowed) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        sets.push(`${field} = $${values.length + 1}`);
        values.push(req.body[field]);
      }
    }
    if (sets.length === 0) return res.status(400).json({ success: false, error: 'No valid fields provided' });
    values.push(req.params.expenseId, req.params.id);

    const rows = await sql.unsafe(
      `UPDATE trip_expenses SET ${sets.join(', ')} WHERE id = $${values.length - 1} AND trip_id = $${values.length} RETURNING *`,
      values
    );
    if (rows.length === 0) return res.status(404).json({ success: false, error: 'Expense not found' });
    return res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    return next(error);
  }
}

export async function deleteExpense(req, res, next) {
  try {
    const trip = await ensureTrip(req.params.id, req.user.id);
    if (!trip) return res.status(403).json({ success: false, error: 'Forbidden' });
    const rows = await sql`
      DELETE FROM trip_expenses
      WHERE id = ${req.params.expenseId} AND trip_id = ${req.params.id}
      RETURNING id
    `;
    if (rows.length === 0) return res.status(404).json({ success: false, error: 'Expense not found' });
    return res.status(200).json({ success: true, data: { message: 'Expense deleted successfully' } });
  } catch (error) {
    return next(error);
  }
}

export async function getBudgetSummary(req, res, next) {
  try {
    const trip = await ensureTrip(req.params.id, req.user.id);
    if (!trip) return res.status(403).json({ success: false, error: 'Forbidden' });

    const [totals] = await sql`
      SELECT
        COALESCE(SUM(amount), 0)::numeric AS total,
        COUNT(*)::int AS count
      FROM trip_expenses
      WHERE trip_id = ${req.params.id}
    `;

    const categories = await sql`
      SELECT category, COALESCE(SUM(amount), 0)::numeric AS total
      FROM trip_expenses
      WHERE trip_id = ${req.params.id}
      GROUP BY category
      ORDER BY total DESC
    `;

    const [transport] = await sql`
      SELECT COALESCE(SUM(transport_cost), 0)::numeric AS total
      FROM trip_stops
      WHERE trip_id = ${req.params.id}
    `;

    const [stay] = await sql`
      SELECT COALESCE(SUM(hotel_cost), 0)::numeric AS total
      FROM trip_stops
      WHERE trip_id = ${req.params.id}
    `;

    const [food] = await sql`
      SELECT COALESCE(SUM(food_cost), 0)::numeric AS total
      FROM trip_stops
      WHERE trip_id = ${req.params.id}
    `;

    const [activities] = await sql`
      SELECT COALESCE(SUM(COALESCE(ta.custom_cost, a.estimated_cost, 0)), 0)::numeric AS total
      FROM trip_activities ta
      LEFT JOIN activities a ON a.id = ta.activity_id
      JOIN trip_stops ts ON ts.id = ta.trip_stop_id
      WHERE ts.trip_id = ${req.params.id}
    `;

    return res.status(200).json({
      success: true,
      data: {
        trip_id: req.params.id,
        expenses_total: totals?.total || 0,
        expense_count: totals?.count || 0,
        categories,
        trip_costs: {
          transport: transport?.total || 0,
          stay: stay?.total || 0,
          food: food?.total || 0,
          activities: activities?.total || 0,
        },
        total_planned:
          Number(transport?.total || 0) +
          Number(stay?.total || 0) +
          Number(food?.total || 0) +
          Number(activities?.total || 0),
      },
    });
  } catch (error) {
    return next(error);
  }
}
