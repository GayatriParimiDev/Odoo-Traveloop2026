import dotenv from 'dotenv';
import sql from '../db/index.js';

dotenv.config();

export async function getProfile(req, res, next) {
  try {
    const rows = await sql`
      select id, username, full_name, email, avatar_url, bio, city, country, preferred_currency, created_at, updated_at
      from users
      where id = ${req.user.id}
      limit 1
    `;

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    return res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    return next(error);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const allowedFields = [
      'full_name',
      'email',
      'avatar_url',
      'bio',
      'city',
      'country',
      'preferred_currency',
    ];

    const updates = [];
    const values = [];

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates.push(`${field} = $${updates.length + 1}`);
        values.push(req.body[field]);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, error: 'No valid fields provided' });
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'email')) {
      const duplicate = await sql`
        select id
        from users
        where email = ${req.body.email} and id <> ${req.user.id}
        limit 1
      `;

      if (duplicate.length > 0) {
        return res.status(409).json({ success: false, error: 'Email already in use' });
      }
    }

    values.push(req.user.id);

    const query = `
      update users
      set ${updates.join(', ')}, updated_at = now()
      where id = $${values.length}
      returning id, username, full_name, email, avatar_url, bio, city, country, preferred_currency, created_at, updated_at
    `;

    const rows = await sql.unsafe(query, values);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    return res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    return next(error);
  }
}

export async function deleteAccount(req, res, next) {
  try {
    const rows = await sql`
      delete from users
      where id = ${req.user.id}
      returning id
    `;

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    return res.status(200).json({ success: true, data: { message: 'Account deleted successfully' } });
  } catch (error) {
    return next(error);
  }
}
