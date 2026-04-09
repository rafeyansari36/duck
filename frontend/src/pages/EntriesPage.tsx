import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { deleteBug } from '../api/client'
import BugList from '../components/BugList'
import Hero from '../components/Hero'
import Pagination from '../components/Pagination'
import SearchBar from '../components/SearchBar'
import { PAGE_SIZE } from '../constants'
import { useBugs } from '../hooks/useBugs'

export default function EntriesPage() {
  const [search, setSearch] = useState('')
  const [activeQuery, setActiveQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const { bugs, loading, error, reload } = useBugs(activeQuery)

  useEffect(() => {
    if (error) toast.error(error)
  }, [error])

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

  async function handleDelete(id: number) {
    try {
      await deleteBug(id)
      toast.success('Entry deleted.')
      await reload()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to delete that bug entry.')
    }
  }

  function handleSearchSubmit() {
    setCurrentPage(1)
    setActiveQuery(search.trim())
  }

  return (
    <>
      <Hero
        title="Browse your debugging history."
        description="Search and paginate through journal entries to spot recurring bug patterns and learn from old fixes."
        panelTitle="Entries workflow"
        panelBody="Use Entries to search old reports, paginate through results, and clean up stale items without cluttering Home."
        totalEntries={bugs.length}
        pageSize={PAGE_SIZE}
      />

      <section className="single-column">
        <article className="journal">
          <div className="journal-header">
            <div className="journal-intro">
              <h2>Journal entries</h2>
              <p>Search by title or description and move page by page.</p>
            </div>

            <SearchBar value={search} onChange={setSearch} onSubmit={handleSearchSubmit} />
          </div>

          {loading ? (
            <div className="empty">Loading your bug journal...</div>
          ) : bugs.length === 0 ? (
            <div className="empty">
              No matching entries found. Log your first bug from the Home page.
            </div>
          ) : (
            <>
              <BugList bugs={pagedBugs} onDelete={handleDelete} />
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onChange={setCurrentPage}
              />
            </>
          )}
        </article>
      </section>
    </>
  )
}
