import { useCallback, useEffect, useState } from 'react'
import { listBugs } from '../api/client'
import type { BugEntry } from '../types'

export function useBugs(query = '') {
  const [bugs, setBugs] = useState<BugEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const reload = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await listBugs(query)
      setBugs(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load bug entries.')
    } finally {
      setLoading(false)
    }
  }, [query])

  useEffect(() => {
    void reload()
  }, [reload])

  return { bugs, loading, error, reload, setError }
}
