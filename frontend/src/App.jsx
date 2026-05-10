import { Navigate, Route, Routes, Link, useLocation, useNavigate } from 'react-router-dom';

function LogoMark() {
  return (
    <div className="logo-mark" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M4.5 14.75 19.5 10.1l-6.8-2.2-2.2-3.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M8.4 15.4 7.1 11.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M5 18.5h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function Field({
  label,
  type = 'text',
  placeholder,
  icon,
  trailing,
  wide,
  hideLabel = false,
}) {
  return (
    <label className={`field ${wide ? 'field--wide' : ''}`}>
      {hideLabel ? null : <span className="field__label">{label}</span>}
      <span className="field__control">
        {icon ? <span className="field__icon">{icon}</span> : null}
        <input type={type} placeholder={placeholder} />
        {trailing ? <span className="field__trailing">{trailing}</span> : null}
      </span>
    </label>
  );
}

function TopNav() {
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
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
            <path d="m16 16 4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <input type="text" placeholder="Search destination" />
        </label>

        <button className="icon-button" type="button" aria-label="Notifications">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M12 4.5a5 5 0 0 0-5 5v2.8c0 .7-.2 1.4-.6 2l-1 1.5h13.2l-1-1.5a3.6 3.6 0 0 1-.6-2V9.5a5 5 0 0 0-5-5Z"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinejoin="round"
            />
            <path d="M10.5 19a1.5 1.5 0 0 0 3 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        </button>

        <button className="icon-button" type="button" aria-label="Settings">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="m12 8.1 1.5 1 .4 1.8 1.8.4 1 1.5-1 1.5-1.8.4-.4 1.8-1.5 1-1.5-1-.4-1.8-1.8-.4-1-1.5 1-1.5 1.8-.4.4-1.8 1.5-1Z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        </button>

        <div className="avatar" aria-label="Profile avatar">
          <span>AD</span>
        </div>
      </div>
    </header>
  );
}

function Sidebar() {
  const items = [
    { label: 'Dashboard', active: true, icon: '◌' },
    { label: 'My Trips', icon: '▣' },
    { label: 'Saved Places', icon: '▰' },
    { label: 'Experiences', icon: '◫' },
    { label: 'Messages', icon: '✉' },
    { label: 'Bookings', icon: '▤' },
    { label: 'Settings', icon: '⚙' },
  ];

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
              {item.icon}
            </span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-promo sidebar-promo--top">
        <div className="sidebar-promo__icon">♨</div>
        <div>
          <strong>Plan with Concierge</strong>
          <p>Personalized travel assistance</p>
        </div>
        <span className="sidebar-promo__arrow">→</span>
      </div>

      <div className="sidebar-promo sidebar-promo--bottom">
        <p>Unlock exclusive travel perks</p>
        <strong>Join Elite →</strong>
        <div className="sidebar-promo__luggage" aria-hidden="true">
          <div />
        </div>
      </div>
    </aside>
  );
}

function MetricCard({ icon, title, subtitle }) {
  return (
    <article className="metric-card">
      <div className="metric-card__icon">{icon}</div>
      <div className="metric-card__copy">
        <strong>{title}</strong>
        <span>{subtitle}</span>
      </div>
    </article>
  );
}

function StatCard({ icon, title, subtitle, placement = '', body }) {
  return (
    <div className={`dashboard-stat ${placement}`}>
      <div className="dashboard-stat__icon">{icon}</div>
      <div className="dashboard-stat__copy">
        <strong>{title}</strong>
        <span>{subtitle}</span>
        {body ? <p>{body}</p> : null}
      </div>
    </div>
  );
}

function DestinationCard({ title, rating, subtitle, className, imageClass }) {
  return (
    <article className={`destination-card ${className || ''}`}>
      <div className={`destination-card__image ${imageClass || ''}`} />
      <div className="destination-card__overlay">
        <h3>{title}</h3>
        <p>{rating}</p>
        {subtitle ? <span>{subtitle}</span> : null}
      </div>
      <button className="destination-card__bookmark" type="button" aria-label={`Save ${title}`}>
        <svg viewBox="0 0 24 24" fill="none">
          <path
            d="M7.5 5.5h9v14l-4.5-2.8L7.5 19.5v-14Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </article>
  );
}

