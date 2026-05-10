import AppIcon from './AppIcon';

export default function DestinationCard({ title, country, tag, tone }) {
  return (
    <article className={`destination-card destination-card--${tone}`}>
      <div className="destination-card__image" />
      <button className="destination-card__bookmark" type="button" aria-label={`Save ${title}`}>
        <AppIcon kind="saved" />
      </button>
      <div className="destination-card__overlay">
        <span className="destination-card__country">{country}</span>
        <h3>{title}</h3>
        <span className="destination-card__tag">{tag}</span>
      </div>
    </article>
  );
}
