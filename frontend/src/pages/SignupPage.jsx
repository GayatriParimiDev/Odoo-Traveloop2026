import { Link } from 'react-router-dom';
import Field from '../components/Field';

export default function SignupPage() {
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
                trailing={<span className="select-caret">^</span>}
              />
            </div>

            <div className="grid-two">
              <Field label="Password" type="password" placeholder="********" />
              <Field label="Confirm Password" type="password" placeholder="********" />
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
