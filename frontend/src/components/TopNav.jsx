import AppIcon from './AppIcon';

export default function TopNav() {
  return (
    <header className="dashboard-nav">
      <div className="dashboard-nav__brand">
        <span className="dashboard-nav__logo">Traveloop</span>
        <nav className="dashboard-nav__links" aria-label="Primary">
          <a className="is-active" href="#explore">
            Explore
          </a>
          <a href="#community">Community</a>
          <a href="#concierge">Concierge</a>
        </nav>
      </div>

      <div className="dashboard-nav__actions">
        <label className="search-pill" aria-label="Search destination">
          <AppIcon kind="search" />
          <input type="text" placeholder="Search destination" />
        </label>

        <button className="icon-button" type="button" aria-label="Notifications">
          <AppIcon kind="messages" />
        </button>

        <button className="icon-button" type="button" aria-label="Settings">
          <AppIcon kind="settings" />
        </button>

        <div className="avatar" aria-label="Profile avatar">
          <span>AD</span>
        </div>
      </div>
    </header>
  );
}
