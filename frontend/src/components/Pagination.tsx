type PaginationProps = {
  currentPage: number
  totalPages: number
  onChange: (page: number) => void
}

export default function Pagination({ currentPage, totalPages, onChange }: PaginationProps) {
  return (
    <div className="pagination-wrap">
      <button
        className="secondary"
        type="button"
        disabled={currentPage === 1}
        onClick={() => onChange(Math.max(1, currentPage - 1))}
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
        onClick={() => onChange(Math.min(totalPages, currentPage + 1))}
      >
        Next
      </button>
    </div>
  )
}
