import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import sql from '../db/index.js';

dotenv.config();

const ACCESS_TOKEN_TTL = process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_TOKEN_TTL = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS || 12);

function signAccessToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, username: user.username, token_type: 'access' },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_TTL }
  );
}

function signRefreshToken(user) {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  return jwt.sign(
    { id: user.id, token_type: 'refresh' },
    secret,
    { expiresIn: REFRESH_TOKEN_TTL }
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

    const password_hash = await bcrypt.hash(password, BCRYPT_ROUNDS);

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
        uuid_generate_v4(),
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
    const access_token = signAccessToken(user);
    const refresh_token = signRefreshToken(user);

    await sql`
      update users
      set refresh_token = ${refresh_token}
      where id = ${user.id}
    `;

    return res.status(201).json({ success: true, data: { access_token, refresh_token, user } });
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

    const access_token = signAccessToken(userRecord);
    const refresh_token = signRefreshToken(userRecord);

    await sql`
      update users
      set refresh_token = ${refresh_token}
      where id = ${userRecord.id}
    `;

    return res.status(200).json({
      success: true,
      data: { access_token, refresh_token, user: safeUser(userRecord) },
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

export async function refresh(req, res, next) {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({ success: false, error: 'Refresh token is required' });
    }

    const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
    const payload = jwt.verify(refresh_token, secret);

    const rows = await sql`
      select id, username, full_name, email, avatar_url, bio, city, country, preferred_currency, refresh_token
      from users
      where id = ${payload.id}
      limit 1
    `;

    if (rows.length === 0 || rows[0].refresh_token !== refresh_token) {
      return res.status(401).json({ success: false, error: 'Invalid refresh token' });
    }

    const user = rows[0];
    const access_token = signAccessToken(user);
    const next_refresh_token = signRefreshToken(user);

    await sql`
      update users
      set refresh_token = ${next_refresh_token}
      where id = ${user.id}
    `;

    return res.status(200).json({
      success: true,
      data: { access_token, refresh_token: next_refresh_token, user: safeUser(user) },
    });
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Invalid refresh token' });
  }
}

export async function logout(req, res, next) {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({ success: false, error: 'Refresh token is required' });
    }

    await sql`
      update users
      set refresh_token = null
      where refresh_token = ${refresh_token}
    `;

    return res.status(200).json({ success: true, data: { message: 'Logged out successfully' } });
  } catch (error) {
    return next(error);
  }
}
