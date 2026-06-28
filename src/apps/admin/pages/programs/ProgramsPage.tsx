import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { branchApi, formApi, programApi, storageApi } from '../../core/services'
import type {
  Branch,
  ProgramAction,
  ProgramActionType,
  ProgramDetail,
  ProgramStatus,
  FormDetail,
} from '../../core/models'
import { ApiError } from '../../core/utils/apiError'
import './programs.css'

type ViewMode = 'list' | 'editor'
type StatusFilter = 'All' | ProgramStatus

const ACTION_TYPES: { value: ProgramActionType; label: string }[] = [
  { value: 'external_link', label: 'External Link' },
  { value: 'form', label: 'Form' },
]

interface ActionDraft {
  key: string
  label: string
  type: ProgramActionType
  url: string
  form_id: string
}

interface ProgramDraft {
  title: string
  description: string
  starting_date: string
  end_date: string
  thumbnail_url: string
  is_published: boolean
  actions: ActionDraft[]
}

function emptyAction(): ActionDraft {
  return {
    key: crypto.randomUUID(),
    label: '',
    type: 'external_link',
    url: '',
    form_id: '',
  }
}

function emptyDraft(): ProgramDraft {
  return {
    title: '',
    description: '',
    starting_date: '',
    end_date: '',
    thumbnail_url: '',
    is_published: false,
    actions: [emptyAction()],
  }
}

