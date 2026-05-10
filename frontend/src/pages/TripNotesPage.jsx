import ScreenFrame from '../components/ScreenFrame';

const notes = [
  {
    title: 'Hotel confirmation',
    timestamp: '10 May 09:15',
    body: 'Check-in starts at 3 PM. Save the front desk number in case of late arrival.',
  },
  {
    title: 'Kyoto temple walk',
    timestamp: '09 May 18:20',
    body: 'Move this to Day 2 if the weather stays clear. Add the tea house stop nearby.',
  },
];

export default function TripNotesPage() {
  return (
    <ScreenFrame
      eyebrow="Screen 12"
      title="Trip Notes and Journal"
      description="Keep timestamped notes for a trip or a specific stop without leaving the app."
      actions={
        <>
          <button className="primary-button screen-button" type="button">
            New Note
          </button>
          <button className="secondary-button screen-button" type="button">
            Sort by Date
          </button>
        </>
      }
      aside={
        <div className="screen-summary">
          <div className="screen-summary__row">
            <strong>12 notes</strong>
            <span>Current trip</span>
          </div>
          <div className="screen-summary__row">
            <strong>4 stops</strong>
            <span>Tagged notes</span>
          </div>
        </div>
      }
    >
      <section className="screen-card screen-card--split">
        <div className="mini-panel">
          <div className="screen-card__header">
            <div>
              <h2>Editor</h2>
              <p>Add or update a note for the trip or the selected stop.</p>
            </div>
          </div>

          <label className="field">
            <span className="field__label">Note title</span>
            <span className="field__control">
              <input type="text" placeholder="Reminder for Kyoto" />
            </span>
          </label>

          <label className="field field--wide">
            <span className="field__label">Note content</span>
            <span className="field__control field__control--textarea">
              <textarea placeholder="Write check-in times, local contacts, or a reminder." />
            </span>
          </label>

          <button className="primary-button screen-button" type="button">
            Save Note
          </button>
        </div>

        <div className="mini-panel mini-panel--accent">
          <div className="screen-card__header">
            <div>
              <h2>Journal Entries</h2>
              <p>Most recent notes sorted by timestamp.</p>
            </div>
          </div>

          <div className="notes-list">
            {notes.map((note) => (
              <article className="note-card" key={note.timestamp}>
                <div className="note-card__meta">
                  <strong>{note.title}</strong>
                  <span>{note.timestamp}</span>
                </div>
                <p>{note.body}</p>
                <div className="share-row">
                  <button className="secondary-button screen-button" type="button">
                    Edit
                  </button>
                  <button className="secondary-button screen-button" type="button">
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </ScreenFrame>
  );
}
