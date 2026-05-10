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
    if (!category) return res.status(400).json({ success: false, error: 'category is required' });

    const rows = await sql`
      INSERT INTO sqltrip_expenses (
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
        FROM sqltrip_expenses
        WHERE trip_id = ${req.params.id} AND category = ${req.query.category}
        ORDER BY expense_date DESC, created_at DESC
      `;
      return res.status(200).json({ success: true, data: rows });
    }

    const rows = await sql`
      SELECT *
      FROM sqltrip_expenses
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
      `UPDATE sqltrip_expenses SET ${sets.join(', ')} WHERE id = $${values.length - 1} AND trip_id = $${values.length} RETURNING *`,
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
      DELETE FROM sqltrip_expenses
      WHERE id = ${req.params.expenseId} AND trip_id = ${req.params.id}
      RETURNING id
    `;
    if (rows.length === 0) return res.status(404).json({ success: false, error: 'Expense not found' });
    return res.status(200).json({ success: true, data: { message: 'Expense deleted successfully' } });
  } catch (error) {
    return next(error);
  }
}
