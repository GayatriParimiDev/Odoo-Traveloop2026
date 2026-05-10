import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import sql from '../db/index.js';

dotenv.config();

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function safeUser(user) {
  const { password_hash, refresh_token, ...rest } = user;
  return rest;
}

export async function register(req, res, next) {
  try {
    const { username, full_name, email, password } = req.body;

    if (!username || !full_name || !email || !password) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    const existing = await sql`
      select id
      from users
      where email = ${email} or username = ${username}
      limit 1
    `;

    if (existing.length > 0) {
      return res.status(400).json({ success: false, error: 'Email or username already taken' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const rows = await sql`
      insert into users (
        id,
        username,
        full_name,
        email,
        password_hash,
        created_at,
        updated_at
      ) values (
        gen_random_uuid(),
        ${username},
        ${full_name},
        ${email},
        ${password_hash},
        now(),
        now()
      )
      returning id, username, full_name, email, avatar_url, bio, city, country, preferred_currency, created_at, updated_at
    `;

    const user = rows[0];
    const token = signToken(user);

    return res.status(201).json({ success: true, data: { token, user } });
  } catch (error) {
    return next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const rows = await sql`
      select *
      from users
      where email = ${email}
      limit 1
    `;

    if (rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const userRecord = rows[0];
    const isValid = await bcrypt.compare(password, userRecord.password_hash);

    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const token = signToken(userRecord);

    return res.status(200).json({
      success: true,
      data: { token, user: safeUser(userRecord) },
    });
  } catch (error) {
    return next(error);
  }
}

export async function me(req, res, next) {
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
