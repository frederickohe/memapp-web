import { useCallback, useEffect, useMemo, useState, Fragment } from 'react'
import { formApi } from '../../core/services'
import type {
  FormAssignmentType,
  FormDetail,
  FormField,
  FormFieldType,
  FormAnalytics,
  FormResponseRecord,
} from '../../core/models'
import { ApiError } from '../../core/utils/apiError'
import './forms.css'

type StatusFilter = 'All' | 'active' | 'inactive'
type AssignmentFilter = 'All' | FormAssignmentType
type PanelTab = 'responses' | 'analytics'

const FIELD_TYPES: { value: FormFieldType; label: string }[] = [
  { value: 'text', label: 'Short text' },
  { value: 'email', label: 'Email' },
  { value: 'number', label: 'Number' },
  { value: 'textarea', label: 'Long text' },
  { value: 'select', label: 'Dropdown' },
  { value: 'radio', label: 'Multiple choice' },
  { value: 'checkbox', label: 'Checkboxes' },
  { value: 'date', label: 'Date' },
]

const CHOICE_TYPES: FormFieldType[] = ['select', 'radio', 'checkbox']

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 40)
}

function newField(order: number): FormField {
  return {
    name: `field_${order}`,
    label: '',
    field_type: 'text',
    required: false,
    placeholder: '',
    options: null,
  }
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatDateTime(value: string): string {
  const d = new Date(value)
  return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
}

function assignmentLabel(type: FormAssignmentType): string {
  if (type === 'PUBLIC') return 'Public'
  if (type === 'PROGRAM') return 'Program'
  return 'User'
}

function formatFieldValue(value: unknown): string {
  if (value == null || value === '') return '—'
  if (Array.isArray(value)) return value.join(', ')
  return String(value)
}

interface FormDraft {
  title: string
  description: string
  assignment_type: FormAssignmentType
  program_id: string
  assigned_user_id: string
  is_active: boolean
  fields: FormField[]
}

function emptyDraft(): FormDraft {
  return {
    title: '',
    description: '',
    assignment_type: 'PUBLIC',
    program_id: '',
    assigned_user_id: '',
    is_active: true,
    fields: [newField(1)],
  }
}

function formToDraft(form: FormDetail): FormDraft {
  return {
    title: form.title,
    description: form.description ?? '',
    assignment_type: form.assignment_type,
    program_id: form.program_id ?? '',
    assigned_user_id: form.assigned_user_id ?? '',
    is_active: form.is_active,
    fields: form.fields.length > 0 ? form.fields.map((f) => ({ ...f })) : [newField(1)],
  }
}

export function FormsPage() {
  const [forms, setForms] = useState<FormDetail[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [size] = useState(15)

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All')
  const [assignmentFilter, setAssignmentFilter] = useState<AssignmentFilter>('All')

  const [showBuilder, setShowBuilder] = useState(false)
  const [editingForm, setEditingForm] = useState<FormDetail | null>(null)
  const [draft, setDraft] = useState<FormDraft>(emptyDraft())
  const [builderPending, setBuilderPending] = useState(false)
  const [builderError, setBuilderError] = useState<string | null>(null)

  const [selectedForm, setSelectedForm] = useState<FormDetail | null>(null)
  const [panelTab, setPanelTab] = useState<PanelTab>('responses')
  const [responses, setResponses] = useState<FormResponseRecord[]>([])
  const [responsesTotal, setResponsesTotal] = useState(0)
  const [responsesPage, setResponsesPage] = useState(1)
  const [responsesLoading, setResponsesLoading] = useState(false)
  const [analytics, setAnalytics] = useState<FormAnalytics | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [selectedResponse, setSelectedResponse] = useState<FormResponseRecord | null>(null)
  const [exportPending, setExportPending] = useState(false)
  const [deletePending, setDeletePending] = useState<string | null>(null)

  const load = useCallback(
    async (targetPage = 1) => {
      setLoading(true)
      setError(null)
      try {
        const data = await formApi.list({
          page: targetPage,
          size,
          is_active: statusFilter === 'All' ? undefined : statusFilter === 'active',
          assignment_type: assignmentFilter === 'All' ? undefined : assignmentFilter,
        })
        setForms(data.items)
        setTotal(data.total)
        setPage(data.page)
      } catch (err: unknown) {
        setError(err instanceof ApiError ? err.message : 'Failed to load forms.')
      } finally {
        setLoading(false)
      }
    },
    [size, statusFilter, assignmentFilter],
  )

  useEffect(() => {
    void load()
  }, [load])

  const filteredForms = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return forms
    return forms.filter(
      (f) =>
        f.title.toLowerCase().includes(term) ||
        f.id.toLowerCase().includes(term) ||
        (f.description ?? '').toLowerCase().includes(term),
    )
  }, [forms, searchTerm])

  const totalResponses = useMemo(
    () => forms.reduce((sum, f) => sum + f.response_count, 0),
    [forms],
  )
  const activeCount = useMemo(() => forms.filter((f) => f.is_active).length, [forms])

  const pages = Math.max(1, Math.ceil(total / size))

  const openCreate = () => {
    setEditingForm(null)
    setDraft(emptyDraft())
    setBuilderError(null)
    setShowBuilder(true)
  }

  const openEdit = (form: FormDetail) => {
    setEditingForm(form)
    setDraft(formToDraft(form))
    setBuilderError(null)
    setShowBuilder(true)
  }

  const closeBuilder = () => {
    setShowBuilder(false)
    setEditingForm(null)
    setBuilderError(null)
  }

  const updateField = (index: number, patch: Partial<FormField>) => {
    setDraft((prev) => {
      const fields = [...prev.fields]
      const updated = { ...fields[index], ...patch }
      if (patch.label !== undefined && !editingForm) {
        updated.name = slugify(patch.label) || updated.name
      }
      if (patch.field_type && CHOICE_TYPES.includes(patch.field_type) && !updated.options?.length) {
        updated.options = ['Option 1', 'Option 2']
      }
      fields[index] = updated
      return { ...prev, fields }
    })
  }

  const addField = () => {
    setDraft((prev) => ({
      ...prev,
      fields: [...prev.fields, newField(prev.fields.length + 1)],
    }))
  }

  const removeField = (index: number) => {
    setDraft((prev) => ({
      ...prev,
      fields: prev.fields.length > 1 ? prev.fields.filter((_, i) => i !== index) : prev.fields,
    }))
  }

  const moveField = (index: number, direction: -1 | 1) => {
    setDraft((prev) => {
      const next = index + direction
      if (next < 0 || next >= prev.fields.length) return prev
      const fields = [...prev.fields]
      ;[fields[index], fields[next]] = [fields[next], fields[index]]
      return { ...prev, fields }
    })
  }

  const saveForm = async () => {
    const title = draft.title.trim()
    if (!title) {
      setBuilderError('Title is required.')
      return
    }
    const validFields = draft.fields.filter((f) => f.label.trim())
    if (validFields.length === 0) {
      setBuilderError('Add at least one field with a label.')
      return
    }
    for (const f of validFields) {
      if (CHOICE_TYPES.includes(f.field_type) && (!f.options || f.options.length === 0)) {
        setBuilderError(`"${f.label}" needs at least one option.`)
        return
      }
    }

    const payload = {
      title,
      description: draft.description.trim() || undefined,
      assignment_type: draft.assignment_type,
      program_id: draft.assignment_type === 'PROGRAM' ? draft.program_id.trim() || undefined : undefined,
      assigned_user_id:
        draft.assignment_type === 'USER' ? draft.assigned_user_id.trim() || undefined : undefined,
      is_active: draft.is_active,
      fields: validFields.map((f, i) => ({
        ...f,
        name: f.name || slugify(f.label) || `field_${i + 1}`,
        label: f.label.trim(),
        options: CHOICE_TYPES.includes(f.field_type) ? f.options : null,
      })),
    }

    setBuilderPending(true)
    setBuilderError(null)
    try {
      if (editingForm) {
        await formApi.update(editingForm.id, payload)
      } else {
        await formApi.create(payload)
      }
      closeBuilder()
      void load(page)
    } catch (err: unknown) {
      setBuilderError(err instanceof ApiError ? err.message : 'Failed to save form.')
    } finally {
      setBuilderPending(false)
    }
  }

  const deleteForm = async (form: FormDetail) => {
    if (!window.confirm(`Delete "${form.title}"? All responses will be removed.`)) return
    setDeletePending(form.id)
    try {
      await formApi.delete(form.id)
      if (selectedForm?.id === form.id) setSelectedForm(null)
      void load(page)
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete form.')
    } finally {
      setDeletePending(null)
    }
  }

  const loadResponses = useCallback(async (formId: string, targetPage = 1) => {
    setResponsesLoading(true)
    try {
      const data = await formApi.listResponses(formId, { page: targetPage, size: 20 })
      setResponses(data.responses)
      setResponsesTotal(data.total_responses)
      setResponsesPage(data.page)
    } catch {
      setResponses([])
    } finally {
      setResponsesLoading(false)
    }
  }, [])

  const loadAnalytics = useCallback(async (formId: string) => {
    setAnalyticsLoading(true)
    try {
      const data = await formApi.getAnalytics(formId)
      setAnalytics(data)
    } catch {
      setAnalytics(null)
    } finally {
      setAnalyticsLoading(false)
    }
  }, [])

  const openResponses = (form: FormDetail) => {
    setSelectedForm(form)
    setPanelTab('responses')
    setSelectedResponse(null)
    void loadResponses(form.id)
    void loadAnalytics(form.id)
  }

  const closePanel = () => {
    setSelectedForm(null)
    setSelectedResponse(null)
    setAnalytics(null)
  }

  const handleExport = async () => {
    if (!selectedForm) return
    setExportPending(true)
    try {
      const safeName = selectedForm.title.replace(/[^a-z0-9]/gi, '_').slice(0, 40)
      await formApi.exportResponses(selectedForm.id, `${safeName}_responses.csv`)
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : 'Export failed.')
    } finally {
      setExportPending(false)
    }
  }

  const responsePages = Math.max(1, Math.ceil(responsesTotal / 20))
  const maxDailyCount = analytics?.daily_counts.reduce((m, d) => Math.max(m, d.count), 1) ?? 1

  return (
    <div className="forms-page">
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon icon-blue">
            <i className="ri-file-list-3-line" />
          </div>
          <div>
            <p className="stat-val">{total}</p>
            <p className="stat-lbl">Total Forms</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-green">
            <i className="ri-checkbox-circle-line" />
          </div>
          <div>
            <p className="stat-val">{activeCount}</p>
            <p className="stat-lbl">Active (this page)</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-purple">
            <i className="ri-survey-line" />
          </div>
          <div>
            <p className="stat-val">{totalResponses}</p>
            <p className="stat-lbl">Responses (this page)</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-orange">
            <i className="ri-add-circle-line" />
          </div>
          <div>
            <button type="button" className="btn-green" onClick={openCreate}>
              <i className="ri-add-line" /> New Form
            </button>
          </div>
        </div>
      </section>

      <section className="card table-card">
        <div className="card-hdr">
          <h2 className="card-title">Forms</h2>
          <div className="filter-bar">
            <div className="search-box">
              <i className="ri-search-line" />
              <input
                type="text"
                placeholder="Search forms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            >
              <option value="All">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              className="filter-select"
              value={assignmentFilter}
              onChange={(e) => setAssignmentFilter(e.target.value as AssignmentFilter)}
            >
              <option value="All">All Types</option>
              <option value="PUBLIC">Public</option>
              <option value="PROGRAM">Program</option>
              <option value="USER">User</option>
            </select>
            <button type="button" className="btn-icon-only" title="Refresh" onClick={() => void load(page)}>
              <i className="ri-refresh-line" />
            </button>
          </div>
        </div>

        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Responses</th>
                <th>Status</th>
                <th>Created</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <i className="ri-loader-4-line spin" /> Loading forms...
                    </div>
                  </td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <i className="ri-error-warning-line" /> {error}
                    </div>
                  </td>
                </tr>
              )}
              {!loading &&
                !error &&
                filteredForms.map((form) => (
                  <tr key={form.id}>
                    <td>
                      <p className="cell-name">{form.title}</p>
                      <p className="cell-sub">{form.description?.slice(0, 60) || form.id}</p>
                    </td>
                    <td>
                      <span className="badge badge-pending">{assignmentLabel(form.assignment_type)}</span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="td-link"
                        style={{ background: 'none', border: 'none', padding: 0 }}
                        onClick={() => openResponses(form)}
                      >
                        {form.response_count}
                      </button>
                    </td>
                    <td>
                      <span className={`badge ${form.is_active ? 'badge-completed' : 'badge-cancelled'}`}>
                        {form.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{formatDate(form.created_at)}</td>
                    <td>
                      <div className="row-actions-inline">
                        <button type="button" className="btn-icon-only" title="View responses" onClick={() => openResponses(form)}>
                          <i className="ri-bar-chart-box-line" />
                        </button>
                        <button type="button" className="btn-icon-only" title="Edit" onClick={() => openEdit(form)}>
                          <i className="ri-edit-line" />
                        </button>
                        <button
                          type="button"
                          className="btn-icon-only"
                          title="Delete"
                          disabled={deletePending === form.id}
                          onClick={() => void deleteForm(form)}
                        >
                          <i className="ri-delete-bin-line" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              {!loading && !error && filteredForms.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <i className="ri-file-list-line" /> No forms yet. Create your first form.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <span className="pagination-info">
            Page {page} of {pages} · {total} total
          </span>
          <div className="pagination-controls">
            <button type="button" className="page-btn" disabled={page <= 1} onClick={() => void load(page - 1)}>
              <i className="ri-arrow-left-s-line" />
            </button>
            <button type="button" className="page-btn active">
              {page}
            </button>
            <button type="button" className="page-btn" disabled={page >= pages} onClick={() => void load(page + 1)}>
              <i className="ri-arrow-right-s-line" />
            </button>
          </div>
        </div>
      </section>

      {/* Form builder modal */}
      {showBuilder && (
        <div className="modal-overlay" onClick={closeBuilder}>
          <div className="modal-box form-builder-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-hdr">
              <h3>{editingForm ? 'Edit Form' : 'Create Form'}</h3>
              <button type="button" className="modal-close" onClick={closeBuilder}>
                <i className="ri-close-line" />
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Title *</label>
              <input
                className="form-input"
                value={draft.title}
                onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Event Registration"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-input"
                rows={2}
                value={draft.description}
                onChange={(e) => setDraft((p) => ({ ...p, description: e.target.value }))}
                placeholder="Brief description shown to users"
              />
            </div>

            <div className="field-grid">
              <div className="form-group">
                <label className="form-label">Assignment</label>
                <select
                  className="form-select"
                  value={draft.assignment_type}
                  onChange={(e) =>
                    setDraft((p) => ({ ...p, assignment_type: e.target.value as FormAssignmentType }))
                  }
                >
                  <option value="PUBLIC">Public — anyone can fill</option>
                  <option value="PROGRAM">Program — attach to a program</option>
                  <option value="USER">User — assign to one member</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={draft.is_active ? 'active' : 'inactive'}
                  onChange={(e) => setDraft((p) => ({ ...p, is_active: e.target.value === 'active' }))}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              {draft.assignment_type === 'PROGRAM' && (
                <div className="form-group full-width">
                  <label className="form-label">Program ID</label>
                  <input
                    className="form-input"
                    value={draft.program_id}
                    onChange={(e) => setDraft((p) => ({ ...p, program_id: e.target.value }))}
                    placeholder="PROG_..."
                  />
                </div>
              )}
              {draft.assignment_type === 'USER' && (
                <div className="form-group full-width">
                  <label className="form-label">User ID</label>
                  <input
                    className="form-input"
                    value={draft.assigned_user_id}
                    onChange={(e) => setDraft((p) => ({ ...p, assigned_user_id: e.target.value }))}
                    placeholder="USER_..."
                  />
                </div>
              )}
            </div>

            <div style={{ margin: '20px 0 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Questions</h4>
              <button type="button" className="btn-outline" onClick={addField}>
                <i className="ri-add-line" /> Add field
              </button>
            </div>

            {draft.fields.map((field, index) => (
              <div key={index} className="field-card">
                <div className="field-card-hdr">
                  <span>Question {index + 1}</span>
                  <div className="field-actions">
                    <button type="button" className="btn-icon-only" title="Move up" disabled={index === 0} onClick={() => moveField(index, -1)}>
                      <i className="ri-arrow-up-line" />
                    </button>
                    <button
                      type="button"
                      className="btn-icon-only"
                      title="Move down"
                      disabled={index === draft.fields.length - 1}
                      onClick={() => moveField(index, 1)}
                    >
                      <i className="ri-arrow-down-line" />
                    </button>
                    <button type="button" className="btn-icon-only" title="Remove" onClick={() => removeField(index)}>
                      <i className="ri-delete-bin-line" />
                    </button>
                  </div>
                </div>
                <div className="field-grid">
                  <div className="form-group">
                    <label className="form-label">Label *</label>
                    <input
                      className="form-input"
                      value={field.label}
                      onChange={(e) => updateField(index, { label: e.target.value })}
                      placeholder="Question text"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select
                      className="form-select"
                      value={field.field_type}
                      onChange={(e) => updateField(index, { field_type: e.target.value as FormFieldType })}
                    >
                      {FIELD_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Placeholder</label>
                    <input
                      className="form-input"
                      value={field.placeholder ?? ''}
                      onChange={(e) => updateField(index, { placeholder: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) => updateField(index, { required: e.target.checked })}
                      />
                      Required
                    </label>
                  </div>
                  {CHOICE_TYPES.includes(field.field_type) && (
                    <div className="form-group full-width options-editor">
                      <label className="form-label">Options (one per line)</label>
                      <textarea
                        className="form-input"
                        value={(field.options ?? []).join('\n')}
                        onChange={(e) =>
                          updateField(index, {
                            options: e.target.value.split('\n').map((s) => s.trim()).filter(Boolean),
                          })
                        }
                        placeholder={'Option 1\nOption 2\nOption 3'}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}

            {builderError && (
              <p style={{ color: '#ef4444', fontSize: 13, margin: '12px 0' }}>
                <i className="ri-error-warning-line" /> {builderError}
              </p>
            )}

            <div className="modal-footer">
              <button type="button" className="btn-outline" onClick={closeBuilder}>
                Cancel
              </button>
              <button type="button" className="btn-dark" disabled={builderPending} onClick={() => void saveForm()}>
                {builderPending ? 'Saving...' : editingForm ? 'Save Changes' : 'Create Form'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Responses & analytics drawer */}
      {selectedForm && (
        <div className="drawer-overlay" onClick={closePanel}>
          <div className="drawer-box responses-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-hdr">
              <div>
                <h3>{selectedForm.title}</h3>
                <p className="cell-sub">{selectedForm.response_count} responses · {assignmentLabel(selectedForm.assignment_type)}</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" className="btn-outline" disabled={exportPending} onClick={() => void handleExport()}>
                  <i className="ri-download-line" /> {exportPending ? 'Exporting...' : 'Export CSV'}
                </button>
                <button type="button" className="btn-icon-only" onClick={closePanel}>
                  <i className="ri-close-line" />
                </button>
              </div>
            </div>

            <div className="tab-bar">
              <button
                type="button"
                className={`tab-btn${panelTab === 'responses' ? ' active' : ''}`}
                onClick={() => setPanelTab('responses')}
              >
                Responses
              </button>
              <button
                type="button"
                className={`tab-btn${panelTab === 'analytics' ? ' active' : ''}`}
                onClick={() => setPanelTab('analytics')}
              >
                Analytics
              </button>
            </div>

            {panelTab === 'responses' && (
              <>
                <div className="tbl-wrap">
                  <table className="tbl">
                    <thead>
                      <tr>
                        <th>Respondent</th>
                        <th>Submitted</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {responsesLoading && (
                        <tr>
                          <td colSpan={3}>
                            <div className="empty-state">
                              <i className="ri-loader-4-line spin" /> Loading...
                            </div>
                          </td>
                        </tr>
                      )}
                      {!responsesLoading &&
                        responses.map((r) => (
                          <tr key={r.id} className="clickable-row" onClick={() => setSelectedResponse(r)}>
                            <td>
                              <p className="cell-name">{r.user_name || r.user_id}</p>
                              <p className="cell-sub">{r.user_email || '—'}</p>
                            </td>
                            <td>{formatDateTime(r.created_at)}</td>
                            <td>
                              <i className="ri-arrow-right-s-line" style={{ color: '#ccc' }} />
                            </td>
                          </tr>
                        ))}
                      {!responsesLoading && responses.length === 0 && (
                        <tr>
                          <td colSpan={3}>
                            <div className="empty-state">No responses yet</div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {responsePages > 1 && (
                  <div className="pagination">
                    <div className="pagination-controls">
                      <button
                        type="button"
                        className="page-btn"
                        disabled={responsesPage <= 1}
                        onClick={() => void loadResponses(selectedForm.id, responsesPage - 1)}
                      >
                        <i className="ri-arrow-left-s-line" />
                      </button>
                      <span className="pagination-info">
                        Page {responsesPage} of {responsePages}
                      </span>
                      <button
                        type="button"
                        className="page-btn"
                        disabled={responsesPage >= responsePages}
                        onClick={() => void loadResponses(selectedForm.id, responsesPage + 1)}
                      >
                        <i className="ri-arrow-right-s-line" />
                      </button>
                    </div>
                  </div>
                )}

                {selectedResponse && (
                  <div className="card" style={{ marginTop: 20 }}>
                    <div className="card-hdr">
                      <h4 className="card-title">Response detail</h4>
                      <button type="button" className="btn-icon-only" onClick={() => setSelectedResponse(null)}>
                        <i className="ri-close-line" />
                      </button>
                    </div>
                    <dl className="response-detail-grid">
                      <dt>Respondent</dt>
                      <dd>{selectedResponse.user_name || selectedResponse.user_id}</dd>
                      <dt>Email</dt>
                      <dd>{selectedResponse.user_email || '—'}</dd>
                      <dt>Submitted</dt>
                      <dd>{formatDateTime(selectedResponse.created_at)}</dd>
                      {selectedForm.fields.map((field) => (
                        <Fragment key={field.name}>
                          <dt>{field.label}</dt>
                          <dd>{formatFieldValue(selectedResponse.data[field.name])}</dd>
                        </Fragment>
                      ))}
                      {selectedResponse.notes && (
                        <>
                          <dt>Notes</dt>
                          <dd>{selectedResponse.notes}</dd>
                        </>
                      )}
                    </dl>
                  </div>
                )}
              </>
            )}

            {panelTab === 'analytics' && (
              <>
                {analyticsLoading && (
                  <div className="empty-state">
                    <i className="ri-loader-4-line spin" /> Loading analytics...
                  </div>
                )}
                {!analyticsLoading && analytics && (
                  <>
                    <section className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                      <div className="stat-card">
                        <div>
                          <p className="stat-val">{analytics.total_responses}</p>
                          <p className="stat-lbl">Total responses</p>
                        </div>
                      </div>
                      <div className="stat-card">
                        <div>
                          <p className="stat-val">{analytics.responses_last_7_days}</p>
                          <p className="stat-lbl">Last 7 days</p>
                        </div>
                      </div>
                      <div className="stat-card">
                        <div>
                          <p className="stat-val">{analytics.responses_last_30_days}</p>
                          <p className="stat-lbl">Last 30 days</p>
                        </div>
                      </div>
                    </section>

                    {analytics.daily_counts.some((d) => d.count > 0) && (
                      <div className="card" style={{ marginBottom: 20 }}>
                        <h4 className="card-title" style={{ marginBottom: 16 }}>
                          Responses over time (30 days)
                        </h4>
                        <div className="daily-chart">
                          {analytics.daily_counts.map((d) => (
                            <div key={d.date} className="daily-bar-wrap" title={`${d.date}: ${d.count}`}>
                              <div
                                className="daily-bar"
                                style={{ height: `${Math.max(4, (d.count / maxDailyCount) * 100)}%` }}
                              />
                              <span className="daily-label">{d.date.slice(5)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="card">
                      <h4 className="card-title" style={{ marginBottom: 16 }}>
                        Field breakdown
                      </h4>
                      {analytics.field_analytics.map((fa) => (
                        <div key={fa.name} className="analytics-field">
                          <p style={{ fontWeight: 600, marginBottom: 8 }}>
                            {fa.label}{' '}
                            <span style={{ color: '#aaa', fontWeight: 400, fontSize: 12 }}>
                              ({fa.total_answered} answered)
                            </span>
                          </p>
                          {fa.option_counts ? (
                            fa.option_counts.map((oc) => {
                              const pct =
                                fa.total_answered > 0 ? Math.round((oc.count / fa.total_answered) * 100) : 0
                              return (
                                <div key={oc.option} className="bar-chart-row">
                                  <span className="bar-chart-label">{oc.option}</span>
                                  <div className="bar-chart-track">
                                    <div className="bar-chart-fill" style={{ width: `${pct}%` }} />
                                  </div>
                                  <span className="bar-chart-count">{oc.count}</span>
                                </div>
                              )
                            })
                          ) : (
                            <p style={{ fontSize: 12, color: '#888' }}>Text / open-ended field</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {!analyticsLoading && !analytics && (
                  <div className="empty-state">Could not load analytics</div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
