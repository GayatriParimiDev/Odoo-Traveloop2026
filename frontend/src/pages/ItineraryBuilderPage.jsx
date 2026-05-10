import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AppIcon from '../components/AppIcon';
import ScreenFrame from '../components/ScreenFrame';
import { createTrip, getTrip } from '../api';

const STORAGE_KEY = 'traveloop_access_token';

const DEFAULT_FORM = {
  title: '',
  description: '',
  trip_type: 'solo',
  start_date: '',
  end_date: '',
  cover_image: '/images/dashboard_background.png',
  visibility: 'private',
};

const previewStops = [
  { city: 'Tokyo', dates: '12 Apr - 15 Apr', notes: 'Arrival and city orientation' },
  { city: 'Kyoto', dates: '15 Apr - 18 Apr', notes: 'Temples, food, and gardens' },
  { city: 'Osaka', dates: '18 Apr - 22 Apr', notes: 'Night markets and departure' },
];

const activityOptions = ['Tea ceremony', 'Rail pass pickup', 'Temple walk', 'Food tour', 'Local market'];

function readToken() {
  return localStorage.getItem(STORAGE_KEY) || '';
}

export default function ItineraryBuilderPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [loadingTrip, setLoadingTrip] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const token = readToken();
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    const tripId = searchParams.get('tripId');
    if (!tripId) {
      return;
    }

    let active = true;

    async function loadTrip() {
      setLoadingTrip(true);
      setError('');

      try {
        const res = await getTrip(token, tripId);
        if (!active) {
          return;
        }

        const trip = res.data;
        setEditMode(true);
        setForm({
          title: trip.title || '',
          description: trip.description || '',
          trip_type: trip.trip_type || 'solo',
          start_date: trip.start_date || '',
          end_date: trip.end_date || '',
          cover_image: trip.cover_image || '/images/dashboard_background.png',
          visibility: trip.visibility || 'private',
        });
        setNotice('Editing existing trip');
      } catch (err) {
        if (active) {
          setError(err.message || 'Unable to load trip');
        }
      } finally {
        if (active) {
          setLoadingTrip(false);
        }
      }
    }

    loadTrip();

    return () => {
      active = false;
    };
  }, [navigate, searchParams]);

  function handleChange(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setNotice('');

    const token = readToken();

    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    if (!form.title.trim() || !form.description.trim() || !form.start_date || !form.end_date) {
      setError('Title, description, start date, and end date are required');
      setLoading(false);
      return;
    }

    if (new Date(form.start_date) > new Date(form.end_date)) {
      setError('Start date must be on or before end date');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        trip_type: form.trip_type,
        start_date: form.start_date,
        end_date: form.end_date,
        cover_image: form.cover_image.trim() || '/images/dashboard_background.png',
        visibility: form.visibility,
      };

      const response = await createTrip(payload, token);
      const trip = response.data;
      setNotice(editMode ? 'Trip updated' : 'Trip created successfully');
      navigate(`/trips?created=${trip.id}`, { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to create trip');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenFrame
      eyebrow="Screen 4"
      title="Itinerary Builder"
      description="Create a new trip, define the core dates, and then add stops, activities, and checklist items."
      actions={
        <>
          <button className="primary-button screen-button" type="submit" form="trip-create-form" disabled={loading || loadingTrip}>
            <span>{editMode ? 'Save Changes' : 'Create Trip'}</span>
            <span aria-hidden="true">-&gt;</span>
          </button>
          <button className="secondary-button screen-button" type="button" onClick={() => setForm(DEFAULT_FORM)} disabled={loading || loadingTrip}>
            Reset
          </button>
        </>
      }
      aside={
        <div className="screen-summary">
          <div className="screen-summary__row">
            <strong>{form.start_date && form.end_date ? Math.max(1, Math.round((new Date(form.end_date) - new Date(form.start_date)) / 86400000) + 1) : 0} days</strong>
            <span>Trip length</span>
          </div>
          <div className="screen-summary__row">
            <strong>{form.visibility}</strong>
            <span>Visibility</span>
          </div>
          <div className="screen-summary__row">
            <strong>{form.trip_type}</strong>
            <span>Trip type</span>
          </div>
        </div>
      }
    >
      {error ? <div className="form-error">{error}</div> : null}
      {notice ? <div className="checklist-banner checklist-banner--notice">{notice}</div> : null}

      <section className="screen-card screen-card--split">
        <div className="mini-panel">
          <div className="screen-card__header">
            <div>
              <h2>{editMode ? 'Edit Trip' : 'Create Trip'}</h2>
              <p>Start with the main trip details. You can add stops next from the trip screen.</p>
            </div>
            <span className="screen-pill">{loadingTrip ? 'Loading...' : 'Ready'}</span>
          </div>

          <form id="trip-create-form" className="form-grid" onSubmit={handleSubmit}>
            <label className="field field--wide">
              <span className="field__label">Trip Title</span>
              <span className="field__control">
                <input
                  type="text"
                  placeholder="Cherry Blossom 2026"
                  value={form.title}
                  onChange={(event) => handleChange('title', event.target.value)}
                />
              </span>
            </label>

            <label className="field field--wide">
              <span className="field__label">Description</span>
              <span className="field__control field__control--textarea">
                <textarea
                  placeholder="What is this trip about?"
                  value={form.description}
                  onChange={(event) => handleChange('description', event.target.value)}
                />
              </span>
            </label>

            <label className="field">
              <span className="field__label">Trip Type</span>
              <span className="field__control">
                <select value={form.trip_type} onChange={(event) => handleChange('trip_type', event.target.value)}>
                  <option value="solo">Solo</option>
                  <option value="couple">Couple</option>
                  <option value="family">Family</option>
                  <option value="friends">Friends</option>
                  <option value="business">Business</option>
                </select>
              </span>
            </label>

            <label className="field">
              <span className="field__label">Visibility</span>
              <span className="field__control">
                <select value={form.visibility} onChange={(event) => handleChange('visibility', event.target.value)}>
                  <option value="private">Private</option>
                  <option value="public">Public</option>
                </select>
              </span>
            </label>

            <label className="field">
              <span className="field__label">Start Date</span>
              <span className="field__control">
                <input
                  type="date"
                  value={form.start_date}
                  onChange={(event) => handleChange('start_date', event.target.value)}
                />
              </span>
            </label>

            <label className="field">
              <span className="field__label">End Date</span>
              <span className="field__control">
                <input
                  type="date"
                  value={form.end_date}
                  onChange={(event) => handleChange('end_date', event.target.value)}
                />
              </span>
            </label>

            <label className="field field--wide">
              <span className="field__label">Cover Image URL</span>
              <span className="field__control">
                <input
                  type="text"
                  placeholder="/images/dashboard_background.png"
                  value={form.cover_image}
                  onChange={(event) => handleChange('cover_image', event.target.value)}
                />
              </span>
            </label>
          </form>
        </div>

        <div className="mini-panel mini-panel--accent">
          <div className="screen-card__header">
            <div>
              <h2>How it works</h2>
              <p>After creating the trip, use the trip pages to add stops, activities, budget, notes, and checklist items.</p>
            </div>
          </div>

          <div className="chip-list">
            {['Add stops', 'Map activities', 'Track budget', 'Build checklist', 'Share publicly'].map((activity) => (
              <button className="chip chip--static" type="button" key={activity}>
                {activity}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="screen-card">
        <div className="screen-card__header">
          <div>
            <h2>Preview</h2>
            <p>A template itinerary to show how the builder evolves after you create the trip.</p>
          </div>
          <span className="screen-pill">Draft view</span>
        </div>

        <div className="stop-list">
          {previewStops.map((stop, index) => (
            <article className="stop-item" key={stop.city}>
              <div className="stop-item__index">{index + 1}</div>
              <div className="stop-item__copy">
                <strong>{stop.city}</strong>
                <span>{stop.dates}</span>
                <p>{stop.notes}</p>
              </div>
              <button className="stop-item__drag" type="button" aria-label={`Move ${stop.city}`}>
                <AppIcon kind="spark" />
              </button>
            </article>
          ))}
        </div>

        <div className="screen-card screen-card--split" style={{ marginTop: '1rem' }}>
          <div className="mini-panel">
            <div className="screen-card__header">
              <div>
                <h2>Add Stop</h2>
                <p>These controls become active after the trip is created.</p>
              </div>
            </div>
            <div className="form-grid">
              <label className="field">
                <span className="field__label">City</span>
                <span className="field__control">
                  <input type="text" placeholder="Search city" disabled />
                </span>
              </label>
              <label className="field">
                <span className="field__label">Arrival</span>
                <span className="field__control">
                  <input type="date" disabled />
                </span>
              </label>
              <label className="field">
                <span className="field__label">Departure</span>
                <span className="field__control">
                  <input type="date" disabled />
                </span>
              </label>
              <label className="field">
                <span className="field__label">Stay type</span>
                <span className="field__control">
                  <select defaultValue="hotel" disabled>
                    <option value="hotel">Hotel</option>
                    <option value="hostel">Hostel</option>
                    <option value="apartment">Apartment</option>
                  </select>
                </span>
              </label>
            </div>
          </div>

          <div className="mini-panel mini-panel--accent">
            <div className="screen-card__header">
              <div>
                <h2>Activity Assignment</h2>
                <p>Attach planned activities to each stop after the trip is created.</p>
              </div>
            </div>

            <div className="chip-list">
              {activityOptions.map((activity) => (
                <button className="chip chip--static" type="button" key={activity}>
                  {activity}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </ScreenFrame>
  );
}
