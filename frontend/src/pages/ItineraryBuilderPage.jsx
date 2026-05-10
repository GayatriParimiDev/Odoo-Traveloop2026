import AppIcon from '../components/AppIcon';
import ScreenFrame from '../components/ScreenFrame';

const stops = [
  { city: 'Tokyo', dates: '12 Apr - 15 Apr', notes: 'Arrival and city orientation' },
  { city: 'Kyoto', dates: '15 Apr - 18 Apr', notes: 'Temples, food, and gardens' },
  { city: 'Osaka', dates: '18 Apr - 22 Apr', notes: 'Night markets and departure' },
];

const activityOptions = ['Tea ceremony', 'Rail pass pickup', 'Temple walk', 'Food tour', 'Local market'];

export default function ItineraryBuilderPage() {
  return (
    <ScreenFrame
      eyebrow="Screen 4"
      title="Itinerary Builder"
      description="Add stops, assign dates, and map activities into a structured trip plan."
      actions={
        <>
          <button className="primary-button screen-button" type="button">
            <span>Add Stop</span>
            <span aria-hidden="true">-&gt;</span>
          </button>
          <button className="secondary-button screen-button" type="button">
            Save Draft
          </button>
        </>
      }
      aside={
        <div className="screen-summary">
          <div className="screen-summary__row">
            <strong>9 days</strong>
            <span>Trip length</span>
          </div>
          <div className="screen-summary__row">
            <strong>3 cities</strong>
            <span>Planned stops</span>
          </div>
          <div className="screen-summary__row">
            <strong>12 activities</strong>
            <span>Mapped so far</span>
          </div>
        </div>
      }
    >
      <section className="screen-card">
        <div className="screen-card__header">
          <div>
            <h2>Stops</h2>
            <p>Reorder the trip by moving each city into the desired sequence.</p>
          </div>
          <span className="screen-pill">Drag to reorder</span>
        </div>

        <div className="stop-list">
          {stops.map((stop, index) => (
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
      </section>

      <section className="screen-card screen-card--split">
        <div className="mini-panel">
          <div className="screen-card__header">
            <div>
              <h2>Add Stop</h2>
              <p>Pick a city and define the travel window for that stop.</p>
            </div>
          </div>

          <div className="form-grid">
            <label className="field">
              <span className="field__label">City</span>
              <span className="field__control">
                <input type="text" placeholder="Search city" />
              </span>
            </label>
            <label className="field">
              <span className="field__label">Arrival</span>
              <span className="field__control">
                <input type="date" />
              </span>
            </label>
            <label className="field">
              <span className="field__label">Departure</span>
              <span className="field__control">
                <input type="date" />
              </span>
            </label>
            <label className="field">
              <span className="field__label">Stay type</span>
              <span className="field__control">
                <select defaultValue="hotel">
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
              <p>Attach planned activities to the current stop.</p>
            </div>
          </div>

          <div className="chip-list">
            {activityOptions.map((activity) => (
              <button className="chip" type="button" key={activity}>
                {activity}
              </button>
            ))}
          </div>
        </div>
      </section>
    </ScreenFrame>
  );
}
