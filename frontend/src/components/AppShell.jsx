import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { sidebarItems } from '../data/dashboard';

export default function AppShell() {
  const location = useLocation();
  const showSidebar = !['/login', '/signup'].includes(location.pathname);

  return (
    <div className={`app-shell ${showSidebar ? 'app-shell--sidebar' : ''}`}>
      {showSidebar ? <Sidebar items={sidebarItems} /> : null}
      <div className="app-shell__content">
        <Outlet />
      </div>
    </div>
  );
}
