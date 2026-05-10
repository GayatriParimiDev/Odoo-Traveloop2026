import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import ActivitySearchPage from './pages/ActivitySearchPage';
import BudgetPage from './pages/BudgetPage';
import CitySearchPage from './pages/CitySearchPage';
import ItineraryBuilderPage from './pages/ItineraryBuilderPage';
import ItineraryViewPage from './pages/ItineraryViewPage';
import LoginPage from './pages/LoginPage';
import PackingChecklistPage from './pages/PackingChecklistPage';
import ProfileSettingsPage from './pages/ProfileSettingsPage';
import SharedItineraryPage from './pages/SharedItineraryPage';
import SignupPage from './pages/SignupPage';
import TripNotesPage from './pages/TripNotesPage';

export default function App() {
  const location = useLocation();

  return (
    <Routes location={location}>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/itinerary-builder" element={<ItineraryBuilderPage />} />
      <Route path="/itinerary-view" element={<ItineraryViewPage />} />
      <Route path="/city-search" element={<CitySearchPage />} />
      <Route path="/activity-search" element={<ActivitySearchPage />} />
      <Route path="/budget" element={<BudgetPage />} />
      <Route path="/packing-checklist" element={<PackingChecklistPage />} />
      <Route path="/shared-itinerary" element={<SharedItineraryPage />} />
      <Route path="/settings" element={<ProfileSettingsPage />} />
      <Route path="/trip-notes" element={<TripNotesPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
