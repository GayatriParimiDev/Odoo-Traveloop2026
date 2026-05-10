export default function TripCard({ trip }) {
  return (
    <article className="trip-card">
      <div className="trip-card__head">
        <div>
          <h3>{trip.title}</h3>
          <p>{trip.route}</p>
        </div>
        <span className={`trip-card__status trip-card__status--${trip.status.toLowerCase()}`}>{trip.status}</span>
      </div>

      <div className="trip-card__meta">
        <span>{trip.dates}</span>
        <span>{trip.meta}</span>
      </div>

      <div className="trip-card__footer">
        <strong>{trip.budget}</strong>
        <button type="button" className="trip-card__button">
          View
        </button>
      </div>
    </article>
  );
}
