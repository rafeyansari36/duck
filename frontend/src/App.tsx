import { FormEvent, useEffect, useMemo, useState } from 'react'

type BugEntry = {
  id: number
  title: string
  description: string
  createdAt: string
}

type DuckCause = {
  cause: string
  confidence: string
}

type DuckAnalysis = {
  questions: string[]
  likelyCauses: DuckCause[]
  debugPlan: string[]
  suggestedFixes: string[]
  testIdeas: string[]
  source: string
}

type ViewMode = 'home' | 'entries'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8081/api').replace(/\/$/, '')
const PAGE_SIZE = 5

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = 'Something went wrong.'
    try {
      const body = (await response.json()) as { details?: string[]; error?: string }
      message = body.details?.[0] ?? body.error ?? message
    } catch {
      message = response.statusText || message
    }
    throw new Error(message)
  }

  return (await response.json()) as T
}

function buildAnalysisText(title: string, analysis: DuckAnalysis): string {
  const section = (heading: string, lines: string[]) => [heading, ...lines.map((line) => `- ${line}`), ''].join('\n')
  const causes = analysis.likelyCauses.map((cause) => `${cause.cause} (confidence: ${cause.confidence})`)

  return [
    `AI Analysis for: ${title}`,
    `Source: ${analysis.source}`,
    '',
    section('Clarifying Questions', analysis.questions),
    section('Likely Root Causes', causes),
    section('Debug Plan', analysis.debugPlan),
    section('Suggested Fixes', analysis.suggestedFixes),
    section('Regression Test Ideas', analysis.testIdeas),
  ].join('\n').trim()
}

