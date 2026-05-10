const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

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
