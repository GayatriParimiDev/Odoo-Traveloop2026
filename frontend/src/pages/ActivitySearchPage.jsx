import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ScreenFrame from '../components/ScreenFrame';
import { getActivities, getStopActivities, addStopActivity, removeStopActivity } from '../api';

const STORAGE_KEY = 'traveloop_access_token';
function readToken() {
  return localStorage.getItem(STORAGE_KEY) || '';
}

export default function ActivitySearchPage() {
  const [searchParams] = useSearchParams();
  const stopId = searchParams.get('stop_id');

  const [activities, setActivities] = useState([]);
  const [addedActivities, setAddedActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter states
  const [category, setCategory] = useState('');
  const [maxCost, setMaxCost] = useState('');
  const [maxDuration, setMaxDuration] = useState('');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadData() {
      setLoading(true);
      setError('');
      try {
        const token = readToken();
        const params = {};
        if (category) params.category = category;
        if (maxCost) params.max_cost = maxCost;
        if (maxDuration) params.max_duration = maxDuration;

        const promises = [getActivities(params)];
        if (stopId && token) {
          promises.push(getStopActivities(stopId, token));
        }

        const results = await Promise.all(promises);
        
        if (active) {
          setActivities(results[0].data.activities || []);
          setTotal(results[0].data.total || 0);

          if (stopId && results[1]) {
            setAddedActivities(results[1].data || []);
          }
        }
      } catch (err) {
        if (active) setError(err.message || 'Failed to load activities');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();
    return () => {
      active = false;
    };
  }, [category, maxCost, maxDuration, stopId]);

  async function handleToggleAdd(activityId) {
    if (!stopId) {
      alert("Please select a trip stop from the Itinerary Builder before adding activities.");
      return;
    }
    const token = readToken();
    if (!token) return;

    try {
      const existing = addedActivities.find(a => a.activity_id === activityId);
      if (existing) {
        await removeStopActivity(stopId, existing.id, token);
        setAddedActivities(prev => prev.filter(a => a.id !== existing.id));
      } else {
        const res = await addStopActivity(stopId, { activity_id: activityId }, token);
        setAddedActivities(prev => [...prev, res.data]);
      }
    } catch (err) {
      alert(err.message || "Failed to toggle activity");
    }
  }

  return (
    <ScreenFrame
      eyebrow="Experiences"
      title="Activity Search"
      description={stopId ? "Browse and attach activities directly to your selected stop." : "Browse and discover things to do across various destinations."}
      actions={
        <button className="primary-button screen-button" type="button" onClick={() => window.history.back()}>
          <span>Done</span>
          <span aria-hidden="true">-&gt;</span>
        </button>
      }
      aside={
        <div className="screen-summary">
          <div className="screen-summary__row">
            <strong>{total}</strong>
            <span>Results found</span>
          </div>
          <div className="screen-summary__row">
            <strong>{addedActivities.length}</strong>
            <span>Added to stop</span>
          </div>
        </div>
      }
    >
      <section className="screen-card">
        <div className="chip-list">
          <button 
            className={`chip ${!category && !maxCost && !maxDuration ? 'chip--active' : ''}`} 
            type="button" 
            onClick={() => { setCategory(''); setMaxCost(''); setMaxDuration(''); }}
          >
            All
          </button>
          <button 
            className={`chip ${category === 'culture' ? 'chip--active' : ''}`} 
            type="button"
            onClick={() => setCategory(category === 'culture' ? '' : 'culture')}
          >
            Culture
          </button>
          <button 
            className={`chip ${category === 'food' ? 'chip--active' : ''}`} 
            type="button"
            onClick={() => setCategory(category === 'food' ? '' : 'food')}
          >
            Food
          </button>
          <button 
            className={`chip ${category === 'nature' ? 'chip--active' : ''}`} 
            type="button"
            onClick={() => setCategory(category === 'nature' ? '' : 'nature')}
          >
            Nature
          </button>
          <button 
            className={`chip ${maxCost === '3000' ? 'chip--active' : ''}`} 
            type="button"
            onClick={() => setMaxCost(maxCost === '3000' ? '' : '3000')}
          >
            Under INR 3K
          </button>
          <button 
            className={`chip ${maxDuration === '3' ? 'chip--active' : ''}`} 
            type="button"
            onClick={() => setMaxDuration(maxDuration === '3' ? '' : '3')}
          >
            Under 3 hours
          </button>
        </div>

        {error && <p className="screen-empty screen-empty--error">{error}</p>}
        {loading && !error && <p className="screen-empty">Loading activities...</p>}
        {!loading && !error && activities.length === 0 && <p className="screen-empty">No activities found.</p>}

        <div className="result-list">
          {!loading && activities.map((activity) => {
            const isAdded = addedActivities.some(a => a.activity_id === activity.id);
            return (
              <article className="result-card" key={activity.id} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                {activity.image_url && (
                  <img 
                    src={activity.image_url} 
                    alt={activity.title} 
                    style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '0.75rem', flexShrink: 0 }}
                  />
                )}
                <div style={{ flex: 1 }}>
                  <h3>
                    {activity.title}
                    <span style={{ textTransform: 'capitalize' }}>{activity.category}</span>
                  </h3>
                  <p>
                    Duration: {activity.estimated_duration_hours ? `${activity.estimated_duration_hours}h` : 'N/A'} | Cost: INR {activity.estimated_cost}
                  </p>
                  {activity.description && (
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.4rem', marginBottom: '0.4rem' }}>
                      {activity.description}
                    </p>
                  )}
                  {activity.city_name && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>📍 {activity.city_name}, {activity.country}</p>
                  )}
                </div>
                <button 
                  className={`result-card__button ${isAdded ? 'secondary-button' : 'primary-button'}`} 
                  type="button"
                  onClick={() => handleToggleAdd(activity.id)}
                  style={isAdded ? { background: '#eee', color: '#333' } : {}}
                >
                  {isAdded ? 'Remove' : 'Add'}
                </button>
              </article>
            );
          })}
        </div>
      </section>
    </ScreenFrame>
  );
}
