import AppIcon from './AppIcon';
import LogoMark from './LogoMark';

export default function Sidebar({ items }) {
  return (
    <aside className="dashboard-sidebar">
      <div className="dashboard-sidebar__brand">
        <LogoMark />
        <span>Traveloop</span>
      </div>

      <nav className="dashboard-sidebar__nav" aria-label="Sidebar">
        {items.map((item) => (
          <button
            key={item.label}
            className={`sidebar-item ${item.active ? 'is-active' : ''}`}
            type="button"
          >
            <span className="sidebar-item__icon" aria-hidden="true">
              <AppIcon kind={item.icon} />
            </span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-promo sidebar-promo--top">
        <div className="sidebar-promo__icon">
          <AppIcon kind="spark" />
        </div>
        <div>
          <strong>Plan with Concierge</strong>
          <p>Personalized travel assistance</p>
        </div>
        <span className="sidebar-promo__arrow">-&gt;</span>
      </div>

      <div className="sidebar-promo sidebar-promo--bottom">
        <p>Unlock exclusive travel perks</p>
        <strong>Join Elite -&gt;</strong>
        <div className="sidebar-promo__luggage" aria-hidden="true">
          <div />
        </div>
      </div>
    </aside>
  );
}
