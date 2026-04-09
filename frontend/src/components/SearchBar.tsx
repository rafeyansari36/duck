import { FormEvent } from 'react'

type SearchBarProps = {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  placeholder?: string
}

export default function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = 'Search bugs...',
}: SearchBarProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit()
  }

  return (
    <form className="search" onSubmit={handleSubmit}>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
      <button className="secondary" type="submit">
        Search
      </button>
    </form>
  )
}