function toDateInputValue(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

function toIsoDateTime(dateStr: string): string {
  if (!dateStr) return new Date().toISOString()
  return new Date(`${dateStr}T12:00:00`).toISOString()
}

function programToDraft(program: ProgramDetail): ProgramDraft {
  const actions = program.metadata?.actions?.length
    ? program.metadata.actions.map((a) => ({
        key: crypto.randomUUID(),
        label: a.label,
        type: a.type,
        url: a.url ?? '',
        form_id: a.form_id ?? '',
      }))
    : [emptyAction()]

  return {
    title: program.title,
    description: program.description ?? '',
    starting_date: toDateInputValue(program.starting_date),
    end_date: toDateInputValue(program.end_date),
    thumbnail_url: program.thumbnail_url ?? '',
    is_published: program.is_published,
    actions,
  }
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function statusClass(status: ProgramStatus): string {
  return `program-status-badge program-status-${status.toLowerCase()}`
}

export function ProgramsPage() {
  const [view, setView] = useState<ViewMode>('list')
  const [programs, setPrograms] = useState<ProgramDetail[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [size] = useState(15)

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All')
  const [branchFilter, setBranchFilter] = useState('All')
  const [branches, setBranches] = useState<Branch[]>([])

  useEffect(() => {
    void branchApi.listBranches().then(setBranches).catch(() => setBranches([]))
  }, [])

  const [editingProgram, setEditingProgram] = useState<ProgramDetail | null>(null)
  const [draft, setDraft] = useState<ProgramDraft>(emptyDraft())
  const [savePending, setSavePending] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [uploadPending, setUploadPending] = useState(false)
  const [deletePending, setDeletePending] = useState<string | null>(null)

  const [forms, setForms] = useState<FormDetail[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const load = useCallback(
    async (targetPage = 1) => {
      setLoading(true)
      setError(null)
      try {
        const data = await programApi.list({
          page: targetPage,
          size,
          status: statusFilter === 'All' ? undefined : statusFilter,
          branch_id: branchFilter === 'All' ? undefined : branchFilter,
        })
        setPrograms(data.items)
        setTotal(data.total)
        setPage(data.page)
      } catch (err: unknown) {
        setError(err instanceof ApiError ? err.message : 'Failed to load programs.')
      } finally {
        setLoading(false)
      }
    },
    [size, statusFilter, branchFilter],
  )

  const loadForms = useCallback(async () => {
    try {
      const data = await formApi.list({ page: 1, size: 100, is_active: true })
      setForms(data.items)
    } catch {
      setForms([])
    }
  }, [])

  useEffect(() => {
    if (view === 'list') {
      void load()
    }
  }, [load, view])

  useEffect(() => {
    if (view === 'editor') {
      void loadForms()
    }
  }, [view, loadForms])

  const filteredPrograms = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return programs
    return programs.filter(
      (p) =>
        p.title.toLowerCase().includes(term) ||
        p.id.toLowerCase().includes(term) ||
        (p.description ?? '').toLowerCase().includes(term),
    )
  }, [programs, searchTerm])

  const publishedCount = useMemo(() => programs.filter((p) => p.is_published).length, [programs])
  const upcomingCount = useMemo(
    () => programs.filter((p) => p.status === 'UPCOMING').length,
    [programs],
  )
  const totalEnrollments = useMemo(
    () => programs.reduce((sum, p) => sum + p.participant_count, 0),
    [programs],
  )

  const pages = Math.max(1, Math.ceil(total / size))

  const openCreate = () => {
    setEditingProgram(null)
    setDraft(emptyDraft())
    setSaveError(null)
    setView('editor')
  }

  const openEdit = (program: ProgramDetail) => {
    setEditingProgram(program)
    setDraft(programToDraft(program))
    setSaveError(null)
    setView('editor')
  }

  const closeEditor = () => {
    setView('list')
    setEditingProgram(null)
    setDraft(emptyDraft())
    setSaveError(null)
  }

  const updateDraft = (patch: Partial<ProgramDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }))
  }

  const updateAction = (key: string, patch: Partial<ActionDraft>) => {
    setDraft((prev) => ({
      ...prev,
      actions: prev.actions.map((a) => (a.key === key ? { ...a, ...patch } : a)),
    }))
  }

  const addAction = () => {
    setDraft((prev) => ({ ...prev, actions: [...prev.actions, emptyAction()] }))
  }

  const removeAction = (key: string) => {
    setDraft((prev) => {
      const next = prev.actions.filter((a) => a.key !== key)
      return { ...prev, actions: next.length > 0 ? next : [emptyAction()] }
    })
  }

  const handleMediaSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadPending(true)
    setSaveError(null)
    try {
      const result = await storageApi.upload(file)
      updateDraft({ thumbnail_url: result.file_url })
    } catch (err: unknown) {
      setSaveError(err instanceof ApiError ? err.message : 'Failed to upload media.')
    } finally {
      setUploadPending(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const buildPayload = () => {
    const actions: ProgramAction[] = draft.actions
      .filter((a) => a.label.trim())
      .map((a) => ({
        label: a.label.trim(),
        type: a.type,
        ...(a.type === 'external_link' ? { url: a.url.trim() || undefined } : {}),
        ...(a.type === 'form' ? { form_id: a.form_id.trim() || undefined } : {}),
      }))

    const formIds = actions
      .filter((a) => a.type === 'form' && a.form_id)
      .map((a) => a.form_id as string)

    const firstExternalUrl = actions.find((a) => a.type === 'external_link' && a.url)?.url

    return {
      title: draft.title.trim(),
      description: draft.description.trim() || undefined,
      starting_date: toIsoDateTime(draft.starting_date),
      end_date: toIsoDateTime(draft.end_date),
      thumbnail_url: draft.thumbnail_url || undefined,
      register_url: firstExternalUrl,
      form_ids: formIds.length > 0 ? formIds : undefined,
      is_published: draft.is_published,
      metadata: actions.length > 0 ? { actions } : undefined,
    }
  }

  const handleSave = async () => {
    if (!draft.title.trim()) {
      setSaveError('Title is required.')
      return
    }
    if (!draft.starting_date || !draft.end_date) {
      setSaveError('Start and end dates are required.')
      return
    }
    if (draft.end_date < draft.starting_date) {
      setSaveError('End date must be after start date.')
      return
    }

    setSavePending(true)
    setSaveError(null)
    try {
      const payload = buildPayload()
      if (editingProgram) {
        await programApi.update(editingProgram.id, payload)
      } else {
        await programApi.create(payload)
      }
      closeEditor()
      void load(page)
    } catch (err: unknown) {
      setSaveError(err instanceof ApiError ? err.message : 'Failed to save program.')
    } finally {
      setSavePending(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this program? This cannot be undone.')) return
    setDeletePending(id)
    try {
      await programApi.delete(id)
      void load(page)
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete program.')
    } finally {
      setDeletePending(null)
    }
  }

  if (view === 'editor') {
    return (
      <div className="programs-page programs-editor">
        <div className="programs-back-bar">
          <button type="button" className="programs-back-btn" onClick={closeEditor}>
            <i className="ri-arrow-left-line" />
            Back to Programs
          </button>
          <button
            type="button"
            className="btn-ymca"
            onClick={() => void handleSave()}
            disabled={savePending}
          >
            Save Program
            <i className="ri-add-line" />
          </button>
        </div>

        {saveError && <div className="program-form-error">{saveError}</div>}

        <div className="program-media-row">
          <div className="program-media-preview">
            {draft.thumbnail_url ? (
              <img src={draft.thumbnail_url} alt="Program thumbnail" />
            ) : (
              <span className="program-media-placeholder">No media uploaded</span>
            )}
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="program-media-input"
              onChange={(e) => void handleMediaSelect(e)}
            />
            <button
              type="button"
              className="btn-ymca"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadPending}
            >
              {uploadPending ? 'Uploading…' : 'Add Media'}
              <i className="ri-add-line" />
            </button>
          </div>
        </div>

        <div className="program-form-fields">
          <div className="program-field-row">
            <label className="program-field-label" htmlFor="program-title">
              Title
            </label>
            <div className="program-field-input">
              <input
                id="program-title"
                type="text"
                value={draft.title}
                placeholder="Program title"
                onChange={(e) => updateDraft({ title: e.target.value })}
              />
            </div>
          </div>

          <div className="program-field-row">
            <label className="program-field-label" htmlFor="program-description">
              Description
            </label>
            <div className="program-field-input">
              <textarea
                id="program-description"
                value={draft.description}
                placeholder="Describe the program"
                onChange={(e) => updateDraft({ description: e.target.value })}
              />
            </div>
          </div>

          <div className="program-field-row">
            <label className="program-field-label" htmlFor="program-start">
              Start Date
            </label>
            <div className="program-field-input">
              <input
                id="program-start"
                type="date"
                value={draft.starting_date}
                onChange={(e) => updateDraft({ starting_date: e.target.value })}
              />
            </div>
          </div>

          <div className="program-field-row">
            <label className="program-field-label" htmlFor="program-end">
              End Date
            </label>
            <div className="program-field-input">
              <input
                id="program-end"
                type="date"
                value={draft.end_date}
                onChange={(e) => updateDraft({ end_date: e.target.value })}
              />
            </div>
          </div>

          <div className="program-field-row">
            <label className="program-field-label" htmlFor="program-published">
              Published
            </label>
            <div className="program-field-input">
              <select
                id="program-published"
                value={draft.is_published ? 'yes' : 'no'}
                onChange={(e) => updateDraft({ is_published: e.target.value === 'yes' })}
              >
                <option value="no">Draft</option>
                <option value="yes">Published</option>
            </select>
            <select
              className="filter-select"
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
            >
              <option value="All">All branches</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>
          </div>
        </div>

        <div className="program-actions-section">
          <p className="program-actions-heading">Actions</p>

          {draft.actions.map((action) => (
            <div key={action.key} className="program-action-row">
              <input
                type="text"
                className="program-action-label-input"
                placeholder="Action label"
                value={action.label}
                onChange={(e) => updateAction(action.key, { label: e.target.value })}
              />
              <span className="program-action-type-label">Action Type</span>
              <select
                className="program-action-type-select"
                value={action.type}
                onChange={(e) =>
                  updateAction(action.key, { type: e.target.value as ProgramActionType })
                }
              >
                {ACTION_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              {action.type === 'external_link' ? (
                <input
                  type="url"
                  className="program-action-value-input"
                  placeholder="URL"
                  value={action.url}
                  onChange={(e) => updateAction(action.key, { url: e.target.value })}
                />
              ) : (
                <select
                  className="program-action-type-select"
                  value={action.form_id}
                  onChange={(e) => updateAction(action.key, { form_id: e.target.value })}
                >
                  <option value="">Select form</option>
                  {forms.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.title}
                    </option>
                  ))}
                </select>
              )}
              <button
                type="button"
                className="program-action-delete"
                onClick={() => removeAction(action.key)}
                aria-label="Remove action"
              >
                <i className="ri-delete-bin-line" />
              </button>
            </div>
          ))}

          <button type="button" className="btn-ymca" onClick={addAction}>
            Add Action
            <i className="ri-add-line" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="programs-page">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon icon-green">
            <i className="ri-calendar-event-line" />
          </div>
          <div>
            <p className="stat-val">{total}</p>
            <p className="stat-lbl">Total Programs</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-blue">
            <i className="ri-eye-line" />
          </div>
          <div>
            <p className="stat-val">{publishedCount}</p>
            <p className="stat-lbl">Published</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-purple">
            <i className="ri-time-line" />
          </div>
          <div>
            <p className="stat-val">{upcomingCount}</p>
            <p className="stat-lbl">Upcoming</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-orange">
            <i className="ri-group-line" />
          </div>
          <div>
            <p className="stat-val">{totalEnrollments}</p>
            <p className="stat-lbl">Enrollments</p>
          </div>
        </div>
      </div>

      <section className="card table-card">
        <div className="card-hdr">
          <h2 className="card-title">Programs</h2>
          <div className="filter-bar">
            <div className="search-box">
              <i className="ri-search-line" />
              <input
                type="text"
                placeholder="Search programs…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            >
              <option value="All">All statuses</option>
              <option value="UPCOMING">Upcoming</option>
              <option value="ONGOING">Ongoing</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <select
              className="filter-select"
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
            >
              <option value="All">All branches</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
            <button type="button" className="btn-green" onClick={openCreate}>
              Create Program
              <i className="ri-add-line" />
            </button>
          </div>
        </div>

        {error && <div className="program-form-error">{error}</div>}

        {loading ? (
          <p className="empty-state">Loading programs…</p>
        ) : filteredPrograms.length === 0 ? (
          <p className="empty-state">No programs found. Create your first program to get started.</p>
        ) : (
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Media</th>
                  <th>Title</th>
                  <th>Dates</th>
                  <th>Status</th>
                  <th>Published</th>
                  <th>Enrolled</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPrograms.map((program) => (
                  <tr key={program.id}>
                    <td>
                      {program.thumbnail_url ? (
                        <img
                          src={program.thumbnail_url}
                          alt=""
                          className="program-thumb-cell"
                        />
                      ) : (
                        <span className="program-thumb-empty">
                          <i className="ri-image-line" />
                        </span>
                      )}
                    </td>
                    <td>
                      <strong>{program.title}</strong>
                      {program.description && (
                        <p style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                          {program.description.slice(0, 60)}
                          {program.description.length > 60 ? '…' : ''}
                        </p>
                      )}
                    </td>
                    <td style={{ fontSize: 13, whiteSpace: 'nowrap' }}>
                      {formatDate(program.starting_date)} – {formatDate(program.end_date)}
                    </td>
                    <td>
                      <span className={statusClass(program.status)}>{program.status.toLowerCase()}</span>
                    </td>
                    <td>
                      <span className={program.is_published ? 'badge-active' : 'badge-warning'}>
                        {program.is_published ? 'Yes' : 'Draft'}
                      </span>
                    </td>
                    <td>{program.participant_count}</td>
                    <td>
                      <div className="row-actions">
                        <button
                          type="button"
                          className="btn-icon-only"
                          title="Edit"
                          onClick={() => openEdit(program)}
                        >
                          <i className="ri-pencil-line" />
                        </button>
                        <button
                          type="button"
                          className="btn-icon-only"
                          title="Delete"
                          disabled={deletePending === program.id}
                          onClick={() => void handleDelete(program.id)}
                        >
                          <i className="ri-delete-bin-line" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pages > 1 && (
          <div className="pagination">
            <button
              type="button"
              className="btn-outline"
              disabled={page <= 1}
              onClick={() => void load(page - 1)}
            >
              Previous
            </button>
            <span className="page-info">
              Page {page} of {pages}
            </span>
            <button
              type="button"
              className="btn-outline"
              disabled={page >= pages}
              onClick={() => void load(page + 1)}
            >
              Next
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
