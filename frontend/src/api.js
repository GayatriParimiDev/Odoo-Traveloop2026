const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:3000';

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = {
    Accept: 'application/json',
  };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.error || payload?.message || 'Request failed');
  }

  return payload;
}

export function register(payload) {
  return request('/api/auth/register', { method: 'POST', body: payload });
}

export function login(payload) {
  return request('/api/auth/login', { method: 'POST', body: payload });
}

export function refresh(refresh_token) {
  return request('/api/auth/refresh', { method: 'POST', body: { refresh_token } });
}

export function logout(refresh_token) {
  return request('/api/auth/logout', { method: 'POST', body: { refresh_token } });
}

export function getMe(token) {
  return request('/api/auth/me', { token });
}

export function isProductionApiConfigured() {
  return Boolean(import.meta.env.VITE_API_URL);
}

export function getTrips(token) {
  return request('/api/trips', { token });
}

export function getCities(token, params = {}) {
  const searchParams = new URLSearchParams();
  if (params.search) searchParams.set('search', params.search);
  if (params.country) searchParams.set('country', params.country);
  if (params.limit) searchParams.set('limit', String(params.limit));
  const qs = searchParams.toString();
  return request(`/api/cities${qs ? `?${qs}` : ''}`, { token });
}

export function getSavedDestinations(token) {
  return request('/api/users/saved', { token });
}
