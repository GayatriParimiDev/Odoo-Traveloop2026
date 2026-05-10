import AppIcon from './AppIcon';

export default function MetricCard({ icon, title, subtitle }) {
  return (
    <article className="metric-card">
      <div className="metric-card__icon">
        <AppIcon kind={icon} />
      </div>
      <div className="metric-card__copy">
        <strong>{title}</strong>
        <span>{subtitle}</span>
      </div>
    </article>
  );
}
