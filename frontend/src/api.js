const API_BASE =
  (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/$/, '');

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.error || 'Request failed');
  }

  return payload;
}

export function register(data) {
  return request('/auth/register', { method: 'POST', body: data });
}

export function login(data) {
  return request('/auth/login', { method: 'POST', body: data });
}

export function getDashboardOverview(token) {
  return request('/dashboard/overview', { token });
}

export function getTrips(token) {
  return request('/trips', { token });
}

export function getTrip(token, id) {
  return request(`/trips/${id}`, { token });
}

export function deleteTrip(token, id) {
  return request(`/trips/${id}`, { method: 'DELETE', token });
}

export function getCities(params = {}) {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.set('search', params.search);
  if (params.country) searchParams.set('country', params.country);
  if (params.sort_by) searchParams.set('sort_by', params.sort_by);
  if (params.limit) searchParams.set('limit', String(params.limit));

  const queryString = searchParams.toString();
  return request(`/cities${queryString ? `?${queryString}` : ''}`);
}
