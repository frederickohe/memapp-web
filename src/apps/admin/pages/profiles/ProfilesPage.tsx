import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { profileApi, storageApi } from '../../core/services'
import type { ProminentCategory, ProminentProfile } from '../../core/models'
import { ApiError } from '../../core/utils/apiError'
import './profiles.css'

type ViewMode = 'list' | 'editor'
type CategoryFilter = 'All' | ProminentCategory
type StatusFilter = 'All' | 'Published' | 'Draft'

interface ProfileDraft {
  full_name: string
  headline: string
  bio: string
  photo_url: string
  country: string
  occupation: string
  era: string
  category: ProminentCategory
  sort_order: string
  is_published: boolean
}

function emptyDraft(): ProfileDraft {
  return {
    full_name: '',
    headline: '',
    bio: '',
    photo_url: '',
    country: '',
    occupation: '',
    era: '',
    category: 'GHANA',
    sort_order: '0',
    is_published: true,
  }
}

function toDraft(item: ProminentProfile): ProfileDraft {
  return {
    full_name: item.full_name,
    headline: item.prominent_headline ?? '',
    bio: item.bio ?? '',
    photo_url: item.profile_picture_url ?? '',
    country: item.country ?? '',
    occupation: item.occupation ?? '',
    era: item.era ?? '',
    category: item.category === 'WORLD' ? 'WORLD' : 'GHANA',
    sort_order: String(item.sort_order ?? 0),
    is_published: item.is_published,
  }
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return 'Y'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

export function ProfilesPage() {
  const [view, setView] = useState<ViewMode>('list')
  const [items, setItems] = useState<ProminentProfile[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [size] = useState(20)

  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('All')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All')

  const [editingItem, setEditingItem] = useState<ProminentProfile | null>(null)
  const [draft, setDraft] = useState<ProfileDraft>(emptyDraft())
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
        const data = await profileApi.list({
          page: targetPage,
          size,
          category: categoryFilter === 'All' ? undefined : categoryFilter,
          published_only:
            statusFilter === 'All' ? undefined : statusFilter === 'Published',
        })
        setItems(data.items)
        setTotal(data.total)
        setPage(data.page)
      } catch (err: unknown) {
        setError(err instanceof ApiError ? err.message : 'Failed to load profiles.')
      } finally {
        setLoading(false)
      }
    },
    [size, categoryFilter, statusFilter],
  )

  useEffect(() => {
    if (view === 'list') void load()
  }, [load, view])

  const filteredItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return items
    return items.filter(
      (item) =>
        item.full_name.toLowerCase().includes(term) ||
        (item.prominent_headline ?? '').toLowerCase().includes(term) ||
        (item.country ?? '').toLowerCase().includes(term),
    )
  }, [items, searchTerm])

  const publishedCount = useMemo(() => items.filter((i) => i.is_published).length, [items])
  const ghanaCount = useMemo(() => items.filter((i) => i.category === 'GHANA').length, [items])
  const pages = Math.max(1, Math.ceil(total / size))

  const openCreate = () => {
    setEditingItem(null)
    setDraft(emptyDraft())
    setSaveError(null)
    setView('editor')
  }

  const openEdit = (item: ProminentProfile) => {
    setEditingItem(item)
    setDraft(toDraft(item))
    setSaveError(null)
    setView('editor')
  }

  const closeEditor = () => {
    setView('list')
    setEditingItem(null)
    setDraft(emptyDraft())
    setSaveError(null)
  }

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadPending(true)
    setSaveError(null)
    try {
      const result = await storageApi.upload(file)
      setDraft((prev) => ({ ...prev, photo_url: result.file_url }))
    } catch (err: unknown) {
      setSaveError(err instanceof ApiError ? err.message : 'Failed to upload photo.')
    } finally {
      setUploadPending(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSave = async () => {
    if (!draft.full_name.trim()) {
      setSaveError('Full name is required.')
      return
    }
    if (!draft.bio.trim()) {
      setSaveError('Biography is required so members can read about this person.')
      return
    }

    setSavePending(true)
    setSaveError(null)
    try {
      const payload = {
        full_name: draft.full_name.trim(),
        headline: draft.headline.trim() || undefined,
        bio: draft.bio.trim(),
        photo_url: draft.photo_url.trim(),
        country: draft.country.trim() || undefined,
        occupation: draft.occupation.trim() || undefined,
        era: draft.era.trim() || undefined,
        category: draft.category,
        sort_order: parseInt(draft.sort_order, 10) || 0,
        is_published: draft.is_published,
      }
      if (editingItem) {
        await profileApi.update(editingItem.id, payload)
      } else {
        await profileApi.create(payload)
      }
      closeEditor()
      void load(page)
    } catch (err: unknown) {
      setSaveError(err instanceof ApiError ? err.message : 'Failed to save profile.')
    } finally {
      setSavePending(false)
    }
  }

  const handleTogglePublish = async (item: ProminentProfile) => {
    setActionPending(item.id)
    try {
      await profileApi.update(item.id, { is_published: !item.is_published })
      void load(page)
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : 'Failed to update publish status.')
    } finally {
      setActionPending(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this prominent profile? This cannot be undone.')) return
    setActionPending(id)
    try {
      await profileApi.delete(id)
      void load(page)
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete.')
    } finally {
      setActionPending(null)
    }
  }

  if (view === 'editor') {
    return (
      <div className="profiles-page profiles-editor">
        <div className="news-back-bar">
          <button type="button" className="news-back-btn" onClick={closeEditor}>
            <i className="ri-arrow-left-line" />
            Back to Prominent Profiles
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
          <div className="profile-photo-row">
            <div className="profile-photo-preview">
              {draft.photo_url ? (
                <img src={draft.photo_url} alt={draft.full_name || 'Portrait'} />
              ) : (
                <span>{initials(draft.full_name)}</span>
              )}
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => void handlePhotoSelect(e)}
              />
              <button
                type="button"
                className="btn-outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadPending}
              >
                {uploadPending ? 'Uploading…' : 'Upload Photo'}
              </button>
              <p className="profile-photo-hint">
                Square portraits work best. You can also paste an image URL below.
              </p>
            </div>
          </div>

          <div className="news-form-fields">
            <div className="form-group">
              <label className="form-label">Photo URL (optional)</label>
              <input
                type="text"
                className="form-input"
                value={draft.photo_url}
                onChange={(e) => setDraft({ ...draft, photo_url: e.target.value })}
                placeholder="https://…"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Full name</label>
              <input
                type="text"
                className="form-input"
                value={draft.full_name}
                onChange={(e) => setDraft({ ...draft, full_name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Headline</label>
              <input
                type="text"
                className="form-input"
                value={draft.headline}
                onChange={(e) => setDraft({ ...draft, headline: e.target.value })}
                placeholder="Founder of the YMCA"
              />
            </div>
            <div className="profile-grid">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={draft.category}
                  onChange={(e) =>
                    setDraft({ ...draft, category: e.target.value as ProminentCategory })
                  }
                >
                  <option value="GHANA">Ghana</option>
                  <option value="WORLD">World</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Country</label>
                <input
                  type="text"
                  className="form-input"
                  value={draft.country}
                  onChange={(e) => setDraft({ ...draft, country: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Occupation / role</label>
                <input
                  type="text"
                  className="form-input"
                  value={draft.occupation}
                  onChange={(e) => setDraft({ ...draft, occupation: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Era / years</label>
                <input
                  type="text"
                  className="form-input"
                  value={draft.era}
                  onChange={(e) => setDraft({ ...draft, era: e.target.value })}
                  placeholder="1821 – 1905 or Present"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Display order</label>
                <input
                  type="number"
                  className="form-input"
                  value={draft.sort_order}
                  onChange={(e) => setDraft({ ...draft, sort_order: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Biography</label>
              <textarea
                className="form-input"
                rows={10}
                value={draft.bio}
                onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
                placeholder="Write the story members will read."
              />
            </div>
            <div className="news-checkbox-row">
              <input
                type="checkbox"
                id="publish-profile"
                checked={draft.is_published}
                onChange={(e) => setDraft({ ...draft, is_published: e.target.checked })}
              />
              <label htmlFor="publish-profile">Show on member dashboard</label>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="profiles-page">
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon icon-green">
            <i className="ri-user-star-line" />
          </div>
          <div>
            <p className="stat-val">{total}</p>
            <p className="stat-lbl">Total Profiles</p>
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
            <i className="ri-map-pin-line" />
          </div>
          <div>
            <p className="stat-val">{ghanaCount}</p>
            <p className="stat-lbl">Ghana</p>
          </div>
        </div>
      </section>

      <section className="card table-card">
        <div className="card-hdr">
          <h2 className="card-title">Prominent Profiles</h2>
          <div className="filter-bar">
            <div className="search-box">
              <i className="ri-search-line" />
              <input
                type="text"
                placeholder="Search people…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="filter-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as CategoryFilter)}
            >
              <option value="All">All Regions</option>
              <option value="GHANA">Ghana</option>
              <option value="WORLD">World</option>
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
              <i className="ri-add-line" /> New Profile
            </button>
          </div>
        </div>

        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Person</th>
                <th>Category</th>
                <th>Status</th>
                <th>Order</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state">
                      <i className="ri-loader-4-line spin" /> Loading profiles…
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
                      <div className="profile-cell">
                        {item.profile_picture_url ? (
                          <img src={item.profile_picture_url} alt="" />
                        ) : (
                          <span className="profile-cell-initials">{initials(item.full_name)}</span>
                        )}
                        <div>
                          <p className="cell-name">{item.full_name}</p>
                          <p className="cell-sub">{item.prominent_headline || item.occupation || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`news-type-badge ${item.category === 'GHANA' ? 'news-type-news' : 'news-type-event'}`}>
                        {item.category === 'GHANA' ? 'Ghana' : 'World'}
                      </span>
                    </td>
                    <td>{item.is_published ? 'Published' : 'Draft'}</td>
                    <td>{item.sort_order}</td>
                    <td>
                      <div className="news-row-actions">
                        <button type="button" title="Edit" onClick={() => openEdit(item)}>
                          <i className="ri-pencil-line" />
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
                          className="danger"
                          title="Delete"
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
                    <div className="empty-state">No prominent profiles yet.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div className="pager">
            <button type="button" disabled={page <= 1} onClick={() => void load(page - 1)}>
              Previous
            </button>
            <span>
              Page {page} of {pages}
            </span>
            <button type="button" disabled={page >= pages} onClick={() => void load(page + 1)}>
              Next
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
