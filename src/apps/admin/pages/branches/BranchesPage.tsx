import { useCallback, useEffect, useMemo, useState } from 'react'
import { branchesToMapMarkers, YmcaBranchMap } from '../../components/YmcaBranchMap'
import { branchApi, memberUserApi } from '../../core/services'
import type { Branch, CreateBranchRequest, MemberUser, Region } from '../../core/models'
import { ApiError } from '../../core/utils/apiError'
import '../../styles/shared.css'
import '../dashboard/dashboard.css'
import './branches.css'

type BranchForm = {
  region_id: string
  name: string
  address: string
  lat: string
  lng: string
  president_id: string
  collects_dues: boolean
}

function emptyForm(regionId = ''): BranchForm {
  return {
    region_id: regionId,
    name: '',
    address: '',
    lat: '',
    lng: '',
    president_id: '',
    collects_dues: true,
  }
}

export function BranchesPage() {
  const [regions, setRegions] = useState<Region[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [members, setMembers] = useState<MemberUser[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [regionFilter, setRegionFilter] = useState<string>('all')
  const [showModal, setShowModal] = useState(false)
  const [showRegionModal, setShowRegionModal] = useState(false)
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null)
  const [form, setForm] = useState<BranchForm>(emptyForm())
  const [regionName, setRegionName] = useState('')
  const [savePending, setSavePending] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    const results = await Promise.allSettled([
      branchApi.listRegions(false),
      branchApi.listBranches(undefined, false),
    ])
    const [regionResult, branchResult] = results

    if (regionResult.status === 'fulfilled') {
      setRegions(regionResult.value)
    }
    if (branchResult.status === 'fulfilled') {
      setBranches(branchResult.value)
    }

    const failures = results.filter((r) => r.status === 'rejected')
    if (failures.length > 0) {
      const first = failures[0]
      setError(
        first.status === 'rejected' && first.reason instanceof ApiError
          ? first.reason.message
          : 'Failed to load branches.',
      )
    }
    setLoading(false)
  }, [])

  const loadMembers = useCallback(async () => {
    if (members.length > 0) return
    try {
      const memberData = await memberUserApi.list({ limit: 100 })
      setMembers(memberData.users)
    } catch {
      setMembers([])
    }
  }, [members.length])

  useEffect(() => {
    void load()
  }, [load])

  const filteredBranches = useMemo(() => {
    if (regionFilter === 'all') return branches
    return branches.filter((b) => b.region_id === regionFilter)
  }, [branches, regionFilter])

  const mapBranches = useMemo(() => branchesToMapMarkers(filteredBranches), [filteredBranches])

  const openCreate = () => {
    setEditingBranch(null)
    setForm(emptyForm(regions[0]?.id ?? ''))
    setSaveError(null)
    setShowModal(true)
    void loadMembers()
  }

  const openCreateRegion = () => {
    setRegionName('')
    setSaveError(null)
    setShowRegionModal(true)
  }

  const closeRegionModal = () => {
    setShowRegionModal(false)
    setRegionName('')
  }

  const openEdit = (branch: Branch) => {
    setEditingBranch(branch)
    setForm({
      region_id: branch.region_id,
      name: branch.name,
      address: branch.address ?? '',
      lat: branch.lat != null ? String(branch.lat) : '',
      lng: branch.lng != null ? String(branch.lng) : '',
      president_id: branch.president?.id ?? '',
      collects_dues: branch.collects_dues !== false,
    })
    setSaveError(null)
    setShowModal(true)
    void loadMembers()
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingBranch(null)
  }

  const saveRegion = async () => {
    const name = regionName.trim()
    if (!name) return
    setSavePending(true)
    setSaveError(null)
    try {
      const created = await branchApi.createRegion({ name })
      setRegions((current) =>
        [...current.filter((region) => region.id !== created.id), created].sort((a, b) =>
          a.name.localeCompare(b.name),
        ),
      )
      setForm((f) => ({ ...f, region_id: f.region_id || created.id }))
      closeRegionModal()
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : 'Failed to create region.')
    } finally {
      setSavePending(false)
    }
  }

  const saveBranch = async () => {
    if (!form.name.trim() || !form.region_id) return
    setSavePending(true)
    setSaveError(null)

    const payload: CreateBranchRequest = {
      region_id: form.region_id,
      name: form.name.trim(),
      address: form.address.trim() || undefined,
      lat: form.lat ? parseFloat(form.lat) : undefined,
      lng: form.lng ? parseFloat(form.lng) : undefined,
      president_id: form.president_id || undefined,
      collects_dues: form.collects_dues,
    }

    try {
      if (editingBranch) {
        const updated = await branchApi.updateBranch(editingBranch.id, {
          ...payload,
          president_id: form.president_id || null,
        })
        setBranches((current) => current.map((branch) => (branch.id === updated.id ? updated : branch)))
      } else {
        const created = await branchApi.createBranch(payload)
        setBranches((current) =>
          [...current.filter((branch) => branch.id !== created.id), created].sort((a, b) =>
            a.name.localeCompare(b.name),
          ),
        )
      }
      closeModal()
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : 'Failed to save branch.')
    } finally {
      setSavePending(false)
    }
  }

  const toggleActive = async (branch: Branch) => {
    try {
      const updated = await branchApi.updateBranch(branch.id, { is_active: !branch.is_active })
      setBranches((current) => current.map((item) => (item.id === updated.id ? updated : item)))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to update branch status.')
    }
  }

  return (
    <div className="branches-page">
      {error && (
        <div className="auth-alert auth-alert-error" style={{ marginBottom: 18 }}>
          <i className="ri-error-warning-line" />
          <span>{error}</span>
        </div>
      )}

      <div className="branches-toolbar">
        <div>
          <h2 className="card-title" style={{ margin: 0 }}>
            Branches
          </h2>
          <p className="text-muted" style={{ margin: '4px 0 0', fontSize: '0.9rem' }}>
            Manage YMCA branches and assign branch presidents
          </p>
        </div>
        <div className="branches-toolbar-actions">
          <button type="button" className="btn-outline" onClick={openCreateRegion}>
            <i className="ri-map-pin-add-line" /> Add Region
          </button>
          <button type="button" className="btn-green" onClick={openCreate} disabled={regions.length === 0}>
            <i className="ri-add-line" /> Add Branch
          </button>
        </div>
      </div>

      <section className="card map-card map-card-full">
        <div className="card-hdr">
          <h2 className="card-title">Branch map</h2>
        </div>
        <div className="map-box map-box-tall">
          <YmcaBranchMap className="osm-map-container" branches={mapBranches} />
        </div>
        <div className="map-legend">
          <span className="ldot ldot-blue" />
          <span className="ltext">
            {filteredBranches.length} {filteredBranches.length === 1 ? 'branch' : 'branches'}
            {filteredBranches.some((branch) => branch.lat == null || branch.lng == null)
              ? ' · branches without coordinates are hidden on the map'
              : ''}
          </span>
        </div>
      </section>

      <div className="branches-regions-row">
        <button
          type="button"
          className={`region-chip${regionFilter === 'all' ? ' active' : ''}`}
          onClick={() => setRegionFilter('all')}
        >
          All regions ({branches.length})
        </button>
        {regions.map((region) => (
          <button
            key={region.id}
            type="button"
            className={`region-chip${regionFilter === region.id ? ' active' : ''}`}
            onClick={() => setRegionFilter(region.id)}
          >
            {region.name} ({branches.filter((b) => b.region_id === region.id).length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="empty-state">
          <i className="ri-loader-4-line" /> Loading branches…
        </div>
      ) : (
        <div className="branches-grid">
          {filteredBranches.map((branch) => (
            <article key={branch.id} className="branch-card">
              <div className="branch-card-hdr">
                <div>
                  <h3 className="branch-card-title">{branch.name}</h3>
                  <p className="branch-card-region">{branch.region_name}</p>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <span className={`badge ${branch.is_active ? 'badge-active' : 'badge-inactive'}`}>
                    {branch.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <span className={`badge ${branch.collects_dues === false ? 'badge-inactive' : 'badge-active'}`}>
                    {branch.collects_dues === false ? 'Affiliation only' : 'Dues + affiliation'}
                  </span>
                </div>
              </div>
              {branch.address && <p className="branch-card-meta">{branch.address}</p>}
              {branch.president ? (
                <div className="branch-card-president">
                  <i className="ri-user-star-line" />
                  <div>
                    <strong>{branch.president.full_name}</strong>
                    <div>{branch.president.email}</div>
                  </div>
                </div>
              ) : (
                <div className="branch-card-president">
                  <i className="ri-user-unfollow-line" />
                  No president assigned
                </div>
              )}
              <div className="branch-card-actions">
                <button type="button" className="btn-outline btn-sm" onClick={() => openEdit(branch)}>
                  Edit
                </button>
                <button type="button" className="btn-outline btn-sm" onClick={() => toggleActive(branch)}>
                  {branch.is_active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </article>
          ))}
          {filteredBranches.length === 0 && (
            <div className="empty-state">
              <i className="ri-building-line" />
              {regions.length === 0
                ? 'Create a region first, then add a branch under it.'
                : 'No branches found'}
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-hdr">
              <h3 className="modal-title">{editingBranch ? 'Edit Branch' : 'Add Branch'}</h3>
              <button type="button" className="modal-close" onClick={closeModal}>
                <i className="ri-close-line" />
              </button>
            </div>

            {saveError && (
              <div className="auth-alert auth-alert-error" style={{ marginBottom: 12 }}>
                {saveError}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Region</label>
              {regions.length === 0 ? (
                <p className="form-hint">
                  No regions yet. Close this dialog and use <strong>Add Region</strong> first.
                </p>
              ) : (
                <select
                  className="form-select"
                  value={form.region_id}
                  onChange={(e) => setForm((f) => ({ ...f, region_id: e.target.value }))}
                >
                  <option value="">Select a region</option>
                  {regions.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Branch name</label>
              <input
                className="form-input"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Address</label>
              <input
                className="form-input"
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              />
            </div>

            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Latitude</label>
                <input
                  className="form-input"
                  value={form.lat}
                  onChange={(e) => setForm((f) => ({ ...f, lat: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Longitude</label>
                <input
                  className="form-input"
                  value={form.lng}
                  onChange={(e) => setForm((f) => ({ ...f, lng: e.target.value }))}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Member payments</label>
              <select
                className="form-select"
                value={form.collects_dues ? 'dues' : 'affiliation'}
                onChange={(e) =>
                  setForm((f) => ({ ...f, collects_dues: e.target.value === 'dues' }))
                }
              >
                <option value="dues">Dues and affiliation</option>
                <option value="affiliation">Affiliation only</option>
              </select>
              <p className="form-hint">
                Affiliation applies to every branch. Turn dues off for branches that do not collect monthly dues.
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">Branch president (member)</label>
              <select
                className="form-select"
                value={form.president_id}
                onChange={(e) => setForm((f) => ({ ...f, president_id: e.target.value }))}
              >
                <option value="">None</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.full_name} ({m.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-outline" onClick={closeModal}>
                Cancel
              </button>
              <button
                type="button"
                className="btn-green"
                disabled={savePending || !form.name.trim() || !form.region_id}
                onClick={() => void saveBranch()}
              >
                {savePending ? 'Saving…' : editingBranch ? 'Save changes' : 'Create branch'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showRegionModal && (
        <div className="modal-overlay" onClick={closeRegionModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-hdr">
              <h3 className="modal-title">Add Region</h3>
              <button type="button" className="modal-close" onClick={closeRegionModal}>
                <i className="ri-close-line" />
              </button>
            </div>

            {saveError && (
              <div className="auth-alert auth-alert-error" style={{ marginBottom: 12 }}>
                {saveError}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Region name</label>
              <input
                className="form-input"
                placeholder="e.g. Central"
                value={regionName}
                onChange={(e) => setRegionName(e.target.value)}
              />
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-outline" onClick={closeRegionModal}>
                Cancel
              </button>
              <button
                type="button"
                className="btn-green"
                disabled={savePending || !regionName.trim()}
                onClick={() => void saveRegion()}
              >
                {savePending ? 'Saving…' : 'Create region'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
