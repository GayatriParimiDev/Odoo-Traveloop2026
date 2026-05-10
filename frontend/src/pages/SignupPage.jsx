import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Field from '../components/Field';
import { register } from '../api';

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

export default function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    full_name: '',
    email: '',
    password: '',
    city: '',
    country: '',
    bio: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await register(form);
      const { access_token, refresh_token, user } = res.data;
      persistAuth({ accessToken: access_token, refreshToken: refresh_token, user });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth auth--signup">
      <section className="signup-visual" />

      <section className="signup-panel">
        <div className="signup-panel__inner">
          <h1 className="headline">Join the Journey</h1>
          <p className="lede">Create your account to unlock premium travel experiences.</p>

          <form className="auth-form auth-form--signup" onSubmit={handleSubmit}>
            <div className="grid-two">
              <Field
                label="Username"
                placeholder="janedoe"
                value={form.username}
                onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
                autoComplete="username"
              />
              <Field
                label="Full Name"
                placeholder="Jane Doe"
                value={form.full_name}
                onChange={(e) => setForm((prev) => ({ ...prev, full_name: e.target.value }))}
                autoComplete="name"
              />
            </div>

            <Field
              label="Email Address"
              type="email"
              placeholder="jane@example.com"
              wide
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              autoComplete="email"
            />

            <div className="grid-two">
              <Field
                label="City"
                placeholder="Paris"
                value={form.city}
                onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
              />
              <Field
                label="Country"
                placeholder="France"
                value={form.country}
                onChange={(e) => setForm((prev) => ({ ...prev, country: e.target.value }))}
              />
            </div>

            <Field
              label="Password"
              type="password"
              placeholder="********"
              wide
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              autoComplete="new-password"
            />

            <label className="field field--wide">
              <span className="field__label">Travel Bio</span>
              <span className="field__control field__control--textarea">
                <textarea
                  placeholder="What kind of traveler are you?"
                  value={form.bio}
                  onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))}
                />
              </span>
            </label>

            {error ? <div className="form-error">{error}</div> : null}

            <button className="primary-button primary-button--signup" type="submit" disabled={loading}>
              <span>{loading ? 'Creating account...' : 'Create Account'}</span>
            </button>

            <p className="footer-copy footer-copy--signup">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
