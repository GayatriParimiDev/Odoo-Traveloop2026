import { useEffect, useMemo, useState } from 'react';
import ScreenFrame from '../components/ScreenFrame';
import { getCities } from '../api';

const regionMap = {
  India: 'Asia',
  Japan: 'Asia',
  Indonesia: 'Asia',
  France: 'Europe',
  Italy: 'Europe',
};

function formatCost(amount, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(Number(amount || 0));
}

function getRegion(country) {
  return regionMap[country] || 'Other';
}

export default function CitySearchPage() {
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('All regions');
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadCities() {
      setLoading(true);
      setError('');

      try {
        const response = await getCities({ search: search.trim() || undefined, sort_by: 'popularity', limit: 50 });
        if (!active) return;
        setCities(response.data?.cities || []);
      } catch (err) {
        if (!active) return;
        setError(err.message || 'Failed to load cities');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadCities();
    return () => {
      active = false;
    };
  }, [search]);

  const filteredCities = useMemo(() => {
    if (region === 'All regions') return cities;
    return cities.filter((city) => getRegion(city.country) === region);
  }, [cities, region]);

  return (
    <ScreenFrame
      eyebrow="Screen 6"
      title="City Search"
      description="Search destinations, compare cost indices, and add cities directly into a trip."
      actions={
        <button className="primary-button screen-button" type="button">
          <span>Add to Trip</span>
          <span aria-hidden="true">-&gt;</span>
        </button>
      }
      aside={
        <div className="screen-summary">
          <div className="screen-summary__row">
            <strong>{cities.length}</strong>
            <span>Cities available</span>
          </div>
          <div className="screen-summary__row">
            <strong>{new Set(cities.map((city) => getRegion(city.country))).size}</strong>
            <span>Regions found</span>
          </div>
        </div>
      }
    >
      <section className="screen-card">
        <div className="search-toolbar">
          <label className="field field--wide">
            <span className="field__label">Search city</span>
            <span className="field__control">
              <input
                type="text"
                placeholder="Tokyo, Lisbon, New York..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </span>
          </label>

          <div className="chip-list">
            {['All regions', 'Asia', 'Europe', 'Americas', 'Other'].map((item) => (
              <button
                className={`chip ${region === item ? 'chip--active' : ''}`}
                type="button"
                key={item}
                onClick={() => setRegion(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {loading ? <p className="screen-empty">Loading cities from the database...</p> : null}
        {error ? <p className="screen-empty screen-empty--error">{error}</p> : null}

        {!loading && !error && filteredCities.length === 0 ? (
          <div className="screen-empty-state">
            <h3>No matching cities</h3>
            <p>Try another search term or region filter.</p>
          </div>
        ) : null}

        <div className="result-list">
          {!loading && !error
            ? filteredCities.map((city) => (
                <article className="result-card" key={city.id}>
                  <div>
                    <h3>
                      {city.city_name}
                      <span>{city.country}</span>
                    </h3>
                    <p>{formatCost(city.average_daily_cost)} / day</p>
                  </div>
                  <div className="result-card__meta">
                    <span>{getRegion(city.country)}</span>
                    <strong>{city.popularity_score}</strong>
                  </div>
                  <button className="secondary-button result-card__button" type="button">
                    Add to Trip
                  </button>
                </article>
              ))
            : null}
        </div>
      </section>
    </ScreenFrame>
  );
}
