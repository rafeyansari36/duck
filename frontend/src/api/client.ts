import type { BugEntry, BugEntryInput, DuckAnalysis } from '../types'

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8081/api'
).replace(/\/$/, '')

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = 'Something went wrong.'
    try {
      const body = (await response.json()) as { details?: string[]; error?: string }
      message = body.details?.[0] ?? body.error ?? message
    } catch {
      message = response.statusText || message
    }
    throw new Error(message)
  }

  return (await response.json()) as T
}

function jsonRequest(method: string, body: unknown): RequestInit {
  return {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }
}

export async function listBugs(query = ''): Promise<BugEntry[]> {
  const suffix = query ? `?q=${encodeURIComponent(query)}` : ''
  return readJson<BugEntry[]>(await fetch(`${API_BASE_URL}/bugs${suffix}`))
}

export async function getBug(id: number): Promise<BugEntry> {
  return readJson<BugEntry>(await fetch(`${API_BASE_URL}/bugs/${id}`))
}

export async function createBug(input: BugEntryInput): Promise<BugEntry> {
  return readJson<BugEntry>(await fetch(`${API_BASE_URL}/bugs`, jsonRequest('POST', input)))
}

export async function updateBug(id: number, input: BugEntryInput): Promise<BugEntry> {
  return readJson<BugEntry>(await fetch(`${API_BASE_URL}/bugs/${id}`, jsonRequest('PUT', input)))
}

export async function deleteBug(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/bugs/${id}`, { method: 'DELETE' })
  if (!response.ok) {
    throw new Error('Unable to delete that bug entry.')
  }
}

export async function runDuckAnalysis(input: BugEntryInput): Promise<DuckAnalysis> {
  return readJson<DuckAnalysis>(
    await fetch(`${API_BASE_URL}/duck/analysis`, jsonRequest('POST', input)),
  )
}
