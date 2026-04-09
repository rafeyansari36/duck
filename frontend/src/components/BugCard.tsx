import { Link } from 'react-router-dom'
import type { BugEntry } from '../types'
import BugMeta from './BugMeta'

type BugCardProps = {
  bug: BugEntry
  onDelete: (id: number) => void
}

function excerpt(text: string, max = 220): string {
  const stripped = text.replace(/```[\s\S]*?```/g, '[code]').replace(/\s+/g, ' ').trim()
  return stripped.length > max ? `${stripped.slice(0, max)}…` : stripped
}

export default function BugCard({ bug, onDelete }: BugCardProps) {
  function handleDelete() {
    if (window.confirm(`Delete "${bug.title}"? This cannot be undone.`)) {
      onDelete(bug.id)
    }
  }

  return (
    <article className="entry">
      <div className="entry-top">
        <div>
          <h3>
            <Link to={`/entries/${bug.id}`}>{bug.title}</Link>
          </h3>
          <span className="timestamp">{new Date(bug.createdAt).toLocaleString()}</span>
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

      <p>{excerpt(bug.description)}</p>
    </article>
  )
}
