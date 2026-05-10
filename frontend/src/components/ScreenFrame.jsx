export default function ScreenFrame({ title, description, actions, aside, children }) {
  return (
    <main className="screen-shell">
      <section className="screen-hero">
        <div className="screen-hero__copy">
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
