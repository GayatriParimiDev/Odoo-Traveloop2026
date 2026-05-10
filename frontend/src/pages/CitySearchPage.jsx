import ScreenFrame from '../components/ScreenFrame';

const cityResults = [
  { city: 'Kyoto', country: 'Japan', cost: 'INR 9K / day', region: 'Asia', pop: '92' },
  { city: 'Paris', country: 'France', cost: 'INR 15K / day', region: 'Europe', pop: '98' },
  { city: 'Bali', country: 'Indonesia', cost: 'INR 7K / day', region: 'Asia', pop: '96' },
  { city: 'Rome', country: 'Italy', cost: 'INR 11K / day', region: 'Europe', pop: '94' },
];

export default function CitySearchPage() {
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
            <strong>24</strong>
            <span>Cities available</span>
          </div>
          <div className="screen-summary__row">
            <strong>4 filters</strong>
            <span>Country / region</span>
          </div>
        </div>
      }
    >
      <section className="screen-card">
        <div className="search-toolbar">
          <label className="field field--wide">
            <span className="field__label">Search city</span>
            <span className="field__control">
              <input type="text" placeholder="Tokyo, Lisbon, New York..." />
            </span>
          </label>

          <div className="chip-list">
            <button className="chip chip--active" type="button">
              All regions
            </button>
            <button className="chip" type="button">
              Asia
            </button>
            <button className="chip" type="button">
              Europe
            </button>
            <button className="chip" type="button">
              Americas
            </button>
          </div>
        </div>

        <div className="result-list">
          {cityResults.map((city) => (
            <article className="result-card" key={city.city}>
              <div>
                <h3>
                  {city.city}
                  <span>{city.country}</span>
                </h3>
                <p>{city.cost}</p>
              </div>
              <div className="result-card__meta">
                <span>{city.region}</span>
                <strong>{city.pop}</strong>
              </div>
              <button className="secondary-button result-card__button" type="button">
                Add to Trip
              </button>
            </article>
          ))}
        </div>
      </section>
    </ScreenFrame>
  );
}
