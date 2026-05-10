import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ScreenFrame from '../components/ScreenFrame';
import { deleteAccount, getProfile, getSavedDestinations, updateProfile } from '../api';

const STORAGE_KEY = 'traveloop_access_token';
const LANGUAGE_KEY = 'traveloop_language';

function readToken() {
  return localStorage.getItem(STORAGE_KEY) || '';
}

function readLanguage() {
  return localStorage.getItem(LANGUAGE_KEY) || 'en';
}

function persistLanguage(language) {
  localStorage.setItem(LANGUAGE_KEY, language);
}

function AvatarPreview({ url, name }) {
  if (!url) {
    return <div className="profile-avatar">{(name || 'TR').slice(0, 2).toUpperCase()}</div>;
  }

  return <img className="profile-avatar profile-avatar--image" src={url} alt={`${name || 'User'} avatar`} />;
}

export default function ProfileSettingsPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    avatar_url: '',
    preferred_currency: 'INR',
  });
  const [language, setLanguage] = useState(readLanguage());
  const [profile, setProfile] = useState(null);
  const [savedDestinations, setSavedDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let active = true;

    async function loadSettings() {
      setLoading(true);
      setError('');
      try {
        const token = readToken();
        const [profileRes, savedRes] = await Promise.all([
          getProfile(token),
          getSavedDestinations(token),
        ]);

        if (!active) return;

        setProfile(profileRes.data);
        setForm({
          full_name: profileRes.data.full_name || '',
          email: profileRes.data.email || '',
          avatar_url: profileRes.data.avatar_url || '',
          preferred_currency: profileRes.data.preferred_currency || 'INR',
        });
        setSavedDestinations(savedRes.data || []);
      } catch (err) {
        if (!active) return;
        setError(err.message || 'Failed to load profile');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadSettings();
    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');

    try {
      const token = readToken();
      const response = await updateProfile(token, {
        full_name: form.full_name,
        email: form.email,
        avatar_url: form.avatar_url,
        preferred_currency: form.preferred_currency,
      });

      setProfile(response.data);
      setNotice('Profile updated successfully');
      persistLanguage(language);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAccount() {
    const confirmed = window.confirm('Delete your account permanently? This cannot be undone.');
    if (!confirmed) return;

    try {
      const token = readToken();
      await deleteAccount(token);
      localStorage.removeItem(STORAGE_KEY);
      navigate('/login', { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to delete account');
    }
  }

  return (
    <ScreenFrame
      eyebrow="Screen 11"
      title="Profile and Settings"
      description="Edit your traveler profile, preferences, and saved destinations from one place."
      actions={
        <>
          <button className="primary-button screen-button" type="submit" form="profile-form" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button className="secondary-button screen-button" type="button" onClick={handleDeleteAccount}>
            Delete Account
          </button>
        </>
      }
      aside={
        <div className="screen-summary">
          <div className="screen-summary__row">
            <strong>{profile?.preferred_currency || form.preferred_currency}</strong>
            <span>Preferred currency</span>
          </div>
          <div className="screen-summary__row">
            <strong>{language.toUpperCase()}</strong>
            <span>Language preference</span>
          </div>
        </div>
      }
    >
      <section className="screen-card screen-card--split">
        <div className="mini-panel">
          <div className="screen-card__header">
            <div>
              <h2>Profile Details</h2>
              <p>Editable fields for the account identity and preferences.</p>
            </div>
          </div>

          {loading ? <p className="screen-empty">Loading profile from the database...</p> : null}
          {error ? <p className="screen-empty screen-empty--error">{error}</p> : null}
          {notice ? <p className="screen-empty">{notice}</p> : null}

          <form id="profile-form" className="form-grid" onSubmit={handleSubmit}>
            <div className="profile-header">
              <AvatarPreview url={form.avatar_url} name={form.full_name} />
              <div>
                <span className="profile-header__label">Photo</span>
                <strong>{form.full_name || 'Traveler profile'}</strong>
              </div>
            </div>

            <label className="field field--wide">
              <span className="field__label">Full name</span>
              <span className="field__control">
                <input
                  type="text"
                  value={form.full_name}
                  onChange={(e) => setForm((prev) => ({ ...prev, full_name: e.target.value }))}
                  placeholder="Ananya Sharma"
                />
              </span>
            </label>

            <label className="field field--wide">
              <span className="field__label">Email</span>
              <span className="field__control">
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="ananya@example.com"
                />
              </span>
            </label>

            <label className="field field--wide">
              <span className="field__label">Photo URL</span>
              <span className="field__control">
                <input
                  type="url"
                  value={form.avatar_url}
                  onChange={(e) => setForm((prev) => ({ ...prev, avatar_url: e.target.value }))}
                  placeholder="https://..."
                />
              </span>
            </label>

            <div className="grid-two">
              <label className="field">
                <span className="field__label">Language</span>
                <span className="field__control">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                    <option value="fr">French</option>
                  </select>
                </span>
              </label>

              <label className="field">
                <span className="field__label">Currency</span>
                <span className="field__control">
                  <select
                    value={form.preferred_currency}
                    onChange={(e) => setForm((prev) => ({ ...prev, preferred_currency: e.target.value }))}
                  >
                    <option value="INR">INR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </span>
              </label>
            </div>
          </form>
        </div>

        <div className="mini-panel mini-panel--accent">
          <div className="screen-card__header">
            <div>
              <h2>Saved Destinations</h2>
              <p>Fetched from the saved destinations table.</p>
            </div>
          </div>

          <div className="chip-list">
            {savedDestinations.length === 0 ? (
              <p className="screen-empty">No saved destinations yet.</p>
            ) : (
              savedDestinations.map((destination) => (
                <span className="chip chip--static" key={destination.id}>
                  {destination.city_name}
                </span>
              ))
            )}
          </div>
        </div>
      </section>
    </ScreenFrame>
  );
}
