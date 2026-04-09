export type Severity = 'LOW' | 'MEDIUM' | 'HIGH'
export type BugStatus = 'OPEN' | 'INVESTIGATING' | 'RESOLVED'

export const SEVERITIES: Severity[] = ['LOW', 'MEDIUM', 'HIGH']
export const BUG_STATUSES: BugStatus[] = ['OPEN', 'INVESTIGATING', 'RESOLVED']

export type BugEntry = {
  id: number
  title: string
  description: string
  createdAt: string
  updatedAt: string | null
  severity: Severity
  status: BugStatus
  resolution: string | null
  resolvedAt: string | null
  tags: string[]
}

export type DuckCause = {
  cause: string
  confidence: string
}

export type DuckAnalysis = {
  questions: string[]
  likelyCauses: DuckCause[]
  debugPlan: string[]
  suggestedFixes: string[]
  testIdeas: string[]
  source: string
}

export type BugEntryInput = {
  title: string
  description: string
  severity?: Severity
  status?: BugStatus
  resolution?: string | null
  tags?: string[]
}
