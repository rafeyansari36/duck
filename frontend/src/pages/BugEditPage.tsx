import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate, useParams } from 'react-router-dom'
import { getBug, updateBug } from '../api/client'
import BugForm from '../components/BugForm'
import type { BugStatus, Severity } from '../types'

export default function BugEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [severity, setSeverity] = useState<Severity>('MEDIUM')
  const [status, setStatus] = useState<BugStatus>('OPEN')
  const [resolution, setResolution] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setLoading(true)
    getBug(Number(id))
      .then((data) => {
        if (cancelled) return
        setTitle(data.title)
        setDescription(data.description)
        setSeverity(data.severity)
        setStatus(data.status)
        setResolution(data.resolution ?? '')
        setTags(data.tags)
      })
      .catch((err) => {
        if (!cancelled) {
          toast.error(err instanceof Error ? err.message : 'Unable to load entry.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  async function handleSubmit() {
    if (!id) return
    setSaving(true)
    try {
      await updateBug(Number(id), {
        title,
        description,
        severity,
        status,
        resolution: status === 'RESOLVED' ? resolution : null,
        tags,
      })
      toast.success('Entry updated.')
      navigate(`/entries/${id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to update entry.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="single-column">
      <article className="panel composer">
        <div>
          <h2>Edit journal entry</h2>
          <p className="composer-copy">Update fields and save. Markdown is supported.</p>
        </div>

        {loading ? (
          <div className="empty">Loading entry...</div>
        ) : (
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
            submitting={saving}
            submitLabel="Save changes"
            submittingLabel="Saving..."
            secondaryAction={{
              label: 'Cancel',
              onClick: () => navigate(`/entries/${id}`),
            }}
          />
        )}
      </article>
    </section>
  )
}
