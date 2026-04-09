type HeroProps = {
  title: string
  description: string
  panelTitle: string
  panelBody: string
  totalEntries: number
  pageSize: number
}

export default function Hero({
  title,
  description,
  panelTitle,
  panelBody,
  totalEntries,
  pageSize,
}: HeroProps) {
  return (
    <section className="hero">
      <article className="hero-card">
        <span className="eyebrow">Rubber Duck Debugging Journal</span>
        <h1>{title}</h1>
        <p>{description}</p>

        <div className="stats">
          <div className="stat">
            <strong>{totalEntries}</strong>
            <span>total journal entries</span>
          </div>
          <div className="stat">
            <strong>{pageSize}</strong>
            <span>entries per page</span>
          </div>
          <div className="stat">
            <strong>PG</strong>
            <span>stored in your local PostgreSQL database</span>
          </div>
        </div>
      </article>

      <aside className="panel">
        <h2>{panelTitle}</h2>
        <p>{panelBody}</p>
      </aside>
    </section>
  )
}
