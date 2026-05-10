<<<<<<< HEAD
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
      persistAuth({ accessToken: access_token, refreshToken: refresh_token, user });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
=======
import { Link, useNavigate } from 'react-router-dom';
import Field from '../components/Field';
import LogoMark from '../components/LogoMark';

export default function LoginPage() {
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();
    navigate('/dashboard');
>>>>>>> 48dd08f68605d92a39284804b25ee5f88a71cc20
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
<<<<<<< HEAD
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            autoComplete="email"
=======
>>>>>>> 48dd08f68605d92a39284804b25ee5f88a71cc20
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
<<<<<<< HEAD
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            autoComplete="current-password"
=======
>>>>>>> 48dd08f68605d92a39284804b25ee5f88a71cc20
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

<<<<<<< HEAD
          {error ? <div className="form-error">{error}</div> : null}

          <button className="primary-button" type="submit" disabled={loading}>
            <span>{loading ? 'Signing in...' : 'Sign in'}</span>
=======
          <button className="primary-button" type="submit">
            <span>Sign in</span>
>>>>>>> 48dd08f68605d92a39284804b25ee5f88a71cc20
            <span aria-hidden="true" className="button-arrow">
              -&gt;
            </span>
          </button>

          <div className="divider">
            <span>Or continue with</span>
          </div>

<<<<<<< HEAD
          <button className="secondary-button" type="button" disabled>
=======
          <button className="secondary-button" type="button">
>>>>>>> 48dd08f68605d92a39284804b25ee5f88a71cc20
            <span className="google-mark" aria-hidden="true">
              G
            </span>
            <span>Google</span>
          </button>
        </form>

        <p className="footer-copy">
<<<<<<< HEAD
          Don&apos;t have an account? <Link to="/signup">Sign up here</Link>
=======
          Don't have an account? <Link to="/signup">Sign up here</Link>
>>>>>>> 48dd08f68605d92a39284804b25ee5f88a71cc20
        </p>
      </section>
    </main>
  );
}
