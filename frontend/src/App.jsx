import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import AppShell from './components/AppShell';
import DashboardPage from './pages/DashboardPage';
import MyTripsPage from './pages/MyTripsPage';
import CreateTripPage from './pages/CreateTripPage';
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
      <Route element={<AppShell />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/trips" element={<MyTripsPage />} />
        <Route path="/trips/new" element={<CreateTripPage />} />
        <Route path="/itinerary-builder" element={<ItineraryBuilderPage />} />
        <Route path="/itinerary-view" element={<ItineraryViewPage />} />
        <Route path="/city-search" element={<CitySearchPage />} />
        <Route path="/activity-search" element={<ActivitySearchPage />} />
        <Route path="/budget" element={<BudgetPage />} />
        <Route path="/packing-checklist" element={<PackingChecklistPage />} />
      <Route path="/shared-itinerary" element={<SharedItineraryPage />} />
      <Route path="/shared-itinerary/:slug" element={<SharedItineraryPage />} />
      <Route path="/settings" element={<ProfileSettingsPage />} />
        <Route path="/trip-notes" element={<TripNotesPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
