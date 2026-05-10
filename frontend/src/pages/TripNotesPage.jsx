import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import ScreenFrame from '../components/ScreenFrame';
import {
  createTripNote,
  deleteTripNote,
  getTripNotes,
  getTripStops,
  getTrips,
  updateTripNote,
} from '../api';

const STORAGE_KEY = 'traveloop_access_token';

const DEFAULT_FORM = {
  title: '',
  content: '',
  trip_stop_id: '',
};

function readToken() {
  return localStorage.getItem(STORAGE_KEY) || '';
}

function clearAuth() {
  localStorage.removeItem('traveloop_access_token');
  localStorage.removeItem('traveloop_refresh_token');
  localStorage.removeItem('traveloop_user');
}

function formatDateTime(value) {
  if (!value) {
    return 'Unknown time';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown time';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
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
    new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(start) +
    ' - ' +
    new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(end)
  );
}

function buildTripSubtitle(trip) {
  if (!trip) {
    return '';
  }

  const stopCount = Number(trip.stop_count || 0);
  const stopLabel = stopCount === 1 ? 'stop' : 'stops';

  return `${formatDateRange(trip.start_date, trip.end_date)} - ${stopCount} ${stopLabel}`;
}

function buildStopLabel(stop) {
  if (!stop) {
    return 'Trip-level note';
  }

  const city = stop.city_name || stop.city?.city_name || 'Stop';
  const country = stop.country || stop.city?.country || '';
  const hotel = stop.hotel_name ? ` - ${stop.hotel_name}` : '';
  const dates = stop.arrival_date && stop.departure_date ? ` (${formatDateRange(stop.arrival_date, stop.departure_date)})` : '';

  return `${stop.stop_order || 0}. ${city}${country ? `, ${country}` : ''}${hotel}${dates}`;
}

