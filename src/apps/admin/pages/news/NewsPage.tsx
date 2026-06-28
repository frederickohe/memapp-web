import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { newsApi, storageApi } from '../../core/services'
import type { NewsContentType, NewsItem } from '../../core/models'
import { ApiError } from '../../core/utils/apiError'
import './news.css'

type ViewMode = 'list' | 'editor'
type TypeFilter = 'All' | NewsContentType
type StatusFilter = 'All' | 'Published' | 'Draft'

interface NewsDraft {
  title: string
  content: string
  summary: string
  content_type: NewsContentType
  is_impact_story: boolean
  event_date: string
  event_location: string
  is_published: boolean
  media_url: string
}

function emptyDraft(): NewsDraft {
  return {
    title: '',
    content: '',
    summary: '',
    content_type: 'NEWS',
    is_impact_story: false,
    event_date: '',
    event_location: '',
    is_published: false,
    media_url: '',
  }
}

function toDateInputValue(iso?: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 16)
}

function toIsoDateTime(dateStr: string): string | undefined {
  if (!dateStr) return undefined
  return new Date(dateStr).toISOString()
}

function newsToDraft(item: NewsItem): NewsDraft {
  return {
    title: item.title,
    content: item.content,
    summary: item.summary ?? '',
    content_type: item.content_type,
    is_impact_story: item.is_impact_story,
    event_date: toDateInputValue(item.event_date),
    event_location: item.event_location ?? '',
    is_published: item.is_published,
    media_url: item.media[0]?.url ?? '',
  }
}

