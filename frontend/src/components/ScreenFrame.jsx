import { Link } from 'react-router-dom';
import LogoMark from './LogoMark';

export default function ScreenFrame({ eyebrow, title, description, actions, aside, children }) {
  return (
    <main className="screen-shell">
      <header className="screen-nav">
        <div className="screen-nav__brand">
          <LogoMark />
          <div>
            <span className="screen-nav__label">Traveloop</span>
            <strong>{eyebrow}</strong>
          </div>
        </div>

        <Link to="/dashboard" className="screen-nav__back">
          Back to dashboard
        </Link>
      </header>

      <section className="screen-hero">
        <div className="screen-hero__copy">
          <span className="screen-kicker">{eyebrow}</span>
          <h1>{title}</h1>
          <p>{description}</p>

          {actions ? <div className="screen-actions">{actions}</div> : null}
        </div>

        {aside ? <div className="screen-hero__aside">{aside}</div> : null}
      </section>

      <section className="screen-layout">{children}</section>
    </main>
  );
}
