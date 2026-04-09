import type { BugEntry } from '../types'
import BugCard from './BugCard'

type BugListProps = {
  bugs: BugEntry[]
  onDelete: (id: number) => void
}

export default function BugList({ bugs, onDelete }: BugListProps) {
  return (
    <div className="entries">
      {bugs.map((bug) => (
        <BugCard key={bug.id} bug={bug} onDelete={onDelete} />
      ))}
    </div>
  )
}
