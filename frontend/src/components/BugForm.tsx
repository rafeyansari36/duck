import { FormEvent } from 'react'
import { BUG_STATUSES, SEVERITIES, type BugStatus, type Severity } from '../types'
import TagInput from './TagInput'

type BugFormProps = {
  title: string
  description: string
  onTitleChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  severity: Severity
  onSeverityChange: (value: Severity) => void
  status: BugStatus
  onStatusChange: (value: BugStatus) => void
  resolution: string
  onResolutionChange: (value: string) => void
  tags: string[]
  onTagsChange: (value: string[]) => void
  onSubmit: () => void
  submitting: boolean
  submitLabel?: string
  submittingLabel?: string
  secondaryAction?: {
    label: string
    onClick: () => void
    disabled?: boolean
    loading?: boolean
    loadingLabel?: string
  }
}

export default function BugForm({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
  severity,
  onSeverityChange,
  status,
  onStatusChange,
  resolution,
  onResolutionChange,
  tags,
  onTagsChange,
  onSubmit,
  submitting,
  submitLabel = 'Save journal entry',
  submittingLabel = 'Saving...',
  secondaryAction,
}: BugFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit()
  }

  return (
    <form onSubmit={handleSubmit} className="composer">
      <div className="field">
        <label htmlFor="title">Bug title</label>
        <input
          id="title"
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          maxLength={120}
          placeholder="Checkout page freezes after clicking Pay"
          required
        />
      </div>

      <div className="field">
        <label htmlFor="description">Bug description (Markdown supported)</label>
        <textarea
          id="description"
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
          maxLength={4000}
          placeholder="What you expected, what happened, and exact repro steps...&#10;&#10;```js&#10;// code blocks render nicely&#10;```"
          required
        />
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="severity">Severity</label>
          <select
            id="severity"
            value={severity}
            onChange={(event) => onSeverityChange(event.target.value as Severity)}
          >
            {SEVERITIES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            value={status}
            onChange={(event) => onStatusChange(event.target.value as BugStatus)}
          >
            {BUG_STATUSES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="field">
        <label>Tags</label>
        <TagInput value={tags} onChange={onTagsChange} />
      </div>

      {status === 'RESOLVED' && (
        <div className="field">
          <label htmlFor="resolution">Resolution notes</label>
          <textarea
            id="resolution"
            value={resolution}
            onChange={(event) => onResolutionChange(event.target.value)}
            maxLength={4000}
            placeholder="What was the actual fix? Future-you will thank you."
          />
        </div>
      )}

      <div className="actions">
        <button className="primary" type="submit" disabled={submitting}>
          {submitting ? submittingLabel : submitLabel}
        </button>
        {secondaryAction && (
          <button
            className="secondary"
            type="button"
            disabled={secondaryAction.disabled || secondaryAction.loading}
            onClick={secondaryAction.onClick}
          >
            {secondaryAction.loading
              ? secondaryAction.loadingLabel ?? 'Working...'
              : secondaryAction.label}
          </button>
        )}
      </div>
    </form>
  )
}
