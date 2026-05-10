import ScreenFrame from '../components/ScreenFrame';

const groups = [
  {
    label: 'Documents',
    items: ['Passport', 'Visa copies', 'Travel insurance'],
  },
  {
    label: 'Electronics',
    items: ['Adapter', 'Power bank', 'Camera charger'],
  },
  {
    label: 'Clothing',
    items: ['Light jacket', 'Walking shoes', 'Evening wear'],
  },
];

export default function PackingChecklistPage() {
  return (
    <ScreenFrame
      eyebrow="Screen 9"
      title="Packing Checklist"
      description="Add reusable packing items, mark them packed, and reset the list for the next trip."
      actions={
        <>
          <button className="primary-button screen-button" type="button">
            Add Item
          </button>
          <button className="secondary-button screen-button" type="button">
            Reset Checklist
          </button>
        </>
      }
      aside={
        <div className="screen-summary">
          <div className="screen-summary__row">
            <strong>9 packed</strong>
            <span>Of 15 items</span>
          </div>
          <div className="screen-summary__row">
            <strong>3 groups</strong>
            <span>By category</span>
          </div>
        </div>
      }
    >
      <div className="screen-grid--two">
        {groups.map((group) => (
          <section className="screen-card" key={group.label}>
            <div className="screen-card__header">
              <div>
                <h2>{group.label}</h2>
                <p>Reusable items for the active itinerary.</p>
              </div>
            </div>

            <div className="checklist">
              {group.items.map((item, index) => (
                <label className="checklist-item" key={item}>
                  <input type="checkbox" defaultChecked={index === 0} />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </section>
        ))}
      </div>
    </ScreenFrame>
  );
}