function formatDate(value?: string): string {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function NewsPage() {
  const [view, setView] = useState<ViewMode>('list')
  const [items, setItems] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [size] = useState(15)

  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('All')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All')

  const [editingItem, setEditingItem] = useState<NewsItem | null>(null)
  const [draft, setDraft] = useState<NewsDraft>(emptyDraft())
  const [savePending, setSavePending] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [uploadPending, setUploadPending] = useState(false)
  const [actionPending, setActionPending] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const load = useCallback(
    async (targetPage = 1) => {
      setLoading(true)
      setError(null)
      try {
        const data = await newsApi.list({
          page: targetPage,
          size,
          content_type: typeFilter === 'All' ? undefined : typeFilter,
          published_only:
            statusFilter === 'All' ? undefined : statusFilter === 'Published',
        })
        setItems(data.items)
        setTotal(data.total)
        setPage(data.page)
      } catch (err: unknown) {
        setError(err instanceof ApiError ? err.message : 'Failed to load news.')
      } finally {
        setLoading(false)
      }
    },
    [size, typeFilter, statusFilter],
  )

  useEffect(() => {
    if (view === 'list') {
      void load()
    }
  }, [load, view])

  const filteredItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return items
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(term) ||
        (item.summary ?? '').toLowerCase().includes(term),
    )
  }, [items, searchTerm])

  const publishedCount = useMemo(() => items.filter((i) => i.is_published).length, [items])
  const impactCount = useMemo(() => items.filter((i) => i.is_impact_story).length, [items])
  const eventCount = useMemo(() => items.filter((i) => i.content_type === 'EVENT').length, [items])
  const pages = Math.max(1, Math.ceil(total / size))

  const openCreate = () => {
    setEditingItem(null)
    setDraft(emptyDraft())
    setSaveError(null)
    setView('editor')
  }

  const openEdit = (item: NewsItem) => {
    setEditingItem(item)
    setDraft(newsToDraft(item))
    setSaveError(null)
    setView('editor')
  }

  const closeEditor = () => {
    setView('list')
    setEditingItem(null)
    setDraft(emptyDraft())
    setSaveError(null)
  }

  const handleMediaSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadPending(true)
    setSaveError(null)
    try {
      const result = await storageApi.upload(file)
      setDraft((prev) => ({ ...prev, media_url: result.file_url }))
    } catch (err: unknown) {
      setSaveError(err instanceof ApiError ? err.message : 'Failed to upload media.')
    } finally {
      setUploadPending(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const buildPayload = () => ({
    title: draft.title.trim(),
    content: draft.content.trim(),
    summary: draft.summary.trim() || undefined,
    content_type: draft.content_type,
    is_impact_story: draft.is_impact_story,
    event_date: draft.content_type === 'EVENT' ? toIsoDateTime(draft.event_date) : undefined,
    event_location:
      draft.content_type === 'EVENT' ? draft.event_location.trim() || undefined : undefined,
    is_published: draft.is_published,
    media: draft.media_url ? [{ url: draft.media_url, media_type: 'IMAGE', order: 0 }] : [],
  })

  const handleSave = async () => {
    if (!draft.title.trim()) {
      setSaveError('Title is required.')
      return
    }
    if (!draft.content.trim()) {
      setSaveError('Content is required.')
      return
    }
    if (draft.content_type === 'EVENT' && !draft.event_date) {
      setSaveError('Event date is required for events.')
      return
    }

    setSavePending(true)
    setSaveError(null)
    try {
      const payload = buildPayload()
      if (editingItem) {
        await newsApi.update(editingItem.id, payload)
      } else {
        await newsApi.create(payload)
      }
      closeEditor()
      void load(page)
    } catch (err: unknown) {
      setSaveError(err instanceof ApiError ? err.message : 'Failed to save.')
    } finally {
      setSavePending(false)
    }
  }

  const handleTogglePublish = async (item: NewsItem) => {
    setActionPending(item.id)
    try {
      if (item.is_published) {
        await newsApi.unpublish(item.id)
      } else {
        await newsApi.publish(item.id)
      }
      void load(page)
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : 'Failed to update publish status.')
    } finally {
      setActionPending(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this item? This cannot be undone.')) return
    setActionPending(id)
    try {
      await newsApi.delete(id)
      void load(page)
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete.')
    } finally {
      setActionPending(null)
    }
  }

  if (view === 'editor') {
    return (
      <div className="news-page news-editor">
        <div className="news-back-bar">
          <button type="button" className="news-back-btn" onClick={closeEditor}>
            <i className="ri-arrow-left-line" />
            Back to News & Updates
          </button>
          <button
            type="button"
            className="btn-green"
            onClick={() => void handleSave()}
            disabled={savePending}
          >
            {savePending ? 'Saving…' : 'Save'}
            <i className="ri-save-line" />
          </button>
        </div>

        {saveError && <div className="news-form-error">{saveError}</div>}

        <div className="card">
          <div className="news-media-row">
            <div className="news-media-preview">
              {draft.media_url ? (
                <img src={draft.media_url} alt="Cover" />
              ) : (
                <span className="empty-state">No cover image</span>
              )}
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => void handleMediaSelect(e)}
              />
              <button
                type="button"
                className="btn-outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadPending}
              >
                {uploadPending ? 'Uploading…' : 'Upload Cover Image'}
              </button>
            </div>
          </div>

          <div className="news-form-fields">
            <div className="form-group">
              <label className="form-label">Type</label>
              <select
                className="form-select"
                value={draft.content_type}
                onChange={(e) =>
                  setDraft({ ...draft, content_type: e.target.value as NewsContentType })
                }
              >
                <option value="NEWS">News / Update</option>
                <option value="EVENT">Upcoming Event</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Title</label>
              <input
                type="text"
                className="form-input"
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Summary (optional)</label>
              <input
                type="text"
                className="form-input"
                value={draft.summary}
                onChange={(e) => setDraft({ ...draft, summary: e.target.value })}
                placeholder="Short excerpt shown in lists"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Content</label>
              <textarea
                className="form-input"
                rows={8}
                value={draft.content}
                onChange={(e) => setDraft({ ...draft, content: e.target.value })}
              />
            </div>

            {draft.content_type === 'EVENT' && (
              <>
                <div className="form-group">
                  <label className="form-label">Event Date & Time</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={draft.event_date}
                    onChange={(e) => setDraft({ ...draft, event_date: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Event Location</label>
                  <input
                    type="text"
                    className="form-input"
                    value={draft.event_location}
                    onChange={(e) => setDraft({ ...draft, event_location: e.target.value })}
                  />
                </div>
              </>
            )}

            <div className="news-checkbox-row">
              <input
                type="checkbox"
                id="impact-story"
                checked={draft.is_impact_story}
                onChange={(e) => setDraft({ ...draft, is_impact_story: e.target.checked })}
              />
              <label htmlFor="impact-story">
                Impact Story — highlighted on member dashboards
              </label>
            </div>

            <div className="news-checkbox-row">
              <input
                type="checkbox"
                id="publish-now"
                checked={draft.is_published}
                onChange={(e) => setDraft({ ...draft, is_published: e.target.checked })}
              />
              <label htmlFor="publish-now">Publish immediately</label>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="news-page">
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon icon-green">
            <i className="ri-newspaper-line" />
          </div>
          <div>
            <p className="stat-val">{total}</p>
            <p className="stat-lbl">Total Posts</p>
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
          <div className="stat-icon icon-orange">
            <i className="ri-star-line" />
          </div>
          <div>
            <p className="stat-val">{impactCount}</p>
            <p className="stat-lbl">Impact Stories</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-purple">
            <i className="ri-calendar-event-line" />
          </div>
          <div>
            <p className="stat-val">{eventCount}</p>
            <p className="stat-lbl">Events</p>
          </div>
        </div>
      </section>

      <section className="card table-card">
        <div className="card-hdr">
          <h2 className="card-title">News & Updates</h2>
          <div className="filter-bar">
            <div className="search-box">
              <i className="ri-search-line" />
              <input
                type="text"
                placeholder="Search posts…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="filter-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
            >
              <option value="All">All Types</option>
              <option value="NEWS">News</option>
              <option value="EVENT">Events</option>
            </select>
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            >
              <option value="All">All Status</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
            </select>
            <button type="button" className="btn-icon-only" title="Refresh" onClick={() => void load(page)}>
              <i className="ri-refresh-line" />
            </button>
            <button type="button" className="btn-green" onClick={openCreate}>
              <i className="ri-add-line" /> New Post
            </button>
          </div>
        </div>

        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Status</th>
                <th>Date</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state">
                      <i className="ri-loader-4-line spin" /> Loading posts…
                    </div>
                  </td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state">
                      <i className="ri-error-warning-line" /> {error}
                    </div>
                  </td>
                </tr>
              )}
              {!loading &&
                !error &&
                filteredItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <p className="cell-name">{item.title}</p>
                      {item.is_impact_story && <span className="news-impact-badge">Impact</span>}
                      {item.summary && <p className="cell-sub">{item.summary}</p>}
                    </td>
                    <td>
                      <span
                        className={`news-type-badge news-type-${item.content_type.toLowerCase()}`}
                      >
                        {item.content_type === 'EVENT' ? 'Event' : 'News'}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${item.is_published ? 'badge-completed' : 'badge-cancelled'}`}
                      >
                        {item.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td>
                      {item.content_type === 'EVENT'
                        ? formatDate(item.event_date)
                        : formatDate(item.published_at ?? item.created_at)}
                    </td>
                    <td>
                      <div className="news-row-actions">
                        <button type="button" title="Edit" onClick={() => openEdit(item)}>
                          <i className="ri-edit-line" />
                        </button>
                        <button
                          type="button"
                          title={item.is_published ? 'Unpublish' : 'Publish'}
                          disabled={actionPending === item.id}
                          onClick={() => void handleTogglePublish(item)}
                        >
                          <i className={item.is_published ? 'ri-eye-off-line' : 'ri-eye-line'} />
                        </button>
                        <button
                          type="button"
                          title="Delete"
                          className="danger"
                          disabled={actionPending === item.id}
                          onClick={() => void handleDelete(item.id)}
                        >
                          <i className="ri-delete-bin-line" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              {!loading && !error && filteredItems.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state">No posts found</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div className="pagination-row">
            <button
              type="button"
              className="btn-outline"
              disabled={page <= 1}
              onClick={() => void load(page - 1)}
            >
              Previous
            </button>
            <span>
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
