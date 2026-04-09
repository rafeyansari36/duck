import type { BugStatus, Severity } from '../types'

type BugMetaProps = {
  severity: Severity
  status: BugStatus
  tags: string[]
}

export default function BugMeta({ severity, status, tags }: BugMetaProps) {
  const safeSeverity: Severity = severity ?? 'MEDIUM'
  const safeStatus: BugStatus = status ?? 'OPEN'
  const safeTags = tags ?? []

  return (
    <div className="bug-meta">
      <span className={`badge severity-${safeSeverity.toLowerCase()}`}>{safeSeverity}</span>
      <span className={`badge status-${safeStatus.toLowerCase()}`}>{safeStatus}</span>
      {safeTags.map((tag) => (
        <span key={tag} className="tag-chip readonly">
          {tag}
        </span>
      ))}
    </div>
  )
}
