import ScreenFrame from '../components/ScreenFrame';

const days = [
  {
    label: 'Day 1',
    city: 'Tokyo',
    blocks: [
      { time: '08:00', title: 'Hotel check-in', cost: 'INR 0' },
      { time: '11:00', title: 'Shibuya walk', cost: 'INR 1,200' },
      { time: '18:00', title: 'Sushi tasting', cost: 'INR 3,500' },
    ],
  },
  {
    label: 'Day 2',
    city: 'Kyoto',
    blocks: [
      { time: '09:00', title: 'Temple route', cost: 'INR 800' },
      { time: '13:00', title: 'Tea ceremony', cost: 'INR 2,200' },
      { time: '19:00', title: 'Riverside dinner', cost: 'INR 4,000' },
    ],
  },
];

export default function ItineraryViewPage() {
  return (
    <ScreenFrame
      eyebrow="Screen 5"
      title="Itinerary View"
      description="Review the trip in a structured day-wise layout with time and cost blocks."
      actions={
        <>
          <button className="secondary-button screen-button" type="button">
            List View
          </button>
          <button className="secondary-button screen-button" type="button">
            Calendar View
          </button>
        </>
      }
      aside={
        <div className="screen-summary">
          <div className="screen-summary__row">
            <strong>2 views</strong>
            <span>Layout modes</span>
          </div>
          <div className="screen-summary__row">
            <strong>18 items</strong>
            <span>Scheduled blocks</span>
          </div>
        </div>
      }
    >
      <section className="screen-card">
        <div className="screen-card__header">
          <div>
            <h2>Daily Timeline</h2>
            <p>Each city groups the activities, meals, and travel movements for that day.</p>
          </div>
          <span className="screen-pill">Read only preview</span>
        </div>

        <div className="timeline">
          {days.map((day) => (
            <article className="timeline-day" key={day.label}>
              <div className="timeline-day__label">{day.label}</div>
              <div className="timeline-day__body">
                <h3>{day.city}</h3>
                <div className="timeline-blocks">
                  {day.blocks.map((block) => (
                    <div className="timeline-block" key={`${day.label}-${block.time}`}>
                      <span>{block.time}</span>
                      <strong>{block.title}</strong>
                      <em>{block.cost}</em>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </ScreenFrame>
  );
}
