import sql from '../db/index.js';

async function ensureTrip(tripId, userId) {
  const rows = await sql`SELECT * FROM trips WHERE id = ${tripId} AND user_id = ${userId} LIMIT 1`;
  return rows[0] || null;
}

export async function getChecklist(req, res, next) {
  try {
    const trip = await ensureTrip(req.params.id, req.user.id);
    if (!trip) return res.status(403).json({ success: false, error: 'Forbidden' });
    const rows = await sql`SELECT * FROM packing_items WHERE trip_id = ${req.params.id} ORDER BY created_at DESC`;
    const grouped = { clothing: [], electronics: [], documents: [], medical: [], toiletries: [], other: [] };
    for (const item of rows) {
      (grouped[item.category] || grouped.other).push(item);
    }
    return res.status(200).json({ success: true, data: grouped });
  } catch (error) {
    return next(error);
  }
}

export async function createChecklistItem(req, res, next) {
  try {
    const trip = await ensureTrip(req.params.id, req.user.id);
    if (!trip) return res.status(403).json({ success: false, error: 'Forbidden' });
    const { item_name, category, quantity } = req.body;
    if (!item_name || !category || quantity === undefined) {
      return res.status(400).json({ success: false, error: 'item_name, category, and quantity are required' });
    }
    const rows = await sql`
      INSERT INTO packing_items (id, trip_id, item_name, category, quantity, is_packed, created_at)
      VALUES (gen_random_uuid(), ${req.params.id}, ${item_name}, ${category}, ${quantity}, false, NOW())
      RETURNING *
    `;
    return res.status(201).json({ success: true, data: rows[0] });
  } catch (error) {
    return next(error);
  }
}

export async function toggleChecklistItem(req, res, next) {
  try {
    const trip = await ensureTrip(req.params.id, req.user.id);
    if (!trip) return res.status(403).json({ success: false, error: 'Forbidden' });
    const rows = await sql`
      UPDATE packing_items
      SET is_packed = NOT is_packed
      WHERE id = ${req.params.itemId} AND trip_id = ${req.params.id}
      RETURNING *
    `;
    if (rows.length === 0) return res.status(404).json({ success: false, error: 'Item not found' });
    return res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    return next(error);
  }
}

export async function deleteChecklistItem(req, res, next) {
  try {
    const trip = await ensureTrip(req.params.id, req.user.id);
    if (!trip) return res.status(403).json({ success: false, error: 'Forbidden' });
    const rows = await sql`
      DELETE FROM packing_items
      WHERE id = ${req.params.itemId} AND trip_id = ${req.params.id}
      RETURNING id
    `;
    if (rows.length === 0) return res.status(404).json({ success: false, error: 'Item not found' });
    return res.status(200).json({ success: true, data: { message: 'Item deleted successfully' } });
  } catch (error) {
    return next(error);
  }
}

export async function resetChecklist(req, res, next) {
  try {
    const trip = await ensureTrip(req.params.id, req.user.id);
    if (!trip) return res.status(403).json({ success: false, error: 'Forbidden' });
    const rows = await sql`
      UPDATE packing_items
      SET is_packed = false
      WHERE trip_id = ${req.params.id}
      RETURNING id
    `;
    return res.status(200).json({ success: true, data: { reset_count: rows.length } });
  } catch (error) {
    return next(error);
  }
}
