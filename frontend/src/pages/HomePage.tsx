import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { createBug, listBugs, runDuckAnalysis } from '../api/client'
import AnalysisPanel from '../components/AnalysisPanel'
import BugForm from '../components/BugForm'
import Hero from '../components/Hero'
import { PAGE_SIZE } from '../constants'
import type { BugStatus, DuckAnalysis, Severity } from '../types'
import { buildAnalysisText } from '../utils/analysisText'

export default function HomePage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [severity, setSeverity] = useState<Severity>('MEDIUM')
  const [status, setStatus] = useState<BugStatus>('OPEN')
  const [resolution, setResolution] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [analysis, setAnalysis] = useState<DuckAnalysis | null>(null)
  const [savingBug, setSavingBug] = useState(false)
  const [askingDuck, setAskingDuck] = useState(false)
  const [savingAnalysis, setSavingAnalysis] = useState(false)
  const [totalEntries, setTotalEntries] = useState(0)

  function refreshCount() {
    void listBugs()
      .then((items) => setTotalEntries(items.length))
      .catch(() => undefined)
  }

  useEffect(() => {
    refreshCount()
  }, [])

  function resetForm() {
    setTitle('')
    setDescription('')
    setSeverity('MEDIUM')
    setStatus('OPEN')
    setResolution('')
    setTags([])
    setAnalysis(null)
  }

  async function handleSubmit() {
    setSavingBug(true)
    try {
      await createBug({
        title,
        description,
        severity,
        status,
        resolution: status === 'RESOLVED' ? resolution : null,
        tags,
      })
      toast.success('Bug entry saved to your journal.')
      resetForm()
      refreshCount()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to save your bug entry.')
    } finally {
      setSavingBug(false)
    }
  }

  async function handleDuckAnalysis() {
    setAskingDuck(true)
    try {
      const data = await runDuckAnalysis({ title, description })
      setAnalysis(data)
      toast.success('Copilot analysis ready.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to generate duck analysis.')
    } finally {
      setAskingDuck(false)
    }
  }

  async function handleCopyAnalysis() {
    if (!analysis || !title.trim()) return
    try {
      await navigator.clipboard.writeText(buildAnalysisText(title.trim(), analysis))
      toast.success('Analysis copied to clipboard.')
    } catch {
      toast.error('Unable to copy analysis in this browser context.')
    }
  }

  async function handleSaveAnalysis() {
    if (!analysis || !title.trim()) return
    setSavingAnalysis(true)
    try {
      await createBug({
        title: `${title.trim()} - AI analysis`,
        description: buildAnalysisText(title.trim(), analysis),
        severity,
        status: 'OPEN',
        tags,
      })
      toast.success('AI analysis saved as a new journal entry.')
      refreshCount()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to save AI analysis entry.')
    } finally {
      setSavingAnalysis(false)
    }
  }

  return (
    <>
      <Hero
        title="Log it fast. Fix it smarter."
        description="Capture one bug clearly and get a complete copilot analysis with root causes, debug plan, fixes, and tests."
        panelTitle="Home workflow"
        panelBody="Use Home to log new bugs and run AI analysis only. Keep this page focused on one debugging session at a time."
        totalEntries={totalEntries}
        pageSize={PAGE_SIZE}
      />

      <section className="single-column">
        <article className="panel composer">
          <div>
            <h2>Log a bug</h2>
            <p className="composer-copy">
              Keep the title short and put reproduction clues in the description. Markdown
              and code blocks are supported.
            </p>
          </div>

          <BugForm
            title={title}
            description={description}
            onTitleChange={setTitle}
            onDescriptionChange={setDescription}
            severity={severity}
            onSeverityChange={setSeverity}
            status={status}
            onStatusChange={setStatus}
            resolution={resolution}
            onResolutionChange={setResolution}
            tags={tags}
            onTagsChange={setTags}
            onSubmit={handleSubmit}
            submitting={savingBug}
            secondaryAction={{
              label: 'Run debug copilot',
              onClick: handleDuckAnalysis,
              disabled: !title.trim() || !description.trim(),
              loading: askingDuck,
              loadingLabel: 'Thinking...',
            }}
          />

          {!analysis ? (
            <div className="hint">
              Copilot analysis appears here after you fill in the bug and press
              <strong> Run debug copilot</strong>.
            </div>
          ) : (
            <AnalysisPanel
              analysis={analysis}
              onCopy={handleCopyAnalysis}
              onSave={handleSaveAnalysis}
              saving={savingAnalysis}
            />
          )}
        </article>
      </section>
    </>
  )
}
