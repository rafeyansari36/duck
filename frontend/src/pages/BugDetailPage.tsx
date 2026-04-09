import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deleteBug, getBug } from '../api/client'
import BugMeta from '../components/BugMeta'
import Markdown from '../components/Markdown'
import type { BugEntry } from '../types'

export default function BugDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [bug, setBug] = useState<BugEntry | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setLoading(true)
    getBug(Number(id))
      .then((data) => {
        if (!cancelled) setBug(data)
      })
      .catch((err) => {
        if (!cancelled) {
          toast.error(err instanceof Error ? err.message : 'Unable to load entry.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  async function handleDelete() {
    if (!bug) return
    if (!window.confirm(`Delete "${bug.title}"? This cannot be undone.`)) return
    try {
      await deleteBug(bug.id)
      toast.success('Entry deleted.')
      navigate('/entries')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to delete entry.')
    }
  }

  return (
    <section className="single-column">
      <article className="panel">
        <Link to="/entries" className="nav-pill">
          Back to entries
        </Link>

        {loading ? (
          <div className="empty">Loading entry...</div>
        ) : !bug ? (
          <div className="empty">Entry not found.</div>
        ) : (
          <>
            <div className="entry-top">
              <div>
                <h1>{bug.title}</h1>
                <span className="timestamp">
                  Created {new Date(bug.createdAt).toLocaleString()}
                  {bug.updatedAt && ` · Updated ${new Date(bug.updatedAt).toLocaleString()}`}
                </span>
              </div>
              <div className="actions compact-actions">
                <Link className="secondary" to={`/entries/${bug.id}/edit`}>
                  Edit
                </Link>
                <button className="danger" type="button" onClick={handleDelete}>
                  Delete
                </button>
              </div>
            </div>

            <BugMeta severity={bug.severity} status={bug.status} tags={bug.tags} />

            <Markdown>{bug.description}</Markdown>

            {bug.status === 'RESOLVED' && bug.resolution && (
              <div className="resolution-block">
                <h3>Resolution</h3>
                {bug.resolvedAt && (
                  <span className="timestamp">
                    Resolved {new Date(bug.resolvedAt).toLocaleString()}
                  </span>
                )}
                <Markdown>{bug.resolution}</Markdown>
              </div>
            )}
          </>
        )}
      </article>
    </section>
  )
}