function DashboardPage() {
  return (
    <main className="dashboard-shell">
      <Sidebar />

      <div className="dashboard-main">
        <TopNav />

        <section className="hero-panel">
          <div className="hero-panel__scene" aria-hidden="true">
            <span className="hero-panel__sun" />
            <span className="hero-panel__haze" />
            <span className="hero-panel__ridge hero-panel__ridge--1" />
            <span className="hero-panel__ridge hero-panel__ridge--2" />
            <span className="hero-panel__ridge hero-panel__ridge--3" />
            <span className="hero-panel__water" />
            <span className="hero-panel__path" />
            <span className="hero-balloon hero-balloon--1" />
            <span className="hero-balloon hero-balloon--2" />
            <span className="hero-balloon hero-balloon--3" />
            <span className="hero-cloud hero-cloud--1" />
            <span className="hero-cloud hero-cloud--2" />
            <span className="hero-cloud hero-cloud--3" />
            <span className="hero-plane" />
          </div>

          <StatCard
            placement="dashboard-stat--topright"
            title="50K+"
            subtitle="Elite Explorers"
            body="Join a global community of passionate travelers."
            icon={
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 17.5c1.6-3 4.1-4.5 8-4.5s6.4 1.5 8 4.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <circle cx="12" cy="9" r="3" stroke="currentColor" strokeWidth="1.8" />
                <circle cx="5.5" cy="8.8" r="1.4" fill="currentColor" />
                <circle cx="18.5" cy="8.8" r="1.4" fill="currentColor" />
              </svg>
            }
          />

          <div className="hero-content">
            <span className="hero-chip">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M4.5 14.5h15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                <path
                  d="m8 10.5 4 4 4-4"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M8 17h8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
              PREMIUM CURATED TRAVEL
            </span>
            <h1 className="hero-title">
              Plan Your Journey
              <span>Beyond Borders</span>
            </h1>
            <p className="hero-copy">
              Discover handpicked destinations, connect with a curated community of explorers,
              and elevate your travel experience with personalized concierge services.
            </p>
            <div className="hero-actions">
              <button className="primary-button hero-button" type="button">
                <span>Start Planning</span>
                <span aria-hidden="true" className="button-arrow">
                  →
                </span>
              </button>
              <button className="secondary-button hero-button hero-button--secondary" type="button">
                <span aria-hidden="true" className="hero-button__icon">
                  ◔
                </span>
                <span>View Experiences</span>
              </button>
            </div>
          </div>

          <div className="hero-badge-row">
            <MetricCard icon="🌍" title="120+" subtitle="Countries Curated" />
            <MetricCard icon="📍" title="10K+" subtitle="Destinations" />
            <MetricCard icon="★" title="25K+" subtitle="Experiences" />
            <MetricCard icon="👥" title="50K+" subtitle="Elite Explorers" />
          </div>
        </section>

        <section className="dashboard-grid">
          <section className="trending-panel">
            <div className="panel-header">
              <div>
                <h2>Curated Destinations</h2>
                <p>Inspiration for your next adventure</p>
              </div>
              <a href="#all">View all destinations →</a>
            </div>

            <div className="destination-grid">
              <DestinationCard
                title="Swiss Alps"
                rating="Switzerland"
                subtitle="Best for Nature"
                imageClass="destination-card__image--paris"
              />
              <DestinationCard
                title="Amalfi Coast"
                rating="Italy"
                subtitle="Best for Romance"
                imageClass="destination-card__image--kyoto"
              />
              <DestinationCard
                title="Petra"
                rating="Jordan"
                subtitle="Best for Culture"
                imageClass="destination-card__image--petra"
              />
              <DestinationCard
                title="Baa Atoll"
                rating="Maldives"
                subtitle="Best for Relaxation"
                imageClass="destination-card__image--maldives"
              />
            </div>
          </section>

          <aside className="side-stack">
            <section className="concierge-card">
              <div className="concierge-card__icon">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M8 9.5a4 4 0 1 1 8 0v3.3c0 .8.3 1.6.8 2.2l.7.8H6.5l.7-.8c.5-.6.8-1.4.8-2.2V9.5Z"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinejoin="round"
                  />
                  <path d="M10 18a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                </svg>
              </div>
              <h3>AI Concierge</h3>
              <p>Let our AI craft a bespoke itinerary based on your aesthetic preferences.</p>
              <button className="light-button" type="button">
                Generate Itinerary
              </button>
            </section>

            <section className="budget-card">
              <div className="panel-header panel-header--compact">
                <h3>Trip Budget</h3>
              </div>
              <div className="budget-meta">
                <div>
                  <span>Current Trip</span>
                  <strong>$4,250</strong>
                </div>
                <div className="budget-meta__right">
                  <span>Target</span>
                  <strong>$5,000</strong>
                </div>
              </div>
              <div className="budget-bar" aria-hidden="true">
                <span />
              </div>
              <p className="budget-footnote">85% of budget used</p>
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}

function SignupPage() {
  return (
    <main className="auth auth--signup">
      <section className="signup-visual" />

      <section className="signup-panel">
        <div className="signup-panel__inner">
          <h1 className="headline">Join the Journey</h1>
          <p className="lede">Create your account to unlock premium travel experiences.</p>

          <form className="auth-form auth-form--signup">
            <div className="photo-picker">
              <div className="photo-picker__circle" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4.8 7.5h3l1.4-2h5l1.4 2h3.4v10.8H4.8z"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinejoin="round"
                  />
                  <circle cx="12" cy="13" r="2.7" stroke="currentColor" strokeWidth="1.7" />
                  <path d="M18.2 5.8v3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                  <path d="M16.7 7.3h3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                </svg>
              </div>
              <span className="photo-picker__label">Profile Photo</span>
            </div>

            <div className="grid-two">
              <Field label="First Name" placeholder="Jane" />
              <Field label="Last Name" placeholder="Doe" />
            </div>

            <Field label="Email Address" type="email" placeholder="jane@example.com" wide />
            <Field label="Phone Number" type="tel" placeholder="+1 (555) 000-0000" wide />

            <div className="grid-two">
              <Field label="City" placeholder="Paris" />
              <Field
                label="Country"
                placeholder="Select a country"
                trailing={<span className="select-caret">⌄</span>}
              />
            </div>

            <div className="grid-two">
              <Field label="Password" type="password" placeholder="••••••••" />
              <Field label="Confirm Password" type="password" placeholder="••••••••" />
            </div>

            <label className="field field--wide">
              <span className="field__label">Travel Bio</span>
              <span className="field__control field__control--textarea">
                <textarea placeholder="What kind of traveler are you?" />
              </span>
            </label>

            <button className="primary-button primary-button--signup" type="button">
              <span>Create Account</span>
            </button>

            <p className="footer-copy footer-copy--signup">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}

function LoginPage() {
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();
    navigate('/dashboard');
  }

  return (
    <main className="auth auth--login">
      <div className="auth__login-backdrop" />
      <section className="login-card">
        <LogoMark />
        <h1 className="headline headline--center">Welcome Back</h1>
        <p className="lede lede--center">Sign in to continue your journey with Traveloop.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <Field
            label="Email address"
            type="email"
            placeholder="you@example.com"
            icon={
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 6.5h16v11H4z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                <path
                  d="m4.5 7 7.5 6 7.5-6"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
          />

          <div className="field-row">
            <span className="field__label">Password</span>
            <Link to="/signup" className="text-link">
              Forgot password?
            </Link>
          </div>

          <Field
            hideLabel
            label="Password"
            type="password"
            placeholder="••••••••"
            icon={
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M7.5 10V8.1a4.5 4.5 0 0 1 9 0V10"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <rect x="5" y="10" width="14" height="10" rx="2.3" stroke="currentColor" strokeWidth="1.8" />
              </svg>
            }
            trailing={
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M2.5 12s3.7-6 9.5-6 9.5 6 9.5 6-3.7 6-9.5 6-9.5-6-9.5-6Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.8" />
              </svg>
            }
          />

          <button className="primary-button" type="submit">
            <span>Sign in</span>
            <span aria-hidden="true" className="button-arrow">
              →
            </span>
          </button>

          <div className="divider">
            <span>Or continue with</span>
          </div>

          <button className="secondary-button" type="button">
            <span className="google-mark" aria-hidden="true">
              G
            </span>
            <span>Google</span>
          </button>
        </form>

        <p className="footer-copy">
          Don&apos;t have an account? <Link to="/signup">Sign up here</Link>
        </p>
      </section>
    </main>
  );
}

export default function App() {
  const location = useLocation();

  return (
    <Routes location={location}>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
