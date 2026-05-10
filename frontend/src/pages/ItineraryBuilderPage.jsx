import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AppIcon from '../components/AppIcon';
import ScreenFrame from '../components/ScreenFrame';
import { createStop, createTrip, getCities, getTrip, getTripStops, updateTrip } from '../api';

const STORAGE_KEY = 'traveloop_access_token';

const DEFAULT_TRIP_FORM = {
  title: '',
  description: '',
  trip_type: 'solo',
  start_date: '',
  end_date: '',
  cover_image: '/images/dashboard_background.png',
  visibility: 'private',
};

const DEFAULT_STOP_FORM = {
  city_id: '',
  city_name: '',
  arrival_date: '',
  departure_date: '',
  hotel_name: '',
  stay_type: 'hotel',
  notes: '',
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

function formatDateRange(startDate, endDate) {
  if (!startDate || !endDate) {
    return 'Dates not set';
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 'Dates not set';
  }

  return (
    new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(start) +
    ' - ' +
    new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(end)
  );
}

function formatStopRange(stop) {
  if (!stop?.arrival_date || !stop?.departure_date) {
    return 'Dates not set';
  }

  return formatDateRange(stop.arrival_date, stop.departure_date);
}

function stopLabel(stop) {
  if (!stop) {
    return '';
  }

  const city = stop.city_name || stop.city?.city_name || 'City';
  const country = stop.country || stop.city?.country || '';
  return country ? `${city}, ${country}` : city;
}

function isAuthError(error) {
  const message = String(error?.message || '').toLowerCase();
  return message.includes('unauthorized') || message.includes('invalid token');
}

export default function ItineraryBuilderPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tripId = searchParams.get('tripId') || '';

  const [tripForm, setTripForm] = useState(DEFAULT_TRIP_FORM);
  const [stopForm, setStopForm] = useState(DEFAULT_STOP_FORM);
  const [loadingTrip, setLoadingTrip] = useState(false);
  const [loadingStops, setLoadingStops] = useState(false);
  const [savingTrip, setSavingTrip] = useState(false);
  const [savingStop, setSavingStop] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [cityResults, setCityResults] = useState([]);
  const [citySearchLoading, setCitySearchLoading] = useState(false);
  const [trip, setTrip] = useState(null);
  const [stops, setStops] = useState([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [stopError, setStopError] = useState('');
  const [stopNotice, setStopNotice] = useState('');

  const editMode = Boolean(tripId);

  const tripLength = useMemo(() => {
    if (!tripForm.start_date || !tripForm.end_date) {
      return 0;
    }

    const start = new Date(tripForm.start_date);
    const end = new Date(tripForm.end_date);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return 0;
    }

    return Math.max(1, Math.round((end - start) / 86400000) + 1);
  }, [tripForm.end_date, tripForm.start_date]);

  useEffect(() => {
    const token = readToken();
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    if (!tripId) {
      setTrip(null);
      setStops([]);
      setTripForm(DEFAULT_TRIP_FORM);
      setStopForm(DEFAULT_STOP_FORM);
      setCitySearch('');
      setCityResults([]);
      setError('');
      setStopError('');
      setNotice('');
      setStopNotice('');
      return;
    }

    let active = true;

    async function loadTripAndStops() {
      setLoadingTrip(true);
      setLoadingStops(true);
      setError('');
      setStopError('');

      try {
        const [tripRes, stopsRes] = await Promise.all([getTrip(token, tripId), getTripStops(tripId, token)]);
        if (!active) {
          return;
        }

        const nextTrip = tripRes.data;
        setTrip(nextTrip);
        setTripForm({
          title: nextTrip.title || '',
          description: nextTrip.description || '',
          trip_type: nextTrip.trip_type || 'solo',
          start_date: nextTrip.start_date || '',
          end_date: nextTrip.end_date || '',
          cover_image: nextTrip.cover_image || '/images/dashboard_background.png',
          visibility: nextTrip.visibility || 'private',
        });
        setStops(stopsRes.data || []);
        setNotice('Editing existing trip');
      } catch (err) {
        if (!active) {
          return;
        }

        if (isAuthError(err)) {
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem('traveloop_refresh_token');
          localStorage.removeItem('traveloop_user');
          navigate('/login', { replace: true });
          return;
        }

        setError(err.message || 'Unable to load trip');
      } finally {
        if (active) {
          setLoadingTrip(false);
          setLoadingStops(false);
        }
      }
    }

    loadTripAndStops();

    return () => {
      active = false;
    };
  }, [navigate, tripId]);

  useEffect(() => {
    if (!tripId || citySearch.trim().length < 2) {
      setCityResults([]);
      setCitySearchLoading(false);
      return;
    }

    let active = true;

    async function loadCities() {
      setCitySearchLoading(true);

      try {
        const res = await getCities({ search: citySearch.trim(), limit: 6 });
        if (!active) {
          return;
        }

        setCityResults(res.data || []);
      } catch {
        if (active) {
          setCityResults([]);
        }
      } finally {
        if (active) {
          setCitySearchLoading(false);
        }
      }
    }

    const timeoutId = window.setTimeout(loadCities, 250);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [citySearch, tripId]);

  function handleTripChange(field, value) {
    setTripForm((current) => ({ ...current, [field]: value }));
  }

  function handleStopChange(field, value) {
    setStopForm((current) => ({ ...current, [field]: value }));
  }

  function selectCity(city) {
    setStopForm((current) => ({
      ...current,
      city_id: city.id,
      city_name: stopLabel(city),
    }));
    setCitySearch(stopLabel(city));
    setCityResults([]);
  }

  async function handleTripSubmit(event) {
    event.preventDefault();

    const token = readToken();
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    if (!tripForm.title.trim() || !tripForm.description.trim() || !tripForm.start_date || !tripForm.end_date) {
      setError('Title, description, start date, and end date are required');
      return;
    }

    if (new Date(tripForm.start_date) > new Date(tripForm.end_date)) {
      setError('Start date must be on or before end date');
      return;
    }

    setSavingTrip(true);
    setError('');
    setNotice('');

    const payload = {
      title: tripForm.title.trim(),
      description: tripForm.description.trim(),
      trip_type: tripForm.trip_type,
      start_date: tripForm.start_date,
      end_date: tripForm.end_date,
      cover_image: tripForm.cover_image.trim() || '/images/dashboard_background.png',
      visibility: tripForm.visibility,
    };

    try {
      const response = editMode ? await updateTrip(token, tripId, payload) : await createTrip(payload, token);
      const nextTripId = editMode ? tripId : response.data.id;
      setNotice(editMode ? 'Trip updated' : 'Trip created successfully');
      navigate(`/itinerary-builder?tripId=${nextTripId}`, { replace: true });
    } catch (err) {
      if (isAuthError(err)) {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem('traveloop_refresh_token');
        localStorage.removeItem('traveloop_user');
        navigate('/login', { replace: true });
        return;
      }

      setError(err.message || 'Failed to save trip');
    } finally {
      setSavingTrip(false);
    }
  }

  async function handleStopSubmit(event) {
    event.preventDefault();

    if (!tripId) {
      setStopError('Create or open a trip first');
      return;
    }

    if (!stopForm.city_id || !stopForm.arrival_date || !stopForm.departure_date) {
      setStopError('City, arrival date, and departure date are required');
      return;
    }

    const token = readToken();
    setSavingStop(true);
    setStopError('');
    setStopNotice('');

    const payload = {
      city_id: stopForm.city_id,
      arrival_date: stopForm.arrival_date,
      departure_date: stopForm.departure_date,
      stop_order: stops.length + 1,
      hotel_name: stopForm.hotel_name.trim() || null,
      stay_type: stopForm.stay_type,
      notes: stopForm.notes.trim() || null,
      hotel_cost: 0,
      transport_cost: 0,
      food_cost: 0,
    };

    try {
      await createStop(tripId, payload, token);
      const refreshed = await getTripStops(tripId, token);
      setStops(refreshed.data || []);
      setStopForm(DEFAULT_STOP_FORM);
      setCitySearch('');
      setCityResults([]);
      setStopNotice('Stop added to trip');
    } catch (err) {
      if (isAuthError(err)) {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem('traveloop_refresh_token');
        localStorage.removeItem('traveloop_user');
        navigate('/login', { replace: true });
        return;
      }

      setStopError(err.message || 'Failed to add stop');
    } finally {
      setSavingStop(false);
    }
  }

  return (
    <ScreenFrame
      eyebrow="Screen 4"
      title="Itinerary Builder"
      description="Create a trip, then add stops, activities, and checklist items from the same workspace."
      actions={
        <>
          <button className="primary-button screen-button" type="submit" form="trip-create-form" disabled={savingTrip || loadingTrip}>
            <span>{editMode ? 'Save Changes' : 'Create Trip'}</span>
            <span aria-hidden="true">-&gt;</span>
          </button>
          <button className="secondary-button screen-button" type="button" onClick={() => setTripForm(DEFAULT_TRIP_FORM)} disabled={savingTrip || loadingTrip}>
            Reset
          </button>
        </>
      }
      aside={
        <div className="screen-summary">
          <div className="screen-summary__row">
            <strong>{tripLength} days</strong>
            <span>Trip length</span>
          </div>
          <div className="screen-summary__row">
            <strong>{tripForm.visibility}</strong>
            <span>Visibility</span>
          </div>
          <div className="screen-summary__row">
            <strong>{tripForm.trip_type}</strong>
            <span>Trip type</span>
          </div>
          <div className="screen-summary__row">
            <strong>{stops.length}</strong>
            <span>Stops added</span>
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
              <p>Create the main trip first, then add stops in the lower panel.</p>
            </div>
            <span className="screen-pill">{loadingTrip ? 'Loading...' : tripId ? 'Active trip' : 'Ready'}</span>
          </div>

          <form id="trip-create-form" className="form-grid" onSubmit={handleTripSubmit}>
            <label className="field field--wide">
              <span className="field__label">Trip Title</span>
              <span className="field__control">
                <input
                  type="text"
                  placeholder="Cherry Blossom 2026"
                  value={tripForm.title}
                  onChange={(event) => handleTripChange('title', event.target.value)}
                />
              </span>
            </label>

            <label className="field field--wide">
              <span className="field__label">Description</span>
              <span className="field__control field__control--textarea">
                <textarea
                  placeholder="What is this trip about?"
                  value={tripForm.description}
                  onChange={(event) => handleTripChange('description', event.target.value)}
                />
              </span>
            </label>

            <label className="field">
              <span className="field__label">Trip Type</span>
              <span className="field__control">
                <select value={tripForm.trip_type} onChange={(event) => handleTripChange('trip_type', event.target.value)}>
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
                <select value={tripForm.visibility} onChange={(event) => handleTripChange('visibility', event.target.value)}>
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
                  value={tripForm.start_date}
                  onChange={(event) => handleTripChange('start_date', event.target.value)}
                />
              </span>
            </label>

            <label className="field">
              <span className="field__label">End Date</span>
              <span className="field__control">
                <input
                  type="date"
                  value={tripForm.end_date}
                  onChange={(event) => handleTripChange('end_date', event.target.value)}
                />
              </span>
            </label>

            <label className="field field--wide">
              <span className="field__label">Cover Image URL</span>
              <span className="field__control">
                <input
                  type="text"
                  placeholder="/images/dashboard_background.png"
                  value={tripForm.cover_image}
                  onChange={(event) => handleTripChange('cover_image', event.target.value)}
                />
              </span>
            </label>
          </form>
        </div>

        <div className="mini-panel mini-panel--accent">
          <div className="screen-card__header">
            <div>
              <h2>How it works</h2>
              <p>Save the trip first. After that the stop form below becomes live and saves to the database.</p>
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
            <h2>Trip Stops</h2>
            <p>{tripId ? 'Stops are stored in the trip_stops table and used by other screens.' : 'Create a trip to start adding stops.'}</p>
          </div>
          <span className="screen-pill">{tripId ? `${stops.length} stops` : 'Draft view'}</span>
        </div>

        <div className="stop-list">
          {(tripId && stops.length > 0 ? stops : previewStops).map((stop, index) => (
            <article className="stop-item" key={stop.id || stop.city}>
              <div className="stop-item__index">{index + 1}</div>
              <div className="stop-item__copy">
                <strong>{stop.city_name || stop.city || 'Stop'}</strong>
                <span>{stop.arrival_date && stop.departure_date ? formatStopRange(stop) : stop.dates}</span>
                <p>{stop.notes || 'Planned stop for the itinerary'}</p>
              </div>
              <button className="stop-item__drag" type="button" aria-label={`Move ${stop.city_name || stop.city}`}>
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
                <p>{tripId ? 'Pick a city and save the stop to the current trip.' : 'Create the trip first to enable stop creation.'}</p>
              </div>
            </div>

            {stopError ? <div className="form-error">{stopError}</div> : null}
            {stopNotice ? <div className="checklist-banner checklist-banner--notice">{stopNotice}</div> : null}

            <form className="form-grid" onSubmit={handleStopSubmit}>
              <label className="field field--wide">
                <span className="field__label">City</span>
                <span className="field__control">
                  <input
                    type="text"
                    placeholder={tripId ? 'Search city' : 'Save trip first'}
                    value={citySearch}
                    onChange={(event) => setCitySearch(event.target.value)}
                    disabled={!tripId}
                  />
                </span>
              </label>

              {tripId && citySearch.trim().length >= 2 ? (
                <div className="chip-list" style={{ marginTop: 0 }}>
                  {citySearchLoading ? <span className="chip chip--static">Searching...</span> : null}
                  {cityResults.map((city) => (
                    <button className="chip chip--static" type="button" key={city.id} onClick={() => selectCity(city)}>
                      {city.city_name}, {city.country}
                    </button>
                  ))}
                </div>
              ) : null}

              <label className="field">
                <span className="field__label">Arrival</span>
                <span className="field__control">
                  <input
                    type="date"
                    value={stopForm.arrival_date}
                    onChange={(event) => handleStopChange('arrival_date', event.target.value)}
                    disabled={!tripId}
                  />
                </span>
              </label>

              <label className="field">
                <span className="field__label">Departure</span>
                <span className="field__control">
                  <input
                    type="date"
                    value={stopForm.departure_date}
                    onChange={(event) => handleStopChange('departure_date', event.target.value)}
                    disabled={!tripId}
                  />
                </span>
              </label>

              <label className="field">
                <span className="field__label">Stay type</span>
                <span className="field__control">
                  <select
                    value={stopForm.stay_type}
                    onChange={(event) => handleStopChange('stay_type', event.target.value)}
                    disabled={!tripId}
                  >
                    <option value="hotel">Hotel</option>
                    <option value="hostel">Hostel</option>
                    <option value="apartment">Apartment</option>
                  </select>
                </span>
              </label>

              <label className="field field--wide">
                <span className="field__label">Hotel name</span>
                <span className="field__control">
                  <input
                    type="text"
                    placeholder="Optional hotel or stay name"
                    value={stopForm.hotel_name}
                    onChange={(event) => handleStopChange('hotel_name', event.target.value)}
                    disabled={!tripId}
                  />
                </span>
              </label>

              <label className="field field--wide">
                <span className="field__label">Notes</span>
                <span className="field__control field__control--textarea">
                  <textarea
                    placeholder="Arrival details, reminder, or transport note"
                    value={stopForm.notes}
                    onChange={(event) => handleStopChange('notes', event.target.value)}
                    disabled={!tripId}
                  />
                </span>
              </label>

              <div className="checklist-form__actions">
                <button className="primary-button screen-button" type="submit" disabled={!tripId || savingStop}>
                  {savingStop ? 'Saving...' : 'Add Stop'}
                </button>
                <button className="secondary-button screen-button" type="button" onClick={() => setStopForm(DEFAULT_STOP_FORM)} disabled={!tripId || savingStop}>
                  Clear
                </button>
              </div>
            </form>
          </div>

          <div className="mini-panel mini-panel--accent">
            <div className="screen-card__header">
              <div>
                <h2>Activity Assignment</h2>
                <p>Attach planned activities to each stop after it is saved.</p>
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
