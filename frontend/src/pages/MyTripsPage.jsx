import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ScreenFrame from '../components/ScreenFrame';
import { deleteTrip, getTrips } from '../api';

const STORAGE_KEY = 'traveloop_access_token';

function readToken() {
  return localStorage.getItem(STORAGE_KEY) || '';
}

function clearAuth() {
  localStorage.removeItem('traveloop_access_token');
  localStorage.removeItem('traveloop_refresh_token');
  localStorage.removeItem('traveloop_user');
}

function formatDateRange(startDate, endDate) {
  if (!startDate || !endDate) return 'Dates not set';
  const start = new Date(startDate);
  const end = new Date(endDate);
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(start) +
    ' - ' +
    new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(end);
}

function TripActions({ trip, onDelete, deleting }) {
  return (
    <div className="trip-actions">
      <Link className="secondary-button trip-actions__button" to={`/itinerary-view?tripId=${trip.id}`}>
        View
      </Link>
      <Link className="secondary-button trip-actions__button" to={`/itinerary-builder?tripId=${trip.id}`}>
        Edit
      </Link>
      <button
        className="secondary-button trip-actions__button trip-actions__button--danger"
        type="button"
        onClick={() => onDelete(trip.id)}
        disabled={deleting}
      >
        {deleting ? 'Deleting...' : 'Delete'}
      </button>
    </div>
  );
}

export default function MyTripsPage() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState('');

  useEffect(() => {
    let active = true;
    const token = readToken();

    if (!token) {
      navigate('/login', { replace: true });
      setLoading(false);
      return () => {
        active = false;
      };
    }

    async function loadTrips() {
      setLoading(true);
      setError('');
      try {
        const response = await getTrips(token);
        if (!active) return;
        setTrips(response.data || []);
      } catch (err) {
        if (!active) return;
        if (String(err.message || '').toLowerCase().includes('unauthorized') || String(err.message || '').toLowerCase().includes('invalid token')) {
          clearAuth();
          navigate('/login', { replace: true });
          return;
        }
        setError(err.message || 'Failed to load trips');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadTrips();
    return () => {
      active = false;
    };
  }, [navigate]);

  async function handleDelete(tripId) {
    const confirmed = window.confirm('Delete this trip permanently?');
    if (!confirmed) return;

    setDeletingId(tripId);
    setError('');
    try {
      const token = readToken();
      await deleteTrip(token, tripId);
      setTrips((current) => current.filter((trip) => trip.id !== tripId));
    } catch (err) {
      if (String(err.message || '').toLowerCase().includes('unauthorized') || String(err.message || '').toLowerCase().includes('invalid token')) {
        clearAuth();
        navigate('/login', { replace: true });
        return;
      }
      setError(err.message || 'Failed to delete trip');
    } finally {
      setDeletingId('');
    }
  }

  return (
    <ScreenFrame
      eyebrow="My Trips"
      title="My Trips"
      description="All trips created by you, loaded from the database."
      actions={
        <button className="primary-button screen-button" type="button" onClick={() => navigate('/trips/new')}>
          Create New Trip
        </button>
      }
      aside={
        <div className="screen-summary">
          <div className="screen-summary__row">
            <strong>{trips.length}</strong>
            <span>Total trips</span>
          </div>
          <div className="screen-summary__row">
            <strong>{trips.reduce((sum, trip) => sum + Number(trip.stop_count || 0), 0)}</strong>
            <span>Total stops</span>
          </div>
        </div>
      }
    >
      <section className="screen-card">
        <div className="screen-card__header">
          <div>
            <h2>Your Trips</h2>
            <p>Trip cards show title, date range, stop count, and actions.</p>
          </div>
        </div>

        {loading ? <p className="screen-empty">Loading trips from your database...</p> : null}
        {error ? <p className="screen-empty screen-empty--error">{error}</p> : null}

        {!loading && !error && trips.length === 0 ? (
          <div className="screen-empty-state">
            <h3>No trips yet</h3>
            <p>Create your first trip to start planning stops and activities.</p>
            <button className="primary-button screen-button" type="button" onClick={() => navigate('/trips/new')}>
              Create a New Trip
            </button>
          </div>
        ) : null}

        {!loading && !error && trips.length > 0 ? (
          <div className="trip-grid">
            {trips.map((trip) => (
              <article className="trip-record" key={trip.id}>
                <div className="trip-record__head">
                  <div>
                    <h3>{trip.title}</h3>
                    <p>{formatDateRange(trip.start_date, trip.end_date)}</p>
                  </div>
                  <span className={`trip-record__status trip-record__status--${trip.status}`}>{trip.status}</span>
                </div>

                <div className="trip-record__meta">
                  <div>
                    <span>Stops</span>
                    <strong>{trip.stop_count || 0}</strong>
                  </div>
                  <div>
                    <span>Type</span>
                    <strong>{trip.trip_type}</strong>
                  </div>
                  <div>
                    <span>Visibility</span>
                    <strong>{trip.visibility}</strong>
                  </div>
                </div>

                <TripActions
                  trip={trip}
                  onDelete={handleDelete}
                  deleting={deletingId === trip.id}
                />
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </ScreenFrame>
  );
}
