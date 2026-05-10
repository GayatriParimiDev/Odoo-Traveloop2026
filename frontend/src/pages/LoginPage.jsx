import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Field from '../components/Field';
import LogoMark from '../components/LogoMark';
import { login } from '../api';

const STORAGE_KEYS = {
  accessToken: 'traveloop_access_token',
  refreshToken: 'traveloop_refresh_token',
  user: 'traveloop_user',
};

function persistAuth({ accessToken, refreshToken, user }) {
  localStorage.setItem(STORAGE_KEYS.accessToken, accessToken);
  localStorage.setItem(STORAGE_KEYS.refreshToken, refreshToken);
  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await login(form);
      const { access_token, refresh_token, user } = res.data;
      persistAuth({
        accessToken: access_token,
        refreshToken: refresh_token,
        user,
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth auth--login">
      <div className="auth__login-backdrop" />
      <section className="login-card">
        <LogoMark />
        <h1 className="headline headline--center">Welcome Back</h1>
        <p className="lede lede--center">Sign in to continue your journey with Traveloop.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <Field
            label="Email address"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            autoComplete="email"
            icon={
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M4 6.5h16v11H4z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                <path
                  d="m4.5 7 7.5 6 7.5-6"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
          />

          <div className="field-row">
            <span className="field__label">Password</span>
            <Link to="/signup" className="text-link">
              Forgot password?
            </Link>
          </div>

          <Field
            hideLabel
            label="Password"
            type="password"
            placeholder="********"
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            autoComplete="current-password"
            icon={
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M7.5 10V8.1a4.5 4.5 0 0 1 9 0V10"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <rect x="5" y="10" width="14" height="10" rx="2.3" stroke="currentColor" strokeWidth="1.8" />
              </svg>
            }
            trailing={
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M2.5 12s3.7-6 9.5-6 9.5 6 9.5 6-3.7 6-9.5 6-9.5-6-9.5-6Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.8" />
              </svg>
            }
          />

          {error ? <div className="form-error">{error}</div> : null}

          <button className="primary-button" type="submit" disabled={loading}>
            <span>{loading ? 'Signing in...' : 'Sign in'}</span>
            <span aria-hidden="true" className="button-arrow">
              -&gt;
            </span>
          </button>


        </form>

        <p className="footer-copy">
          Don&apos;t have an account? <Link to="/signup">Sign up here</Link>
        </p>
      </section>
    </main>
  );
}
