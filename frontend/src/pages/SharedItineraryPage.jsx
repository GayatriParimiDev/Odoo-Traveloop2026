import ScreenFrame from '../components/ScreenFrame';

const summaryItems = [
  { title: 'Route', value: 'Tokyo -> Kyoto -> Osaka' },
  { title: 'Visibility', value: 'Public' },
  { title: 'Copy setting', value: 'Allowed' },
];

export default function SharedItineraryPage() {
  return (
    <ScreenFrame
      eyebrow="Screen 10"
      title="Shared Itinerary"
      description="Publish a read-only version of the trip and share the public URL with others."
      actions={
        <>
          <button className="primary-button screen-button" type="button">
            Copy Trip
          </button>
          <button className="secondary-button screen-button" type="button">
            Share Link
          </button>
        </>
      }
      aside={
        <div className="screen-summary">
          <div className="screen-summary__row">
            <strong>travel.loop/japan-2026</strong>
            <span>Public URL</span>
          </div>
          <div className="screen-summary__row">
            <strong>1.2K</strong>
            <span>Views</span>
          </div>
        </div>
      }
    >
      <section className="screen-card">
        <div className="screen-card__header">
          <div>
            <h2>Public Summary</h2>
            <p>Visible itinerary metadata with the trip details users can inspect or copy.</p>
          </div>
        </div>

        <div className="summary-grid">
          {summaryItems.map((item) => (
            <article className="summary-tile" key={item.title}>
              <span>{item.title}</span>
              <strong>{item.value}</strong>
            </article>
          ))}
        </div>

        <div className="share-row">
          <button className="secondary-button screen-button" type="button">
            X
          </button>
          <button className="secondary-button screen-button" type="button">
            Facebook
          </button>
          <button className="secondary-button screen-button" type="button">
            WhatsApp
          </button>
        </div>
      </section>
    </ScreenFrame>
  );
}
