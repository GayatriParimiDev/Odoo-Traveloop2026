import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ScreenFrame from '../components/ScreenFrame';
import { createTrip } from '../api';

const STORAGE_KEY = 'traveloop_access_token';

function readToken() {
  return localStorage.getItem(STORAGE_KEY) || '';
}

export default function CreateTripPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    start_date: '',
    end_date: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = readToken();
      const response = await createTrip(token, {
        title: form.title,
        start_date: form.start_date,
        end_date: form.end_date,
        description: form.description,
      });

      navigate(`/itinerary-builder?tripId=${response.data.id}`, { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to create trip');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenFrame
      eyebrow="Create Trip"
      title="Create Trip"
      description="Start a new travel plan by entering the trip name, travel dates, and description."
      actions={
        <button className="primary-button screen-button" form="create-trip-form" type="submit" disabled={loading}>
          <span>{loading ? 'Saving...' : 'Save Trip'}</span>
          <span aria-hidden="true">-&gt;</span>
        </button>
      }
      aside={
        <div className="screen-summary">
          <div className="screen-summary__row">
            <strong>Trips</strong>
            <span>Saved to database</span>
          </div>
          <div className="screen-summary__row">
            <strong>Secure</strong>
            <span>Auth required</span>
          </div>
        </div>
      }
    >
      <section className="screen-card">
        <div className="screen-card__header">
          <div>
            <h2>Trip Details</h2>
            <p>Enter the basic trip information to begin planning.</p>
          </div>
        </div>

        <form id="create-trip-form" className="form-grid form-grid--stack" onSubmit={handleSubmit}>
          <label className="field field--wide">
            <span className="field__label">Trip name</span>
            <span className="field__control">
              <input
                type="text"
                placeholder="Cherry Blossom 2026"
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              />
            </span>
          </label>

          <div className="grid-two">
            <label className="field">
              <span className="field__label">Start date</span>
              <span className="field__control">
                <input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm((prev) => ({ ...prev, start_date: e.target.value }))}
                />
              </span>
            </label>
            <label className="field">
              <span className="field__label">End date</span>
              <span className="field__control">
                <input
                  type="date"
                  value={form.end_date}
                  onChange={(e) => setForm((prev) => ({ ...prev, end_date: e.target.value }))}
                />
              </span>
            </label>
          </div>

          <label className="field field--wide">
            <span className="field__label">Description</span>
            <span className="field__control field__control--textarea">
              <textarea
                placeholder="What is this trip about?"
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              />
            </span>
          </label>

          {error ? <p className="screen-empty screen-empty--error">{error}</p> : null}
        </form>
      </section>
    </ScreenFrame>
  );
}
