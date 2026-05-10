import { Link, useLocation } from 'react-router-dom';
import AppIcon from './AppIcon';
import LogoMark from './LogoMark';

export default function Sidebar({ items }) {
  const location = useLocation();

  return (
    <aside className="dashboard-sidebar">
      <div className="dashboard-sidebar__brand">
        <LogoMark />
        <span>Traveloop</span>
      </div>

      <nav className="dashboard-sidebar__nav" aria-label="Sidebar">
        {items.map((item) => (
          <Link
            key={item.label}
            className={`sidebar-item ${location.pathname === item.path ? 'is-active' : ''}`}
            to={item.path}
          >
            <span className="sidebar-item__icon" aria-hidden="true">
              <AppIcon kind={item.icon} />
            </span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

    </aside>
  );
}