export default function App() {
  const [view, setView] = useState<ViewMode>('home')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [bugs, setBugs] = useState<BugEntry[]>([])
  const [search, setSearch] = useState('')
  const [activeQuery, setActiveQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [analysis, setAnalysis] = useState<DuckAnalysis | null>(null)
  const [loadingBugs, setLoadingBugs] = useState(true)
  const [savingBug, setSavingBug] = useState(false)
  const [askingDuck, setAskingDuck] = useState(false)
  const [savingAnalysis, setSavingAnalysis] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [actionMessage, setActionMessage] = useState('')

  useEffect(() => {
    void loadBugs(activeQuery)
  }, [activeQuery])

  const totalPages = Math.max(1, Math.ceil(bugs.length / PAGE_SIZE))

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const pagedBugs = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return bugs.slice(start, start + PAGE_SIZE)
  }, [bugs, currentPage])

  async function loadBugs(query = '') {
    setLoadingBugs(true)
    setErrorMessage('')

    try {
      const suffix = query ? `?q=${encodeURIComponent(query)}` : ''
      const data = await readJson<BugEntry[]>(await fetch(`${API_BASE_URL}/bugs${suffix}`))
      setBugs(data)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to load bug entries.')
    } finally {
      setLoadingBugs(false)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSavingBug(true)
    setErrorMessage('')
    setActionMessage('')

    try {
      await readJson<BugEntry>(
        await fetch(`${API_BASE_URL}/bugs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title, description }),
        }),
      )

      setTitle('')
      setDescription('')
      setAnalysis(null)
      setActionMessage('Bug entry saved to your journal.')
      await loadBugs(activeQuery)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to save your bug entry.')
    } finally {
      setSavingBug(false)
    }
  }

  async function handleDuckAnalysis() {
    setAskingDuck(true)
    setErrorMessage('')
    setActionMessage('')

    try {
      const data = await readJson<DuckAnalysis>(
        await fetch(`${API_BASE_URL}/duck/analysis`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title, description }),
        }),
      )

      setAnalysis(data)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to generate duck analysis.')
    } finally {
      setAskingDuck(false)
    }
  }

  async function handleCopyAnalysis() {
    if (!analysis || !title.trim()) {
      return
    }

    try {
      await navigator.clipboard.writeText(buildAnalysisText(title.trim(), analysis))
      setActionMessage('Analysis copied to clipboard.')
    } catch {
      setErrorMessage('Unable to copy analysis in this browser context.')
    }
  }

  async function handleSaveAnalysis() {
    if (!analysis || !title.trim()) {
      return
    }

    setSavingAnalysis(true)
    setErrorMessage('')
    setActionMessage('')

    try {
      await readJson<BugEntry>(
        await fetch(`${API_BASE_URL}/bugs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: `${title.trim()} - AI analysis`,
            description: buildAnalysisText(title.trim(), analysis),
          }),
        }),
      )

      setActionMessage('AI analysis saved as a new journal entry.')
      await loadBugs(activeQuery)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to save AI analysis entry.')
    } finally {
      setSavingAnalysis(false)
    }
  }

  async function handleDelete(id: number) {
    setErrorMessage('')

    try {
      const response = await fetch(`${API_BASE_URL}/bugs/${id}`, { method: 'DELETE' })
      if (!response.ok) {
        throw new Error('Unable to delete that bug entry.')
      }
      await loadBugs(activeQuery)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to delete that bug entry.')
    }
  }

  const totalEntries = bugs.length

  return (
    <main className="shell">
      <nav className="top-nav">
        <button
          className={view === 'home' ? 'nav-pill nav-pill-active' : 'nav-pill'}
          type="button"
          onClick={() => setView('home')}
        >
          Home
        </button>
        <button
          className={view === 'entries' ? 'nav-pill nav-pill-active' : 'nav-pill'}
          type="button"
          onClick={() => setView('entries')}
        >
          Entries
        </button>
      </nav>

      <section className="hero">
        <article className="hero-card">
          <span className="eyebrow">Rubber Duck Debugging Journal</span>
          <h1>{view === 'home' ? 'Log it fast. Fix it smarter.' : 'Browse your debugging history.'}</h1>
          <p>
            {view === 'home'
              ? 'Capture one bug clearly and get a complete copilot analysis with root causes, debug plan, fixes, and tests.'
              : 'Search and paginate through journal entries to spot recurring bug patterns and learn from old fixes.'}
          </p>

          <div className="stats">
            <div className="stat">
              <strong>{totalEntries}</strong>
              <span>total journal entries</span>
            </div>
            <div className="stat">
              <strong>{PAGE_SIZE}</strong>
              <span>entries per page</span>
            </div>
            <div className="stat">
              <strong>PG</strong>
              <span>stored in your local PostgreSQL database</span>
            </div>
          </div>
        </article>

        <aside className="panel">
          <h2>{view === 'home' ? 'Home workflow' : 'Entries workflow'}</h2>
          <p>
            {view === 'home'
              ? 'Use Home to log new bugs and run AI analysis only. Keep this page focused on one debugging session at a time.'
              : 'Use Entries to search old reports, paginate through results, and clean up stale items without cluttering Home.'}
          </p>
        </aside>
      </section>

      {view === 'home' ? (
        <section className="single-column">
          <article className="panel composer">
            <div>
              <h2>Log a bug</h2>
              <p className="composer-copy">Keep the title short and put reproduction clues in the description.</p>
            </div>

            <form onSubmit={handleSubmit} className="composer">
              <div className="field">
                <label htmlFor="title">Bug title</label>
                <input
                  id="title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  maxLength={120}
                  placeholder="Checkout page freezes after clicking Pay"
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="description">Bug description</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  maxLength={4000}
                  placeholder="What you expected, what happened, and exact repro steps..."
                  required
                />
              </div>

              <div className="actions">
                <button className="primary" type="submit" disabled={savingBug}>
                  {savingBug ? 'Saving...' : 'Save journal entry'}
                </button>
                <button
                  className="secondary"
                  type="button"
                  disabled={askingDuck || !title.trim() || !description.trim()}
                  onClick={handleDuckAnalysis}
                >
                  {askingDuck ? 'Thinking...' : 'Run debug copilot'}
                </button>
              </div>
            </form>

            {errorMessage && <div className="error">{errorMessage}</div>}
            {actionMessage && <div className="hint">{actionMessage}</div>}

            {!analysis ? (
              <div className="hint">
                Copilot analysis appears here after you fill in the bug and press
                <strong> Run debug copilot</strong>.
              </div>
            ) : (
              <div className="duck-box">
                <div className="copilot-header">
                  <span className="source-pill">Source: {analysis.source}</span>
                  <div className="actions compact-actions">
                    <button className="secondary" type="button" onClick={handleCopyAnalysis}>
                      Copy analysis
                    </button>
                    <button
                      className="secondary"
                      type="button"
                      disabled={savingAnalysis}
                      onClick={handleSaveAnalysis}
                    >
                      {savingAnalysis ? 'Saving...' : 'Save analysis to journal'}
                    </button>
                  </div>
                </div>

                <div className="analysis-grid">
                  <section className="analysis-card">
                    <h3>Clarifying Questions</h3>
                    <ol>
                      {analysis.questions.map((question) => (
                        <li key={question}>{question}</li>
                      ))}
                    </ol>
                  </section>

                  <section className="analysis-card">
                    <h3>Likely Root Causes</h3>
                    <ul>
                      {analysis.likelyCauses.map((cause) => (
                        <li key={cause.cause}>
                          {cause.cause}
                          <span className="confidence-pill">{cause.confidence}</span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section className="analysis-card">
                    <h3>Debug Plan</h3>
                    <ol>
                      {analysis.debugPlan.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ol>
                  </section>

                  <section className="analysis-card">
                    <h3>Suggested Fixes</h3>
                    <ul>
                      {analysis.suggestedFixes.map((fix) => (
                        <li key={fix}>{fix}</li>
                      ))}
                    </ul>
                  </section>

                  <section className="analysis-card full-width">
                    <h3>Regression Test Ideas</h3>
                    <ul>
                      {analysis.testIdeas.map((test) => (
                        <li key={test}>{test}</li>
                      ))}
                    </ul>
                  </section>
                </div>
              </div>
            )}
          </article>
        </section>
      ) : (
        <section className="single-column">
          <article className="journal">
            <div className="journal-header">
              <div className="journal-intro">
                <h2>Journal entries</h2>
                <p>Search by title or description and move page by page.</p>
              </div>

              <form
                className="search"
                onSubmit={(event) => {
                  event.preventDefault()
                  setCurrentPage(1)
                  setActiveQuery(search.trim())
                }}
              >
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search bugs..."
                />
                <button className="secondary" type="submit">
                  Search
                </button>
              </form>
            </div>

            {errorMessage && <div className="error">{errorMessage}</div>}

            {loadingBugs ? (
              <div className="empty">Loading your bug journal...</div>
            ) : bugs.length === 0 ? (
              <div className="empty">No matching entries found.</div>
            ) : (
              <>
                <div className="entries">
                  {pagedBugs.map((bug) => (
                    <article key={bug.id} className="entry">
                      <div className="entry-top">
                        <div>
                          <h3>{bug.title}</h3>
                          <span className="timestamp">{new Date(bug.createdAt).toLocaleString()}</span>
                        </div>

                        <button className="danger" type="button" onClick={() => void handleDelete(bug.id)}>
                          Delete
                        </button>
                      </div>

                      <p>{bug.description}</p>
                    </article>
                  ))}
                </div>

                <div className="pagination-wrap">
                  <button
                    className="secondary"
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  >
                    Previous
                  </button>
                  <span className="page-label">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    className="secondary"
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </article>
        </section>
      )}
    </main>
  )
}



