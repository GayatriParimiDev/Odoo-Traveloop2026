import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AppIcon from '../components/AppIcon';
import ScreenFrame from '../components/ScreenFrame';
import {
  bulkCreateChecklistItems,
  createChecklistItem,
  deleteChecklistItem,
  getTrips,
  getTripChecklist,
  resetChecklist,
  toggleChecklistItem,
  updateChecklistItem,
} from '../api';

const STORAGE_KEYS = {
  accessToken: 'traveloop_access_token',
};

const CATEGORY_ORDER = [
  'documents',
  'electronics',
  'technology',
  'clothing',
  'toiletries',
  'medical',
  'essentials',
  'accessories',
  'weather',
  'other',
];

const DEFAULT_FORM = {
  item_name: '',
  category: 'documents',
  quantity: 1,
  priority: 'medium',
  notes: '',
  pack_by: '',
  is_essential: false,
};

const CATEGORY_LABELS = {
  documents: 'Documents',
  electronics: 'Electronics',
  technology: 'Technology',
  clothing: 'Clothing',
  toiletries: 'Toiletries',
  medical: 'Medical',
  essentials: 'Essentials',
  accessories: 'Accessories',
  weather: 'Weather',
  other: 'Other',
};

const PRIORITY_LABELS = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

function formatDate(value) {
  if (!value) {
    return 'Unscheduled';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Unscheduled';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function getToken() {
  return localStorage.getItem(STORAGE_KEYS.accessToken) || '';
}

function getTripDuration(trip) {
  if (!trip?.start_date || !trip?.end_date) {
    return 0;
  }

  const start = new Date(trip.start_date);
  const end = new Date(trip.end_date);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 0;
  }

  return Math.max(1, Math.round((end - start) / 86400000) + 1);
}

