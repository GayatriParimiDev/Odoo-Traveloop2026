import ScreenFrame from '../components/ScreenFrame';

const activities = [
  { title: 'Tea Ceremony', type: 'Culture', duration: '2h', cost: 'INR 2,200' },
  { title: 'Street Food Crawl', type: 'Food', duration: '3h', cost: 'INR 3,500' },
  { title: 'Sunset Boat Ride', type: 'Relaxation', duration: '1.5h', cost: 'INR 1,800' },
  { title: 'Mountain Hike', type: 'Nature', duration: '4h', cost: 'INR 2,900' },
];

export default function ActivitySearchPage() {
  return (
    <ScreenFrame
      eyebrow="Screen 7"
      title="Activity Search"
      description="Filter by category, duration, or cost and attach activities to each stop."
      actions={
        <button className="primary-button screen-button" type="button">
          <span>Attach Activity</span>
          <span aria-hidden="true">-&gt;</span>
        </button>
      }
      aside={
        <div className="screen-summary">
          <div className="screen-summary__row">
            <strong>12</strong>
            <span>Filters / tags</span>
          </div>
          <div className="screen-summary__row">
            <strong>4.8 avg</strong>
            <span>Rating score</span>
          </div>
        </div>
      }
    >
      <section className="screen-card">
        <div className="chip-list">
          <button className="chip chip--active" type="button">
            All
          </button>
          <button className="chip" type="button">
            Culture
          </button>
          <button className="chip" type="button">
            Food
          </button>
          <button className="chip" type="button">
            Nature
          </button>
          <button className="chip" type="button">
            Under INR 3K
          </button>
        </div>

        <div className="result-list">
          {activities.map((activity) => (
            <article className="result-card" key={activity.title}>
              <div>
                <h3>
                  {activity.title}
                  <span>{activity.type}</span>
                </h3>
                <p>
                  Duration: {activity.duration} | Cost: {activity.cost}
                </p>
              </div>
              <button className="secondary-button result-card__button" type="button">
                Add
              </button>
            </article>
          ))}
        </div>
      </section>
    </ScreenFrame>
  );
}