export default function TripNotesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [trips, setTrips] = useState([]);
  const [stops, setStops] = useState([]);
  const [notes, setNotes] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState(searchParams.get('trip') || '');
  const [selectedStopId, setSelectedStopId] = useState(searchParams.get('stop') || 'all');
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [loadingStops, setLoadingStops] = useState(false);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState('');
  const [sortDirection, setSortDirection] = useState('desc');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [form, setForm] = useState(DEFAULT_FORM);

  const activeTrip = useMemo(
    () => trips.find((trip) => trip.id === selectedTripId) || null,
    [trips, selectedTripId]
  );

  const activeStop = useMemo(
    () => (selectedStopId === 'all' ? null : stops.find((stop) => stop.id === selectedStopId) || null),
    [selectedStopId, stops]
  );

  const visibleNotes = useMemo(() => {
    if (sortDirection === 'asc') {
      return [...notes].reverse();
    }

    return notes;
  }, [notes, sortDirection]);

  const taggedCount = useMemo(
    () => notes.filter((note) => note.trip_stop_id).length,
    [notes]
  );

  const latestNote = notes[0] || null;

  useEffect(() => {
    const token = readToken();
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    let active = true;

    async function loadTrips() {
      setLoadingTrips(true);
      setError('');

      try {
        const response = await getTrips(token);
        if (!active) {
          return;
        }

        const rows = response.data || [];
        setTrips(rows);

        const nextTripId = rows.some((trip) => trip.id === selectedTripId) ? selectedTripId : rows[0]?.id || '';

        if (!selectedTripId || !rows.some((trip) => trip.id === selectedTripId)) {
          setSelectedTripId(nextTripId);
          setSearchParams(nextTripId ? { trip: nextTripId } : {}, { replace: true });
        }
      } catch (err) {
        if (!active) {
          return;
        }

        const message = String(err.message || '').toLowerCase();
        if (message.includes('unauthorized') || message.includes('invalid token')) {
          clearAuth();
          navigate('/login', { replace: true });
          return;
        }

        setError(err.message || 'Failed to load trips');
      } finally {
        if (active) {
          setLoadingTrips(false);
        }
      }
    }

    loadTrips();

    return () => {
      active = false;
    };
  }, [navigate, setSearchParams]);

  useEffect(() => {
    const token = readToken();
    if (!token || !selectedTripId) {
      setStops([]);
      return;
    }

    let active = true;

    async function loadStops() {
      setLoadingStops(true);

      try {
        const response = await getTripStops(selectedTripId, token);
        if (!active) {
          return;
        }

        setStops(response.data || []);
      } catch (err) {
        if (!active) {
          return;
        }

        const message = String(err.message || '').toLowerCase();
        if (message.includes('unauthorized') || message.includes('invalid token')) {
          clearAuth();
          navigate('/login', { replace: true });
          return;
        }

        setStops([]);
        setError(err.message || 'Failed to load trip stops');
      } finally {
        if (active) {
          setLoadingStops(false);
        }
      }
    }

    loadStops();

    return () => {
      active = false;
    };
  }, [navigate, selectedTripId]);

  useEffect(() => {
    const token = readToken();
    if (!token || !selectedTripId) {
      setNotes([]);
      return;
    }

    let active = true;

    async function loadNotes() {
      setLoadingNotes(true);
      setError('');

      try {
        const response = await getTripNotes(selectedTripId, token, selectedStopId === 'all' ? '' : selectedStopId);
        if (!active) {
          return;
        }

        setNotes(response.data || []);
      } catch (err) {
        if (!active) {
          return;
        }

        const message = String(err.message || '').toLowerCase();
        if (message.includes('unauthorized') || message.includes('invalid token')) {
          clearAuth();
          navigate('/login', { replace: true });
          return;
        }

        setError(err.message || 'Failed to load notes');
      } finally {
        if (active) {
          setLoadingNotes(false);
        }
      }
    }

    loadNotes();

    return () => {
      active = false;
    };
  }, [navigate, selectedStopId, selectedTripId]);

  useEffect(() => {
    const stopExists = selectedStopId === 'all' || stops.some((stop) => stop.id === selectedStopId);
    if (!stopExists) {
      setSelectedStopId('all');
      setSearchParams(selectedTripId ? { trip: selectedTripId } : {}, { replace: true });
    }
  }, [selectedStopId, selectedTripId, setSearchParams, stops]);

  async function refreshNotes(tripId = selectedTripId, stopId = selectedStopId) {
    const token = readToken();
    if (!token || !tripId) {
      return;
    }

    const response = await getTripNotes(tripId, token, stopId === 'all' ? '' : stopId);
    setNotes(response.data || []);
  }

  function handleTripChange(event) {
    const nextTripId = event.target.value;
    setSelectedTripId(nextTripId);
    setSelectedStopId('all');
    setEditingNoteId('');
    setForm(DEFAULT_FORM);
    setNotice('');
    setError('');
    setSearchParams(nextTripId ? { trip: nextTripId } : {}, { replace: true });
  }

  function handleStopFilterChange(event) {
    const nextStopId = event.target.value;
    setSelectedStopId(nextStopId);
    setEditingNoteId('');
    setForm(DEFAULT_FORM);
    setNotice('');
    setError('');
    setSearchParams(
      selectedTripId ? { trip: selectedTripId, ...(nextStopId !== 'all' ? { stop: nextStopId } : {}) } : {},
      { replace: true }
    );
  }

  function handleFormChange(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleNewNote() {
    setEditingNoteId('');
    setForm({
      title: '',
      content: '',
      trip_stop_id: activeStop?.id || '',
    });
    setNotice('Compose a new note');
    setError('');
  }

  function handleEditNote(note) {
    setEditingNoteId(note.id);
    setForm({
      title: note.title || '',
      content: note.content || '',
      trip_stop_id: note.trip_stop_id || '',
    });
    setNotice('Editing note');
    setError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!selectedTripId) {
      setError('Select a trip first');
      return;
    }

    const title = form.title.trim();
    const content = form.content.trim();

    if (!title || !content) {
      setError('Title and content are required');
      return;
    }

    const token = readToken();
    setSubmitting(true);
    setError('');
    setNotice('');

    const payload = {
      title,
      content,
      trip_stop_id: form.trip_stop_id || null,
    };

    try {
      if (editingNoteId) {
        await updateTripNote(selectedTripId, editingNoteId, payload, token);
        setNotice('Note updated');
      } else {
        await createTripNote(selectedTripId, payload, token);
        setNotice('Note saved');
      }

      setForm(DEFAULT_FORM);
      setEditingNoteId('');
      await refreshNotes().catch(() => {});
    } catch (err) {
      const message = String(err.message || '').toLowerCase();
      if (message.includes('unauthorized') || message.includes('invalid token')) {
        clearAuth();
        navigate('/login', { replace: true });
        return;
      }

      setError(err.message || 'Failed to save note');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(noteId) {
    const confirmed = window.confirm('Delete this note permanently?');
    if (!confirmed) {
      return;
    }

    const token = readToken();
    setSubmitting(true);
    setError('');
    setNotice('');

    try {
      await deleteTripNote(selectedTripId, noteId, token);
      if (editingNoteId === noteId) {
        setEditingNoteId('');
        setForm(DEFAULT_FORM);
      }
      await refreshNotes().catch(() => {});
      setNotice('Note deleted');
    } catch (err) {
      const message = String(err.message || '').toLowerCase();
      if (message.includes('unauthorized') || message.includes('invalid token')) {
        clearAuth();
        navigate('/login', { replace: true });
        return;
      }

      setError(err.message || 'Failed to delete note');
    } finally {
      setSubmitting(false);
    }
  }

  const noteCount = notes.length;
  const stopCount = stops.length;
  const currentScopeLabel = selectedStopId === 'all' ? 'All trip notes' : buildStopLabel(activeStop);

  return (
    <ScreenFrame
      eyebrow="Screen 12"
      title="Trip Notes and Journal"
      description="Keep timestamped notes for a trip or a specific stop, backed by the database and tied to your saved trips."
      actions={
        <>
          <button className="primary-button screen-button" type="button" onClick={handleNewNote} disabled={!selectedTripId}>
            New Note
          </button>
          <button
            className="secondary-button screen-button"
            type="button"
            onClick={() => setSortDirection((current) => (current === 'desc' ? 'asc' : 'desc'))}
            disabled={!selectedTripId}
          >
            {sortDirection === 'desc' ? 'Oldest First' : 'Newest First'}
          </button>
          <button
            className="secondary-button screen-button"
            type="button"
            onClick={() => refreshNotes().catch((err) => setError(err.message || 'Failed to refresh notes'))}
            disabled={!selectedTripId || loadingNotes || loadingTrips}
          >
            Refresh
          </button>
        </>
      }
      aside={
        <div className="screen-summary">
          <div className="screen-summary__row">
            <strong>{noteCount}</strong>
            <span>Notes loaded</span>
          </div>
          <div className="screen-summary__row">
            <strong>{taggedCount}</strong>
            <span>Tagged notes</span>
          </div>
          <div className="screen-summary__row">
            <strong>{stopCount}</strong>
            <span>Trip stops</span>
          </div>
          <div className="screen-summary__row">
            <strong>{latestNote ? formatDateTime(latestNote.updated_at || latestNote.created_at) : 'N/A'}</strong>
            <span>Latest update</span>
          </div>
        </div>
      }
    >
      <section className="screen-card">
        <div className="screen-card__header">
          <div>
            <h2>Trip Scope</h2>
            <p>Select the trip and optionally focus the notes list to a single stop.</p>
          </div>
          <span className="screen-pill">{currentScopeLabel}</span>
        </div>

        <div className="checklist-toolbar__grid">
          <label className="field">
            <span className="field__label">Trip</span>
            <span className="field__control">
              <select value={selectedTripId} onChange={handleTripChange} disabled={loadingTrips || trips.length === 0}>
                <option value="">Select trip</option>
                {trips.map((trip) => (
                  <option key={trip.id} value={trip.id}>
                    {trip.title}
                  </option>
                ))}
              </select>
            </span>
          </label>

          <label className="field">
            <span className="field__label">View notes for</span>
            <span className="field__control">
              <select
                value={selectedStopId}
                onChange={handleStopFilterChange}
                disabled={!selectedTripId || loadingStops}
              >
                <option value="all">All notes</option>
                {stops.map((stop) => (
                  <option key={stop.id} value={stop.id}>
                    {buildStopLabel(stop)}
                  </option>
                ))}
              </select>
            </span>
          </label>

          <div className="screen-summary screen-summary--alert">
            <div className="screen-summary__row">
              <strong>{activeTrip ? activeTrip.title : 'No trip selected'}</strong>
              <span>{activeTrip ? buildTripSubtitle(activeTrip) : 'Choose a trip to load its notes.'}</span>
            </div>
            <p>Notes are saved to `trip_notes` and can be linked to a stop or left as trip-level context.</p>
          </div>
        </div>

        {notice ? <div className="checklist-banner checklist-banner--notice">{notice}</div> : null}
        {error ? <div className="form-error">{error}</div> : null}
        {loadingTrips || loadingStops || loadingNotes ? <div className="checklist-banner">Loading trip notes...</div> : null}
      </section>

      <section className="screen-card screen-card--split">
        <div className="mini-panel">
          <div className="screen-card__header">
            <div>
              <h2>{editingNoteId ? 'Edit Note' : 'Note Editor'}</h2>
              <p>Write a new note, attach it to a stop, or update an existing entry.</p>
            </div>
            {editingNoteId ? (
              <button
                className="secondary-button screen-button"
                type="button"
                onClick={() => {
                  setEditingNoteId('');
                  setForm(DEFAULT_FORM);
                }}
              >
                Cancel Edit
              </button>
            ) : null}
          </div>

          <form onSubmit={handleSubmit}>
            <label className="field">
              <span className="field__label">Note title</span>
              <span className="field__control">
                <input
                  type="text"
                  placeholder="Hotel reminder, day plan, or packing cue"
                  value={form.title}
                  onChange={(event) => handleFormChange('title', event.target.value)}
                />
              </span>
            </label>

            <label className="field field--wide">
              <span className="field__label">Note content</span>
              <span className="field__control field__control--textarea">
                <textarea
                  placeholder="Add timings, contact numbers, reminders, or decisions"
                  value={form.content}
                  onChange={(event) => handleFormChange('content', event.target.value)}
                />
              </span>
            </label>

            <label className="field">
              <span className="field__label">Attach to stop</span>
              <span className="field__control">
                <select
                  value={form.trip_stop_id}
                  onChange={(event) => handleFormChange('trip_stop_id', event.target.value)}
                  disabled={!selectedTripId}
                >
                  <option value="">Trip-level note</option>
                  {stops.map((stop) => (
                    <option key={stop.id} value={stop.id}>
                      {buildStopLabel(stop)}
                    </option>
                  ))}
                </select>
              </span>
            </label>

            <div className="checklist-form__actions">
              <button className="primary-button screen-button" type="submit" disabled={submitting || !selectedTripId}>
                {editingNoteId ? 'Update Note' : 'Save Note'}
              </button>
              <button
                className="secondary-button screen-button"
                type="button"
                onClick={() => {
                  setEditingNoteId('');
                  setForm(DEFAULT_FORM);
                  setNotice('');
                }}
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        <div className="mini-panel mini-panel--accent">
          <div className="screen-card__header">
            <div>
              <h2>Journal Entries</h2>
              <p>Sorted by timestamp and backed by the notes table in the database.</p>
            </div>
            <span className="screen-pill">{visibleNotes.length} visible</span>
          </div>

          <div className="notes-list">
            {!selectedTripId ? (
              <div className="screen-empty-state">
                <h3>No trip selected</h3>
                <p>Choose a trip to load its notes and stop-specific entries.</p>
                <Link className="text-link" to="/trips/new">
                  Create a trip
                </Link>
              </div>
            ) : visibleNotes.length === 0 ? (
              <div className="screen-empty-state">
                <h3>No notes yet</h3>
                <p>
                  {selectedStopId === 'all'
                    ? 'Create the first note for this trip.'
                    : 'No notes are tagged to the selected stop.'}
                </p>
                <button className="primary-button screen-button" type="button" onClick={handleNewNote}>
                  Write a note
                </button>
              </div>
            ) : (
              visibleNotes.map((note) => {
                const noteStop = note.trip_stop_id ? stops.find((stop) => stop.id === note.trip_stop_id) || null : null;

                return (
                  <article className="note-card" key={note.id}>
                    <div className="note-card__meta">
                      <strong>{note.title || 'Untitled note'}</strong>
                      <span>
                        {formatDateTime(note.updated_at || note.created_at)}
                        {noteStop ? ` - ${buildStopLabel(noteStop)}` : ' - Trip level'}
                      </span>
                    </div>
                    <p>{note.content}</p>
                    <div className="share-row">
                      <button
                        className="secondary-button screen-button"
                        type="button"
                        onClick={() => handleEditNote(note)}
                        disabled={submitting}
                      >
                        Edit
                      </button>
                      <button
                        className="secondary-button screen-button"
                        type="button"
                        onClick={() => handleDelete(note.id)}
                        disabled={submitting}
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>
      </section>
    </ScreenFrame>
  );
}
