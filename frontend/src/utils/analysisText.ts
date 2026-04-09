import type { DuckAnalysis } from '../types'

export function buildAnalysisText(title: string, analysis: DuckAnalysis): string {
  const section = (heading: string, lines: string[]) =>
    [heading, ...lines.map((line) => `- ${line}`), ''].join('\n')
  const causes = analysis.likelyCauses.map(
    (cause) => `${cause.cause} (confidence: ${cause.confidence})`,
  )

  return [
    `AI Analysis for: ${title}`,
    `Source: ${analysis.source}`,
    '',
    section('Clarifying Questions', analysis.questions),
    section('Likely Root Causes', causes),
    section('Debug Plan', analysis.debugPlan),
    section('Suggested Fixes', analysis.suggestedFixes),
    section('Regression Test Ideas', analysis.testIdeas),
  ]
    .join('\n')
    .trim()
}
