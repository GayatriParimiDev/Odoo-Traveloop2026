import ScreenFrame from '../components/ScreenFrame';

const savedDestinations = ['Paris', 'Kyoto', 'Bali', 'Goa'];

export default function ProfileSettingsPage() {
  return (
    <ScreenFrame
      eyebrow="Screen 11"
      title="Profile and Settings"
      description="Edit your traveler profile, preferences, and saved destinations from one place."
      actions={
        <>
          <button className="primary-button screen-button" type="button">
            Save Changes
          </button>
          <button className="secondary-button screen-button" type="button">
            Delete Account
          </button>
        </>
      }
      aside={
        <div className="screen-summary">
          <div className="screen-summary__row">
            <strong>INR</strong>
            <span>Preferred currency</span>
          </div>
          <div className="screen-summary__row">
            <strong>EN</strong>
            <span>Language</span>
          </div>
        </div>
      }
    >
      <section className="screen-card screen-card--split">
        <div className="mini-panel">
          <div className="screen-card__header">
            <div>
              <h2>Profile Details</h2>
              <p>Editable fields for the account identity and preferences.</p>
            </div>
          </div>

          <div className="form-grid">
            <label className="field">
              <span className="field__label">Full name</span>
              <span className="field__control">
                <input type="text" placeholder="Ananya Sharma" />
              </span>
            </label>
            <label className="field">
              <span className="field__label">Email</span>
              <span className="field__control">
                <input type="email" placeholder="ananya@example.com" />
              </span>
            </label>
            <label className="field">
              <span className="field__label">Language</span>
              <span className="field__control">
                <select defaultValue="en">
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="fr">French</option>
                </select>
              </span>
            </label>
            <label className="field">
              <span className="field__label">Currency</span>
              <span className="field__control">
                <select defaultValue="inr">
                  <option value="inr">INR</option>
                  <option value="usd">USD</option>
                  <option value="eur">EUR</option>
                </select>
              </span>
            </label>
          </div>
        </div>

        <div className="mini-panel mini-panel--accent">
          <div className="screen-card__header">
            <div>
              <h2>Saved Destinations</h2>
              <p>Quick access to places you want to revisit later.</p>
            </div>
          </div>

          <div className="chip-list">
            {savedDestinations.map((destination) => (
              <span className="chip chip--static" key={destination}>
                {destination}
              </span>
            ))}
          </div>
        </div>
      </section>
    </ScreenFrame>
  );
}
