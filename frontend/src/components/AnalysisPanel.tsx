import type { DuckAnalysis } from '../types'

type AnalysisPanelProps = {
  analysis: DuckAnalysis
  onCopy: () => void
  onSave: () => void
  saving: boolean
}

export default function AnalysisPanel({ analysis, onCopy, onSave, saving }: AnalysisPanelProps) {
  return (
    <div className="duck-box">
      <div className="copilot-header">
        <span className="source-pill">Source: {analysis.source}</span>
        <div className="actions compact-actions">
          <button className="secondary" type="button" onClick={onCopy}>
            Copy analysis
          </button>
          <button className="secondary" type="button" disabled={saving} onClick={onSave}>
            {saving ? 'Saving...' : 'Save analysis to journal'}
          </button>
        </div>
      </div>

      <div className="analysis-grid">
        <section className="analysis-card">
          <h3>Clarifying Questions</h3>
          <ol>
            {analysis.questions.map((question) => (
              <li key={question}>{question}</li>
            ))}
          </ol>
        </section>

        <section className="analysis-card">
          <h3>Likely Root Causes</h3>
          <ul>
            {analysis.likelyCauses.map((cause) => (
              <li key={cause.cause}>
                {cause.cause}
                <span className="confidence-pill">{cause.confidence}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="analysis-card">
          <h3>Debug Plan</h3>
          <ol>
            {analysis.debugPlan.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>

        <section className="analysis-card">
          <h3>Suggested Fixes</h3>
          <ul>
            {analysis.suggestedFixes.map((fix) => (
              <li key={fix}>{fix}</li>
            ))}
          </ul>
        </section>

        <section className="analysis-card full-width">
          <h3>Regression Test Ideas</h3>
          <ul>
            {analysis.testIdeas.map((test) => (
              <li key={test}>{test}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
