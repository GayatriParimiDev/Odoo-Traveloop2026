import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ScreenFrame from '../components/ScreenFrame';
import {
  copySharedTrip,
  getMyTrips,
  getPublicItineraries,
  getSharedItinerary,
  shareTrip,
} from '../api';

const STORAGE_KEYS = {
  accessToken: 'traveloop_access_token',
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

function getToken() {
  return localStorage.getItem(STORAGE_KEYS.accessToken) || '';
}

function formatDateRange(startDate, endDate) {
  if (!startDate || !endDate) {
    return 'Flexible dates';
  }

  const formatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return `${formatter.format(new Date(startDate))} - ${formatter.format(new Date(endDate))}`;
}

function buildRoute(stops = []) {
  return stops.map((stop) => stop?.city?.city_name || stop?.city_name || stop?.city || '').filter(Boolean).join(' -> ');
}

function groupPacking(items = []) {
  return items.reduce((acc, item) => {
    const key = item.category || 'other';
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {});
}

export default function SharedItineraryPage() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [publicTrips, setPublicTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [ownedTrips, setOwnedTrips] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTripId, setSelectedTripId] = useState('');
  const [loadingPublic, setLoadingPublic] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [loadingOwned, setLoadingOwned] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const token = getToken();
  const groupedPacking = useMemo(
    () => groupPacking(selectedTrip?.packing_items || []),
    [selectedTrip]
  );

  const visibleTrips = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return publicTrips;
    }

    return publicTrips.filter((trip) => {
      const haystack = [
        trip.title,
        trip.description,
        trip.owner_full_name,
        trip.owner_username,
        trip.trip_type,
        trip.visibility,
        trip.start_date,
        trip.end_date,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [publicTrips, searchTerm]);

  const featuredTrip = useMemo(() => {
    if (selectedTrip) {
      return selectedTrip;
    }

    return visibleTrips[0] || null;
  }, [selectedTrip, visibleTrips]);

  useEffect(() => {
    let active = true;

    async function loadPublicTrips() {
      setLoadingPublic(true);
      setError('');

      try {
        const res = await getPublicItineraries(searchTerm);
        if (!active) {
          return;
        }

        setPublicTrips(res.data?.items || []);
      } catch (err) {
        if (active) {
          setError(err.message || 'Unable to load public itineraries');
        }
      } finally {
        if (active) {
          setLoadingPublic(false);
        }
      }
    }

    loadPublicTrips();

    return () => {
      active = false;
    };
  }, [searchTerm]);

  useEffect(() => {
    if (!token) {
      return;
    }

    let active = true;

    async function loadOwnedTrips() {
      setLoadingOwned(true);

      try {
        const res = await getMyTrips(token);
        if (!active) {
          return;
        }
        setOwnedTrips(res.data || []);
        if (!selectedTripId && res.data?.length) {
          setSelectedTripId(res.data[0].id);
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Unable to load your trips');
        }
      } finally {
        if (active) {
          setLoadingOwned(false);
        }
      }
    }

    loadOwnedTrips();

    return () => {
      active = false;
    };
  }, [token, selectedTripId]);

  useEffect(() => {
    if (!slug) {
      setSelectedTrip(null);
      return;
    }

    let active = true;

    async function loadSharedDetail() {
      setLoadingDetail(true);
      setError('');

      try {
        const res = await getSharedItinerary(slug);
        if (active) {
          setSelectedTrip(res.data);
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Unable to load public itinerary');
          setSelectedTrip(null);
        }
      } finally {
        if (active) {
          setLoadingDetail(false);
        }
      }
    }

    loadSharedDetail();

    return () => {
      active = false;
    };
  }, [slug]);

  async function handlePublishSelectedTrip() {
    if (!token || !selectedTripId) {
      setError('Select one of your trips to publish');
      return;
    }

    setSubmitting(true);
    setError('');
    setNotice('');

    try {
      const res = await shareTrip(selectedTripId, token);
      const publicUrl = res.data?.public_url;
      setNotice('Trip published to the public itinerary feed');

      const publicRes = await getPublicItineraries(searchTerm);
      setPublicTrips(publicRes.data?.items || []);

      if (publicUrl) {
        navigate(publicUrl, { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Unable to publish trip');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCopyTrip() {
    if (!token || !slug) {
      setError('Sign in to copy this itinerary');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await copySharedTrip(slug, token);
      setNotice('Trip copied into your account');
    } catch (err) {
      setError(err.message || 'Unable to copy trip');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCopyLink() {
    if (!selectedTrip?.shared?.public_url) {
      return;
    }

    try {
      await navigator.clipboard.writeText(`${window.location.origin}${selectedTrip.shared.public_url}`);
      setNotice('Public link copied');
    } catch {
      setError('Unable to copy link');
    }
  }

  const selectedRoute = buildRoute(selectedTrip?.stops || []);
  const tripSummary = selectedTrip?.stats || {};

  return (
    <ScreenFrame
      eyebrow="Screen 10"
      title="Shared Itinerary"
      description="Browse every public itinerary, inspect the trip plan in detail, and publish or copy a trip into your own account."
      actions={
        <>
          <button className="primary-button screen-button" type="button" onClick={handleCopyTrip} disabled={!slug || submitting || !token}>
            Copy Trip
          </button>
          <button className="secondary-button screen-button" type="button" onClick={handleCopyLink} disabled={!selectedTrip?.shared?.public_url}>
            Copy Link
          </button>
        </>
      }
      aside={
        <div className="screen-summary">
          <div className="screen-summary__row">
            <strong>{publicTrips.length}</strong>
            <span>Public itineraries</span>
          </div>
          <div className="screen-summary__row">
            <strong>{selectedTrip?.shared?.total_views || 0}</strong>
            <span>Views on selected trip</span>
          </div>
          <div className="screen-summary__row">
            <strong>{tripSummary.packing_total || 0}</strong>
            <span>Packing items visible</span>
          </div>
        </div>
      }
    >
      <section className="screen-card">
        <div className="screen-card__header">
          <div>
            <h2>Public Feed</h2>
            <p>Every itinerary published by a user appears here with its stops, activities, and packing guide.</p>
          </div>
          <span className="screen-pill">{loadingPublic ? 'Loading...' : 'Live'}</span>
        </div>

        <div className="shared-toolbar">
          <label className="field">
            <span className="field__label">Search public itineraries</span>
            <span className="field__control">
              <input
                type="search"
                placeholder="Tokyo, hiking, budget, author..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </span>
          </label>

          {token ? (
            <div className="shared-publish">
              <label className="field">
                <span className="field__label">Publish one of your trips</span>
                <span className="field__control">
                  <select value={selectedTripId} onChange={(event) => setSelectedTripId(event.target.value)} disabled={loadingOwned}>
                    <option value="">Select your trip</option>
                    {ownedTrips.map((trip) => (
                      <option key={trip.id} value={trip.id}>
                        {trip.title}
                      </option>
                    ))}
                  </select>
                </span>
              </label>

              <button className="primary-button screen-button" type="button" onClick={handlePublishSelectedTrip} disabled={submitting || !selectedTripId}>
                Publish Public
              </button>
            </div>
          ) : (
            <div className="shared-login-prompt">
              <span>Sign in to publish your own trip or copy a public one into your account.</span>
              <Link to="/login" className="text-link">
                Sign in
              </Link>
            </div>
          )}
        </div>

        {notice ? <div className="checklist-banner checklist-banner--notice">{notice}</div> : null}
        {error ? <div className="form-error">{error}</div> : null}

        <div className="shared-grid">
          <div className="shared-list">
            {visibleTrips.length === 0 ? (
              <div className="checklist-empty checklist-empty--large">
                <strong>No public itineraries yet</strong>
                <span>Publish one of your trips to seed the directory.</span>
              </div>
            ) : (
              visibleTrips.map((trip) => (
                <article
                  className={`shared-card ${slug === trip.public_slug ? 'is-active' : ''}`}
                  key={trip.public_slug}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/shared-itinerary/${trip.public_slug}`)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      navigate(`/shared-itinerary/${trip.public_slug}`);
                    }
                  }}
                >
                  <div className="shared-card__hero" style={{ backgroundImage: trip.cover_image ? `url(${trip.cover_image})` : 'none' }}>
                    {!trip.cover_image ? <span>{trip.title?.slice(0, 1)}</span> : null}
                  </div>

                  <div className="shared-card__body">
                    <div className="shared-card__head">
                      <div>
                        <h3>{trip.title}</h3>
                        <p>{trip.owner_full_name || trip.owner_username || 'Community traveler'}</p>
                      </div>
                      <span className="shared-card__views">{trip.total_views || 0} views</span>
                    </div>

                    <p className="shared-card__description">{trip.description || 'A public itinerary ready to inspect and copy.'}</p>

                    <div className="shared-card__meta">
                      <span>{formatDateRange(trip.start_date, trip.end_date)}</span>
                      <span>{trip.trip_type}</span>
                      <span>{trip.stop_count || 0} stops</span>
                      <span>{trip.activity_count || 0} activities</span>
                    </div>

                    <div className="shared-card__footer">
                      <strong>{trip.stop_count || 0} stops · {trip.activity_count || 0} activities</strong>
                      <button className="secondary-button" type="button">
                        Open
                      </button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>

          <aside className="shared-detail">
            <div className="screen-card shared-detail__card">
              <div className="screen-card__header">
                <div>
                  <h2>{selectedTrip?.trip?.title || featuredTrip?.title || 'Select a public itinerary'}</h2>
                  <p>{selectedRoute || featuredTrip?.description || 'Open a public itinerary to inspect its full plan.'}</p>
                </div>
                <span className="screen-pill">{selectedTrip?.shared?.allow_copy ? 'Copyable' : 'Read only'}</span>
              </div>

              {loadingDetail ? <div className="checklist-banner">Loading itinerary details...</div> : null}

              {selectedTrip ? (
                <div className="shared-detail__content">
                  <div className="shared-hero-panel">
                    <div className="shared-hero-panel__copy">
                      <span className="screen-kicker">Public itinerary</span>
                      <h3>{selectedTrip.trip.title}</h3>
                      <p>{selectedTrip.trip.description || 'A public itinerary built for planning, sharing, and copying.'}</p>
                    </div>

                    <div className="shared-hero-panel__meta">
                      <div>
                        <strong>{formatDateRange(selectedTrip.trip.start_date, selectedTrip.trip.end_date)}</strong>
                        <span>Travel dates</span>
                      </div>
                      <div>
                        <strong>{selectedTrip.trip.trip_type}</strong>
                        <span>Trip type</span>
                      </div>
                      <div>
                        <strong>{selectedTrip.stats.stop_count || 0}</strong>
                        <span>Stops</span>
                      </div>
                      <div>
                        <strong>{selectedTrip.stats.activity_count || 0}</strong>
                        <span>Activities</span>
                      </div>
                      <div>
                        <strong>{selectedTrip.stats.packing_total || 0}</strong>
                        <span>Packing items</span>
                      </div>
                      <div>
                        <strong>{selectedTrip.stats.view_count || 0}</strong>
                        <span>Views</span>
                      </div>
                    </div>
                  </div>

                  <div className="shared-section">
                    <div className="screen-card__header">
                      <div>
                        <h3>Route</h3>
                        <p>Stops and activities are shown in the order the trip was built.</p>
                      </div>
                    </div>

                    <div className="shared-timeline">
                      {selectedTrip.stops.map((stop, index) => (
                        <article className="shared-stop" key={stop.id}>
                          <div className="shared-stop__index">{index + 1}</div>
                          <div className="shared-stop__body">
                            <strong>{stop.city?.city_name || stop.city_name}</strong>
                            <span>{stop.city?.country || stop.country}</span>
                            <p>
                              {formatDateRange(stop.arrival_date, stop.departure_date)}
                              {stop.notes ? ` · ${stop.notes}` : ''}
                            </p>

                            <div className="shared-activity-list">
                              {stop.activities.map((activity) => (
                                <div className="shared-activity" key={activity.id}>
                                  <strong>{activity.title || 'Activity'}</strong>
                                  <span>{CATEGORY_LABELS[activity.category] || activity.category}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>

                  <div className="shared-section shared-section--split">
                    <div>
                      <div className="screen-card__header">
                        <div>
                          <h3>Packing Guide</h3>
                          <p>Visible checklist items that travelers can reuse when planning a similar trip.</p>
                        </div>
                      </div>

                      <div className="shared-packing">
                        {Object.keys(groupedPacking).length === 0 ? (
                          <div className="checklist-empty">
                            <strong>No packing items attached</strong>
                            <span>This trip does not currently include a public checklist.</span>
                          </div>
                        ) : (
                          Object.entries(groupedPacking).map(([category, items]) => (
                            <div className="shared-packing__group" key={category}>
                              <strong>{CATEGORY_LABELS[category] || category}</strong>
                              {items.map((item) => (
                                <div className="shared-packing__item" key={item.id}>
                                  <span>{item.item_name}</span>
                                  <em>Qty {item.quantity || 1}</em>
                                </div>
                              ))}
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="screen-card__header">
                        <div>
                          <h3>Public Summary</h3>
                          <p>What other travelers can evaluate before copying this itinerary.</p>
                        </div>
                      </div>

                      <div className="summary-grid">
                        <article className="summary-tile">
                          <span>Route</span>
                          <strong>{selectedRoute || 'No route yet'}</strong>
                        </article>
                        <article className="summary-tile">
                          <span>Budget</span>
                          <strong>{Number(selectedTrip.stats.estimated_total_cost || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</strong>
                        </article>
                        <article className="summary-tile">
                          <span>Owner</span>
                          <strong>{selectedTrip.trip.owner_full_name || selectedTrip.trip.owner_username || 'Traveler'}</strong>
                        </article>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="checklist-empty checklist-empty--large">
                  <strong>Select an itinerary from the public feed</strong>
                  <span>You can inspect any published trip and copy it into your account.</span>
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>
    </ScreenFrame>
  );
}
