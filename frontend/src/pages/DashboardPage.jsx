import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import MetricCard from '../components/MetricCard';
import TripCard from '../components/TripCard';
import DestinationCard from '../components/DestinationCard';
import AppIcon from '../components/AppIcon';
import {
  budgetBreakdown,
  dashboardMetrics,
  destinationCards,
  quickActions,
  recentTrips,
  sidebarItems,
} from '../data/dashboard';

export default function DashboardPage() {
  return (
    <main className="dashboard-shell">
      <Sidebar items={sidebarItems} />

      <div className="dashboard-main">
        <TopNav />

        <section className="hero-panel">
          <div className="hero-panel__image" aria-hidden="true" />
          <div className="hero-panel__veil" aria-hidden="true" />

          <div className="hero-content">
            <span className="hero-chip">
              <AppIcon kind="spark" />
              PREMIUM CURATED TRAVEL
            </span>
            <h1 className="hero-title">
              Plan Your Journey
              <span>Beyond Borders</span>
            </h1>
            <p className="hero-copy">
              Welcome back, Ananya. Review your latest trips, continue planning, and keep your
              budget, cities, and activities in one place.
            </p>
            <div className="hero-actions">
              <button className="primary-button hero-button" type="button">
                <span>Plan New Trip</span>
                <span aria-hidden="true" className="button-arrow">
                  -&gt;
                </span>
              </button>
              <button className="secondary-button hero-button hero-button--secondary" type="button">
                <span aria-hidden="true" className="hero-button__icon">
                  <AppIcon kind="clock" />
                </span>
                <span>View Itinerary</span>
              </button>
            </div>

            <div className="hero-insights" aria-label="Travel highlights">
              <div className="hero-insight">
                <strong>Curated for you</strong>
                <span>Handpicked destinations and experiences</span>
              </div>
              <div className="hero-insight">
                <strong>Trusted booking</strong>
                <span>Review trip costs before you commit</span>
              </div>
              <div className="hero-insight">
                <strong>Concierge support</strong>
                <span>Personal help when plans get complex</span>
              </div>
            </div>
          </div>

          <aside className="hero-summary" aria-label="Trip summary">
            <article className="summary-card summary-card--feature">
              <div className="summary-card__icon">
                <AppIcon kind="plane" />
              </div>
              <div className="summary-card__body">
                <span>Next trip</span>
                <strong>Cherry Blossom 2026</strong>
                <p>Tokyo -> Kyoto | 12 Apr - 22 Apr</p>
              </div>
            </article>

            <article className="summary-card">
              <div className="summary-card__icon summary-card__icon--warm">
                <AppIcon kind="shield" />
              </div>
              <div className="summary-card__body">
                <span>Budget remaining</span>
                <strong>INR 1.8L</strong>
                <p>Well under the current trip target.</p>
              </div>
            </article>

            <article className="summary-card">
              <div className="summary-card__icon summary-card__icon--cool">
                <AppIcon kind="users" />
              </div>
              <div className="summary-card__body">
                <span>Community</span>
                <strong>50K+ explorers</strong>
                <p>Share, copy, and refine public itineraries.</p>
              </div>
            </article>
          </aside>
        </section>

        <section className="metric-row" aria-label="Platform metrics">
          {dashboardMetrics.map((metric) => (
            <MetricCard key={metric.title} {...metric} />
          ))}
        </section>

        <section className="dashboard-grid">
          <section className="panel-card trips-panel">
            <div className="panel-header">
              <div>
                <h2>Recent Trips</h2>
                <p>Keep moving on the trips you already started.</p>
              </div>
              <a href="#all-trips">View all trips -&gt;</a>
            </div>

            <div className="trip-list">
              {recentTrips.map((trip) => (
                <TripCard key={trip.title} trip={trip} />
              ))}
            </div>
          </section>

          <aside className="side-stack">
            <section className="panel-card budget-card">
              <div className="panel-header panel-header--compact">
                <div>
                  <h3>Budget Highlights</h3>
                  <p>Projected spend across the active trip.</p>
                </div>
              </div>

              <div className="budget-summary">
                <div>
                  <span>Total planned</span>
                  <strong>INR 2.98L</strong>
                </div>
                <div className="budget-summary__right">
                  <span>Target</span>
                  <strong>INR 3.50L</strong>
                </div>
              </div>

              <div className="budget-chart" aria-hidden="true">
                {budgetBreakdown.map((item) => (
                  <div className="budget-chart__row" key={item.label}>
                    <span>{item.label}</span>
                    <div className="budget-chart__bar">
                      <span style={{ width: `${item.percent}%` }} />
                    </div>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            </section>

            <section className="panel-card quick-actions-card">
              <div className="panel-header panel-header--compact">
                <div>
                  <h3>Quick Actions</h3>
                  <p>Shortcuts for the most common trip tasks.</p>
                </div>
              </div>

              <div className="quick-actions-list">
                {quickActions.map((action) => (
                  <button className="quick-action" type="button" key={action.title}>
                    <span className="quick-action__icon">
                      <AppIcon kind={action.icon} />
                    </span>
                    <span className="quick-action__copy">
                      <strong>{action.title}</strong>
                      <span>{action.subtitle}</span>
                    </span>
                  </button>
                ))}
              </div>
            </section>
          </aside>
        </section>

        <section className="panel-card recommendations-panel">
          <div className="panel-header">
            <div>
              <h2>Recommended Destinations</h2>
              <p>Inspiration for your next adventure.</p>
            </div>
            <a href="#destinations">View all destinations -&gt;</a>
          </div>

          <div className="destination-grid">
            {destinationCards.map((destination) => (
              <DestinationCard key={destination.title} {...destination} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
