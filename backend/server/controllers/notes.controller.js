import sql from '../db/index.js';

async function ensureTrip(tripId, userId) {
  const rows = await sql`SELECT * FROM trips WHERE id = ${tripId} AND user_id = ${userId} LIMIT 1`;
  return rows[0] || null;
}

async function noteOwner(noteId, tripId, userId) {
  const rows = await sql`
    SELECT *
    FROM trip_notes
    WHERE id = ${noteId} AND trip_id = ${tripId} AND user_id = ${userId}
    LIMIT 1
  `;
  return rows[0] || null;
}

export async function getNotes(req, res, next) {
  try {
    const trip = await ensureTrip(req.params.id, req.user.id);
    if (!trip) return res.status(403).json({ success: false, error: 'Forbidden' });
    if (req.query.stop_id) {
      const rows = await sql`
        SELECT * FROM trip_notes
        WHERE trip_id = ${req.params.id} AND trip_stop_id = ${req.query.stop_id}
        ORDER BY created_at DESC
      `;
      return res.status(200).json({ success: true, data: rows });
    }
    const rows = await sql`
      SELECT * FROM trip_notes
      WHERE trip_id = ${req.params.id}
      ORDER BY created_at DESC
    `;
    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    return next(error);
  }
}

export async function createNote(req, res, next) {
  try {
    const trip = await ensureTrip(req.params.id, req.user.id);
    if (!trip) return res.status(403).json({ success: false, error: 'Forbidden' });
    const { title, content, trip_stop_id } = req.body;
    if (!title || !content) return res.status(400).json({ success: false, error: 'title and content are required' });
    const rows = await sql`
      INSERT INTO trip_notes (id, trip_id, trip_stop_id, user_id, title, content, created_at, updated_at)
      VALUES (gen_random_uuid(), ${req.params.id}, ${trip_stop_id || null}, ${req.user.id}, ${title}, ${content}, NOW(), NOW())
      RETURNING *
    `;
    return res.status(201).json({ success: true, data: rows[0] });
  } catch (error) {
    return next(error);
  }
}

export async function updateNote(req, res, next) {
  try {
    const trip = await ensureTrip(req.params.id, req.user.id);
    if (!trip) return res.status(403).json({ success: false, error: 'Forbidden' });
    const note = await noteOwner(req.params.noteId, req.params.id, req.user.id);
    if (!note) return res.status(404).json({ success: false, error: 'Note not found' });
    const allowed = ['title', 'content'];
    const sets = [];
    const values = [];
    for (const field of allowed) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        sets.push(`${field} = $${values.length + 1}`);
        values.push(req.body[field]);
      }
    }
    if (sets.length === 0) return res.status(400).json({ success: false, error: 'No valid fields provided' });
    values.push(req.params.noteId, req.params.id, req.user.id);
    const rows = await sql.unsafe(
      `UPDATE trip_notes SET ${sets.join(', ')}, updated_at = NOW() WHERE id = $${values.length - 2} AND trip_id = $${values.length - 1} AND user_id = $${values.length} RETURNING *`,
      values
    );
    return res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    return next(error);
  }
}

export async function deleteNote(req, res, next) {
  try {
    const trip = await ensureTrip(req.params.id, req.user.id);
    if (!trip) return res.status(403).json({ success: false, error: 'Forbidden' });
    const note = await noteOwner(req.params.noteId, req.params.id, req.user.id);
    if (!note) return res.status(404).json({ success: false, error: 'Note not found' });
    await sql`
      DELETE FROM trip_notes
      WHERE id = ${req.params.noteId} AND trip_id = ${req.params.id} AND user_id = ${req.user.id}
    `;
    return res.status(200).json({ success: true, data: { message: 'Note deleted successfully' } });
  } catch (error) {
    return next(error);
  }
}

export async function getLatestNotes(req, res, next) {
  try {
    const rows = await sql`
      SELECT tn.*, t.title AS trip_title, ts.stop_order, c.city_name, c.country
      FROM trip_notes tn
      JOIN trips t ON t.id = tn.trip_id
      LEFT JOIN trip_stops ts ON ts.id = tn.trip_stop_id
      LEFT JOIN cities c ON c.id = ts.city_id
      WHERE tn.user_id = ${req.user.id}
      ORDER BY tn.updated_at DESC, tn.created_at DESC
      LIMIT 10
    `;
    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    return next(error);
  }
}
