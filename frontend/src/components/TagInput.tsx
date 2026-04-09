import { KeyboardEvent, useState } from 'react'

type TagInputProps = {
  value: string[]
  onChange: (tags: string[]) => void
}

export default function TagInput({ value, onChange }: TagInputProps) {
  const [draft, setDraft] = useState('')

  function commit() {
    const trimmed = draft.trim().toLowerCase()
    if (!trimmed) return
    if (value.includes(trimmed)) {
      setDraft('')
      return
    }
    onChange([...value, trimmed])
    setDraft('')
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      commit()
    } else if (event.key === 'Backspace' && !draft && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  function remove(tag: string) {
    onChange(value.filter((t) => t !== tag))
  }

  return (
    <div className="tag-input">
      <div className="tag-chips">
        {value.map((tag) => (
          <span key={tag} className="tag-chip">
            {tag}
            <button type="button" aria-label={`Remove ${tag}`} onClick={() => remove(tag)}>
              ×
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commit}
          placeholder={value.length === 0 ? 'Add tags (press Enter)' : ''}
        />
      </div>
    </div>
  )
}
