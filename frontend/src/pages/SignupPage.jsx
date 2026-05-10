import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
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
    first_name: '',
    last_name: '',
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
      const payload = {
        username: form.username.trim(),
        full_name: `${form.first_name.trim()} ${form.last_name.trim()}`.trim(),
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        password: form.password,
        city: form.city.trim(),
        country: form.country.trim(),
        bio: form.bio.trim(),
      };

      const res = await register(payload);
      const { access_token, refresh_token, user } = res.data;
      persistAuth({
        accessToken: access_token,
        refreshToken: refresh_token,
        user,
      });
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
            <div className="photo-picker">
              <div className="photo-picker__circle" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4.8 7.5h3l1.4-2h5l1.4 2h3.4v10.8H4.8z"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinejoin="round"
                  />
                  <circle cx="12" cy="13" r="2.7" stroke="currentColor" strokeWidth="1.7" />
                  <path d="M18.2 5.8v3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                  <path d="M16.7 7.3h3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                </svg>
              </div>
              <span className="photo-picker__label">Profile Photo</span>
            </div>

            <Field
              label="Username"
              placeholder="janedoe"
              value={form.username}
              onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
              autoComplete="username"
              wide
            />

            <div className="grid-two">
              <Field
                label="First Name"
                placeholder="Jane"
                value={form.first_name}
                onChange={(event) => setForm((prev) => ({ ...prev, first_name: event.target.value }))}
                autoComplete="given-name"
              />
              <Field
                label="Last Name"
                placeholder="Doe"
                value={form.last_name}
                onChange={(event) => setForm((prev) => ({ ...prev, last_name: event.target.value }))}
                autoComplete="family-name"
              />
            </div>

            <Field
              label="Email Address"
              type="email"
              placeholder="jane@example.com"
              wide
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              autoComplete="email"
            />

            <Field
              label="Password"
              type="password"
              placeholder="********"
              wide
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              autoComplete="new-password"
            />

            <div className="grid-two">
              <Field
                label="City"
                placeholder="Paris"
                value={form.city}
                onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))}
              />
              <Field
                label="Country"
                placeholder="France"
                value={form.country}
                onChange={(event) => setForm((prev) => ({ ...prev, country: event.target.value }))}
              />
            </div>

            <label className="field field--wide">
              <span className="field__label">Travel Bio</span>
              <span className="field__control field__control--textarea">
                <textarea
                  placeholder="What kind of traveler are you?"
                  value={form.bio}
                  onChange={(event) => setForm((prev) => ({ ...prev, bio: event.target.value }))}
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