function groupByCategory(items) {
  return items.reduce((acc, item) => {
    const key = item.category || 'other';
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {});
}

function buildTripSubtitle(trip) {
  if (!trip) {
    return '';
  }

  const dateRange = `${formatDate(trip.start_date)} - ${formatDate(trip.end_date)}`;
  const duration = getTripDuration(trip);
  const stopWord = duration === 1 ? 'day' : 'days';
  return `${dateRange} · ${duration} ${stopWord}`;
}

function countPacked(items) {
  return items.filter((item) => item.is_packed).length;
}

export default function PackingChecklistPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [trips, setTrips] = useState([]);
  const [checklist, setChecklist] = useState(null);
  const [selectedTripId, setSelectedTripId] = useState(searchParams.get('trip') || '');
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [loadingChecklist, setLoadingChecklist] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [editingItemId, setEditingItemId] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);

  const activeTrip = useMemo(
    () => trips.find((trip) => trip.id === selectedTripId) || null,
    [trips, selectedTripId]
  );

  const items = checklist?.items || [];
  const suggestions = checklist?.suggestions || [];
  const summary = checklist?.summary || {
    total_count: 0,
    packed_count: 0,
    remaining_count: 0,
    completion_rate: 0,
    essential_count: 0,
    overdue_count: 0,
    category_count: 0,
    categories: [],
  };
  const groupedItems = useMemo(() => groupByCategory(items), [items]);

  const filteredItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return items.filter((item) => {
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      const matchesTerm =
        !term ||
        item.item_name?.toLowerCase().includes(term) ||
        item.notes?.toLowerCase().includes(term) ||
        item.priority?.toLowerCase().includes(term);

      return matchesCategory && matchesTerm;
    });
  }, [items, searchTerm, categoryFilter]);

  const filteredGroups = useMemo(() => {
    const grouped = groupByCategory(filteredItems);

    return CATEGORY_ORDER.map((category) => {
      const categoryItems = grouped[category] || [];
      return categoryItems.length
        ? { key: category, label: CATEGORY_LABELS[category] || category, items: categoryItems }
        : null;
    }).filter(Boolean);
  }, [filteredItems]);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    let active = true;

    async function loadTrips() {
      setLoadingTrips(true);
      setError('');

      try {
        const res = await getTrips(token);
        if (!active) {
          return;
        }

        const tripRows = res.data || [];
        setTrips(tripRows);

        const queryTrip = searchParams.get('trip');
        const nextTripId =
          queryTrip && tripRows.some((trip) => trip.id === queryTrip)
            ? queryTrip
            : tripRows[0]?.id || '';

        if (!selectedTripId || !tripRows.some((trip) => trip.id === selectedTripId)) {
          setSelectedTripId(nextTripId);
          if (nextTripId) {
            setSearchParams({ trip: nextTripId }, { replace: true });
          }
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Unable to load trips');
        }
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
  }, [navigate, searchParams, selectedTripId, setSearchParams]);

  useEffect(() => {
    const token = getToken();

    if (!token || !selectedTripId) {
      return;
    }

    let active = true;

    async function loadChecklist() {
      setLoadingChecklist(true);
      setError('');

      try {
        const res = await getTripChecklist(selectedTripId, token);
        if (active) {
          setChecklist(res.data);
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Unable to load checklist');
        }
      } finally {
        if (active) {
          setLoadingChecklist(false);
        }
      }
    }

    loadChecklist();

    return () => {
      active = false;
    };
  }, [selectedTripId]);

  async function refreshChecklist(tripId = selectedTripId) {
    const token = getToken();
    if (!token || !tripId) {
      return;
    }

    const res = await getTripChecklist(tripId, token);
    setChecklist(res.data);
  }

  function handleTripChange(event) {
    const nextTripId = event.target.value;
    setSelectedTripId(nextTripId);
    setSearchParams(nextTripId ? { trip: nextTripId } : {}, { replace: true });
    setForm(DEFAULT_FORM);
    setEditingItemId(null);
    setNotice('');
  }

  function handleFormChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleEditItem(item) {
    setEditingItemId(item.id);
    setForm({
      item_name: item.item_name || '',
      category: item.category || 'documents',
      quantity: item.quantity || 1,
      priority: item.priority || 'medium',
      notes: item.notes || '',
      pack_by: item.pack_by || '',
      is_essential: Boolean(item.is_essential),
    });
    setNotice('Editing item');
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!selectedTripId) {
      setError('Select a trip first');
      return;
    }

    const token = getToken();
    setSubmitting(true);
    setError('');
    setNotice('');

    const payload = {
      item_name: form.item_name.trim(),
      category: form.category,
      quantity: Number.parseInt(form.quantity, 10) || 1,
      priority: form.priority,
      notes: form.notes.trim(),
      pack_by: form.pack_by || null,
      is_essential: Boolean(form.is_essential),
      source: editingItemId ? 'manual' : 'manual',
    };

    try {
      if (editingItemId) {
        await updateChecklistItem(selectedTripId, editingItemId, payload, token);
        setNotice('Item updated');
      } else {
        await createChecklistItem(selectedTripId, payload, token);
        setNotice('Item added');
      }

      setForm(DEFAULT_FORM);
      setEditingItemId(null);
      await refreshChecklist();
    } catch (err) {
      setError(err.message || 'Unable to save item');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggle(itemId) {
    const token = getToken();
    setSubmitting(true);
    setError('');

    try {
      await toggleChecklistItem(selectedTripId, itemId, token);
      await refreshChecklist();
      setNotice('Item status updated');
    } catch (err) {
      setError(err.message || 'Unable to update item');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(itemId) {
    const confirmed = window.confirm('Delete this packing item?');
    if (!confirmed) {
      return;
    }

    const token = getToken();
    setSubmitting(true);
    setError('');

    try {
      await deleteChecklistItem(selectedTripId, itemId, token);
      await refreshChecklist();
      setNotice('Item deleted');
    } catch (err) {
      setError(err.message || 'Unable to delete item');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReset() {
    const confirmed = window.confirm('Reset all packed states for this trip?');
    if (!confirmed) {
      return;
    }

    const token = getToken();
    setSubmitting(true);
    setError('');

    try {
      await resetChecklist(selectedTripId, token);
      await refreshChecklist();
      setNotice('Checklist reset');
    } catch (err) {
      setError(err.message || 'Unable to reset checklist');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAddSuggestion(suggestion) {
    const token = getToken();
    setSubmitting(true);
    setError('');

    try {
      await createChecklistItem(
        selectedTripId,
        {
          ...suggestion,
          source: 'template',
        },
        token
      );
      await refreshChecklist();
      setNotice(`${suggestion.item_name} added`);
    } catch (err) {
      setError(err.message || 'Unable to add suggestion');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAddAllSuggestions() {
    const token = getToken();
    setSubmitting(true);
    setError('');

    try {
      if (suggestions.length) {
        await bulkCreateChecklistItems(selectedTripId, suggestions, token);
        await refreshChecklist();
        setNotice('Suggested items added');
      }
    } catch (err) {
      setError(err.message || 'Unable to add template items');
    } finally {
      setSubmitting(false);
    }
  }

  const packedCount = summary.packed_count || countPacked(items);
  const totalCount = summary.total_count || items.length;
  const completionRate = summary.completion_rate || 0;
  const activeCategoryCount = summary.category_count || 0;
  const daysUntilStart = activeTrip?.start_date
    ? Math.ceil((new Date(activeTrip.start_date) - new Date()) / 86400000)
    : null;

  return (
    <ScreenFrame
      eyebrow="Screen 9"
      title="Packing Checklist"
      description="Trip-specific packing lists with priorities, notes, progress tracking, and template suggestions."
      actions={
        <>
          <button className="primary-button screen-button" type="button" onClick={handleAddAllSuggestions} disabled={!selectedTripId || submitting || suggestions.length === 0}>
            Add Suggestions
          </button>
          <button className="secondary-button screen-button" type="button" onClick={handleReset} disabled={!selectedTripId || submitting}>
            Reset Checklist
          </button>
        </>
      }
      aside={
        <div className="screen-summary checklist-summary">
          <div className="screen-summary__row">
            <strong>{completionRate}%</strong>
            <span>Completion rate</span>
          </div>
          <div className="screen-summary__row">
            <strong>{packedCount}/{totalCount || 0}</strong>
            <span>Items packed</span>
          </div>
          <div className="screen-summary__row">
            <strong>{activeCategoryCount}</strong>
            <span>Active categories</span>
          </div>
          <div className="screen-summary__row">
            <strong>{daysUntilStart === null ? 'N/A' : daysUntilStart}</strong>
            <span>Days until departure</span>
          </div>
        </div>
      }
    >
      <section className="screen-card checklist-toolbar">
        <div className="screen-card__header">
          <div>
            <h2>Active Trip</h2>
            <p>Select a trip to switch between its independent packing lists.</p>
          </div>
          {checklist?.trip ? <span className="screen-pill">{checklist.trip.visibility || 'private'}</span> : null}
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
            <span className="field__label">Search items</span>
            <span className="field__control">
              <input
                type="text"
                placeholder="Passport, charger, jacket..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </span>
          </label>

          <label className="field">
            <span className="field__label">Filter category</span>
            <span className="field__control">
              <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
                <option value="all">All categories</option>
                {CATEGORY_ORDER.map((category) => (
                  <option key={category} value={category}>
                    {CATEGORY_LABELS[category] || category}
                  </option>
                ))}
              </select>
            </span>
          </label>
        </div>

        <div className="checklist-trip-meta">
          <div>
            <strong>{activeTrip?.title || 'No trip selected'}</strong>
            <span>{buildTripSubtitle(activeTrip) || 'Choose a trip to load its checklist and suggestions.'}</span>
          </div>
          <div>
            <strong>{activeTrip?.trip_type || 'N/A'}</strong>
            <span>Trip type</span>
          </div>
          <div>
            <strong>{checklist?.stops?.length || 0}</strong>
            <span>Trip stops</span>
          </div>
        </div>

        {notice ? <div className="checklist-banner checklist-banner--notice">{notice}</div> : null}
        {error ? <div className="form-error">{error}</div> : null}
        {loadingTrips || loadingChecklist ? <div className="checklist-banner">Loading trip checklist...</div> : null}
      </section>

      <section className="checklist-workspace">
        <div className="screen-card checklist-form-card">
          <div className="screen-card__header">
            <div>
              <h2>{editingItemId ? 'Edit Item' : 'Add Item'}</h2>
              <p>Track item priority, purpose, and when it should be packed.</p>
            </div>
            {editingItemId ? (
              <button
                className="secondary-button screen-button"
                type="button"
                onClick={() => {
                  setEditingItemId(null);
                  setForm(DEFAULT_FORM);
                }}
              >
                Cancel Edit
              </button>
            ) : null}
          </div>

          <form className="checklist-form" onSubmit={handleSubmit}>
            <label className="field">
              <span className="field__label">Item name</span>
              <span className="field__control">
                <input
                  type="text"
                  placeholder="Packing item"
                  value={form.item_name}
                  onChange={(event) => handleFormChange('item_name', event.target.value)}
                />
              </span>
            </label>

            <div className="checklist-form__grid">
              <label className="field">
                <span className="field__label">Category</span>
                <span className="field__control">
                  <select
                    value={form.category}
                    onChange={(event) => handleFormChange('category', event.target.value)}
                  >
                    {CATEGORY_ORDER.map((category) => (
                      <option key={category} value={category}>
                        {CATEGORY_LABELS[category] || category}
                      </option>
                    ))}
                  </select>
                </span>
              </label>

              <label className="field">
                <span className="field__label">Quantity</span>
                <span className="field__control">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={form.quantity}
                    onChange={(event) => handleFormChange('quantity', event.target.value)}
                  />
                </span>
              </label>

              <label className="field">
                <span className="field__label">Priority</span>
                <span className="field__control">
                  <select
                    value={form.priority}
                    onChange={(event) => handleFormChange('priority', event.target.value)}
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </span>
              </label>

              <label className="field">
                <span className="field__label">Pack by</span>
                <span className="field__control">
                  <input
                    type="date"
                    value={form.pack_by}
                    onChange={(event) => handleFormChange('pack_by', event.target.value)}
                  />
                </span>
              </label>
            </div>

            <label className="field field--wide">
              <span className="field__label">Notes</span>
              <span className="field__control field__control--textarea">
                <textarea
                  placeholder="Context, reminders, or item-specific instructions"
                  value={form.notes}
                  onChange={(event) => handleFormChange('notes', event.target.value)}
                />
              </span>
            </label>

            <label className="checklist-flag">
              <input
                type="checkbox"
                checked={form.is_essential}
                onChange={(event) => handleFormChange('is_essential', event.target.checked)}
              />
              <span>Mark as essential</span>
            </label>

            <div className="checklist-form__actions">
              <button className="primary-button screen-button" type="submit" disabled={submitting || !selectedTripId}>
                {editingItemId ? 'Update Item' : 'Save Item'}
              </button>
              <button
                className="secondary-button screen-button"
                type="button"
                onClick={() => {
                  setEditingItemId(null);
                  setForm(DEFAULT_FORM);
                }}
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        <div className="screen-card checklist-suggestions-card">
          <div className="screen-card__header">
            <div>
              <h2>Suggested Items</h2>
              <p>Generated from the selected trip duration, stops, and existing items.</p>
            </div>
          </div>

          <div className="checklist-suggestions">
            {suggestions.length === 0 ? (
              <div className="checklist-empty">
                <strong>No new suggestions</strong>
                <span>The checklist is already well covered for this trip.</span>
              </div>
            ) : (
              suggestions.map((item) => (
                <article className="checklist-suggestion" key={`${item.item_name}-${item.category}`}>
                  <div className="checklist-suggestion__copy">
                    <strong>{item.item_name}</strong>
                    <span>{CATEGORY_LABELS[item.category] || item.category} · {PRIORITY_LABELS[item.priority] || item.priority}</span>
                    {item.notes ? <p>{item.notes}</p> : null}
                  </div>
                  <button
                    className="secondary-button checklist-suggestion__button"
                    type="button"
                    onClick={() => handleAddSuggestion(item)}
                    disabled={submitting}
                  >
                    Add
                  </button>
                </article>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="screen-card">
        <div className="screen-card__header">
          <div>
            <h2>Checklist Items</h2>
            <p>Every trip has its own packing list. Items here do not affect other trips.</p>
          </div>
          <span className="screen-pill">{filteredItems.length} visible</span>
        </div>

        {filteredGroups.length === 0 ? (
          <div className="checklist-empty checklist-empty--large">
            <strong>No items match the current filter</strong>
            <span>Try changing the search or add a new packing item.</span>
            <Link className="text-link" to="/itinerary-builder">
              Build a trip first
            </Link>
          </div>
        ) : (
          <div className="checklist-category-grid">
            {filteredGroups.map((group) => {
              const categorySummary = summary.categories.find((item) => item.key === group.key);
              const packedPercent = categorySummary?.total
                ? Math.round(((categorySummary.packed || 0) / categorySummary.total) * 100)
                : 0;

              return (
                <section className="checklist-category-card" key={group.key}>
                  <div className="checklist-category-card__header">
                    <div>
                      <h3>{group.label}</h3>
                      <p>
                        {group.items.length} item{group.items.length === 1 ? '' : 's'} in this category
                      </p>
                    </div>
                    <span className="screen-pill">{packedPercent}% packed</span>
                  </div>

                  <div className="checklist-items">
                    {group.items.map((item) => (
                      <article className={`checklist-item-card ${item.is_packed ? 'is-packed' : ''}`} key={item.id}>
                        <label className="checklist-item-card__main">
                          <input
                            type="checkbox"
                            checked={Boolean(item.is_packed)}
                            onChange={() => handleToggle(item.id)}
                            disabled={submitting}
                          />
                          <div>
                            <strong>{item.item_name}</strong>
                            <span>
                              Qty {item.quantity || 1}
                              {' · '}
                              {PRIORITY_LABELS[item.priority] || item.priority}
                              {' · '}
                              {item.source === 'template' ? 'Template' : 'Manual'}
                            </span>
                          </div>
                        </label>

                        <div className="checklist-item-card__meta">
                          {item.is_essential ? <span className="checklist-badge checklist-badge--essential">Essential</span> : null}
                          {item.pack_by ? <span className="checklist-badge">Pack by {formatDate(item.pack_by)}</span> : null}
                          {item.notes ? <span className="checklist-note">{item.notes}</span> : null}
                        </div>

                        <div className="checklist-item-card__actions">
                          <button className="secondary-button" type="button" onClick={() => handleEditItem(item)} disabled={submitting}>
                            Edit
                          </button>
                          <button className="secondary-button" type="button" onClick={() => handleDelete(item.id)} disabled={submitting}>
                            Delete
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </section>
    </ScreenFrame>
  );
}
