import ScreenFrame from '../components/ScreenFrame';

const categories = [
  { label: 'Transport', value: 'INR 1.20L', percent: 72 },
  { label: 'Stay', value: 'INR 96K', percent: 58 },
  { label: 'Activities', value: 'INR 54K', percent: 36 },
  { label: 'Meals', value: 'INR 28K', percent: 22 },
];

export default function BudgetPage() {
  return (
    <ScreenFrame
      eyebrow="Screen 8"
      title="Trip Budget"
      description="Track projected spend by category and watch for budget pressure before it happens."
      actions={
        <button className="secondary-button screen-button" type="button">
          Export Breakdown
        </button>
      }
      aside={
        <div className="screen-summary screen-summary--alert">
          <div className="screen-summary__row">
            <strong>INR 2.98L</strong>
            <span>Planned total</span>
          </div>
          <div className="screen-summary__row">
            <strong>INR 52K</strong>
            <span>Remaining</span>
          </div>
          <p>Watch the trip closely if any category moves above target.</p>
        </div>
      }
    >
      <section className="screen-card">
        <div className="screen-card__header">
          <div>
            <h2>Category Breakdown</h2>
            <p>Transport, stay, activities, and meals are tracked separately.</p>
          </div>
        </div>

        <div className="budget-visual">
          {categories.map((item) => (
            <article className="budget-row" key={item.label}>
              <div>
                <strong>{item.label}</strong>
                <span>{item.value}</span>
              </div>
              <div className="budget-row__bar">
                <span style={{ width: `${item.percent}%` }} />
              </div>
            </article>
          ))}
        </div>

        <div className="budget-footer">
          <div>
            <strong>Average per day</strong>
            <span>INR 33K</span>
          </div>
          <div>
            <strong>Status</strong>
            <span>Within target range</span>
          </div>
        </div>
      </section>
    </ScreenFrame>
  );
}
