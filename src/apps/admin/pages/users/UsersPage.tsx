import { useCallback, useEffect, useMemo, useState } from 'react'
import { ScopeFilterBar } from '../../components/ScopeFilterBar'
import { branchApi, memberUserApi } from '../../core/services'
import type { Branch, MemberUser, MemberUserOverview, MemberUserStatus, ScopeFilterParams } from '../../core/models'
import { ApiError } from '../../core/utils/apiError'
import '../../styles/shared.css'
import './users.css'

const MEMBERSHIP_TYPES = ['BASIC', 'STANDARD', 'PREMIUM', 'VIP']

type UpdateMemberUserForm = {
  full_name: string
  email: string
  phone: string
  member_id: string
  membership_type: string
  current_branch: string
  branch_id: string
  month_dues_paid_status: string
  year_affiliation_paid_status: string
  is_prominent: boolean
  prominent_order: number
  prominent_headline: string
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function statusBadgeClass(user: MemberUser): string {
  if (!user.is_active || user.status === 'INACTIVE') return 'badge badge-inactive'
  if (user.status === 'DELETED') return 'badge badge-cancelled'
  return 'badge badge-active'
}

function statusLabel(user: MemberUser): string {
  if (!user.is_active) return 'Inactive'
  return user.status.charAt(0) + user.status.slice(1).toLowerCase()
}

function duesBadgeClass(status?: string): string {
  if (status === 'PAID') return 'badge badge-active'
  return 'badge badge-warning'
}

function userInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function UsersPage() {
  const [users, setUsers] = useState<MemberUser[]>([])
  const [overview, setOverview] = useState<MemberUserOverview | null>(null)
  const [loading, setLoading] = useState(false)
  const [overviewLoading, setOverviewLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | MemberUserStatus>('All')
  const [scopeFilter, setScopeFilter] = useState<ScopeFilterParams>({ scope: 'national' })
  const [membershipFilter, setMembershipFilter] = useState('All')
  const [branches, setBranches] = useState<Branch[]>([])

  const [selectedUser, setSelectedUser] = useState<MemberUser | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [editBuffer, setEditBuffer] = useState<UpdateMemberUserForm | null>(null)
  const [actionPending, setActionPending] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const loadOverview = useCallback(async () => {
    setOverviewLoading(true)
    try {
      const data = await memberUserApi.overview(scopeFilter)
      setOverview(data)
    } catch {
      setOverview(null)
    } finally {
      setOverviewLoading(false)
    }
  }, [scopeFilter])

  useEffect(() => {
    void branchApi.listBranches().then(setBranches).catch(() => setBranches([]))
  }, [])

  const load = useCallback(
    async (targetPage = 1) => {
      setLoading(true)
      setError(null)

      try {
        const data = await memberUserApi.list({
          page: targetPage,
          limit: 20,
          search: searchTerm.trim() || undefined,
          status: statusFilter === 'All' ? undefined : statusFilter,
          ...scopeFilter,
          membership_type: membershipFilter === 'All' ? undefined : membershipFilter,
        })
        setUsers(data.users)
        setTotal(data.total)
        setPage(data.page)
        setPages(data.pages || 1)
      } catch (err: unknown) {
        setError(err instanceof ApiError ? err.message : 'Failed to load users.')
      } finally {
        setLoading(false)
      }
    },
    [searchTerm, statusFilter, scopeFilter, membershipFilter],
  )

  useEffect(() => {
    void loadOverview()
  }, [loadOverview])

  useEffect(() => {
    void load()
  }, [load])

  const stats = useMemo(
    () => [
      {
        label: 'Total Users',
        value: overviewLoading ? '—' : String(overview?.total_users ?? 0),
        icon: 'ri-group-fill',
        color: 'blue',
      },
      {
        label: 'Active Users',
        value: overviewLoading ? '—' : String(overview?.active_users ?? 0),
        icon: 'ri-user-star-fill',
        color: 'green',
      },
      {
        label: 'Dues Pending',
        value: overviewLoading ? '—' : String(overview?.dues_pending ?? 0),
        icon: 'ri-calendar-check-line',
        color: 'orange',
      },
      {
        label: 'Affiliation Pending',
        value: overviewLoading ? '—' : String(overview?.affiliation_pending ?? 0),
        icon: 'ri-award-line',
        color: 'purple',
      },
    ],
    [overview, overviewLoading],
  )

  const goToPage = (target: number) => {
    if (target < 1 || target > pages) return
    void load(target)
  }

  const viewUser = useCallback((user: MemberUser) => {
    setSelectedUser(user)
    setEditMode(false)
    setActionError(null)
  }, [])

  const closeDrawer = useCallback(() => {
    setSelectedUser(null)
    setEditMode(false)
    setEditBuffer(null)
    setActionError(null)
  }, [])

  const startEdit = useCallback(() => {
    setSelectedUser((current) => {
      if (current) {
        setEditBuffer({
          full_name: current.full_name,
          email: current.email,
          phone: current.phone ?? '',
          member_id: current.member_id ?? '',
          membership_type: current.membership_type ?? '',
          current_branch: current.current_branch ?? '',
          branch_id: current.branch_id ?? '',
          month_dues_paid_status: current.month_dues_paid_status ?? '',
          year_affiliation_paid_status: current.year_affiliation_paid_status ?? '',
          is_prominent: current.is_prominent ?? false,
          prominent_order: current.prominent_order ?? 0,
          prominent_headline: current.prominent_headline ?? '',
        })
        setEditMode(true)
      }
      return current
    })
  }, [])

  const saveEdit = async () => {
    if (!editBuffer || !selectedUser) return

    setActionPending(true)
    setActionError(null)

    try {
      const updated = await memberUserApi.update(selectedUser.id, {
        full_name: editBuffer.full_name,
        email: editBuffer.email,
        phone: editBuffer.phone || undefined,
        member_id: editBuffer.member_id || undefined,
        membership_type: editBuffer.membership_type || undefined,
        current_branch: editBuffer.current_branch || undefined,
        branch_id: editBuffer.branch_id || undefined,
        month_dues_paid_status: editBuffer.month_dues_paid_status || undefined,
        year_affiliation_paid_status: editBuffer.year_affiliation_paid_status || undefined,
        is_prominent: editBuffer.is_prominent,
        prominent_order: editBuffer.prominent_order,
        prominent_headline: editBuffer.prominent_headline || undefined,
      })
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
      setSelectedUser(updated)
      setEditMode(false)
      setEditBuffer(null)
      void loadOverview()
    } catch (err: unknown) {
      setActionError(err instanceof ApiError ? err.message : 'Failed to save changes.')
    } finally {
      setActionPending(false)
    }
  }

  const deactivateUser = async () => {
    if (!selectedUser) return

    setActionPending(true)
    setActionError(null)

    try {
      await memberUserApi.deactivate(selectedUser.id)
      closeDrawer()
      void load(page)
      void loadOverview()
    } catch (err: unknown) {
      setActionError(err instanceof ApiError ? err.message : 'Failed to deactivate user.')
    } finally {
      setActionPending(false)
    }
  }

  return (
    <>
      <section className="stats-grid">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className={`stat-icon icon-${stat.color}`}>
              <i className={stat.icon} />
            </div>
            <div>
              <p className="stat-val">{stat.value}</p>
              <p className="stat-lbl">{stat.label}</p>
            </div>
          </div>
        ))}
      </section>

      <ScopeFilterBar value={scopeFilter} onChange={setScopeFilter} />

      <section className="card table-card">
        <div className="card-hdr">
          <h2 className="card-title">All Users</h2>
          <div className="filter-bar">
            <div className="search-box">
              <i className="ri-search-line" />
              <input
                type="text"
                placeholder="Search name, email, phone, member ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && void load(1)}
              />
            </div>
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'All' | MemberUserStatus)}
            >
              <option value="All">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="DELETED">Deleted</option>
            </select>
            <select
              className="filter-select"
              value={membershipFilter}
              onChange={(e) => setMembershipFilter(e.target.value)}
            >
              <option value="All">All Memberships</option>
              {MEMBERSHIP_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <button type="button" className="btn-green" onClick={() => void load(1)} disabled={loading}>
              <i className="ri-refresh-line" /> {loading ? 'Loading…' : 'Search'}
            </button>
          </div>
        </div>

        {error && (
          <div className="error-banner" style={{ marginBottom: 12 }}>
            <i className="ri-error-warning-line" /> {error}
          </div>
        )}

        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>User</th>
                <th>Branch</th>
                <th>Membership</th>
                <th>Volunteer Pts</th>
                <th>Dues</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="clickable-row" onClick={() => viewUser(user)}>
                  <td>
                    <div className="user-left">
                      {user.profile_picture_url ? (
                        <img src={user.profile_picture_url} alt={user.full_name} className="avatar-sm" />
                      ) : (
                        <div className="avatar-placeholder">{userInitials(user.full_name)}</div>
                      )}
                      <div>
                        <p className="cell-name">{user.full_name}</p>
                        <p className="cell-sub">{user.member_id ?? user.id}</p>
                      </div>
                    </div>
                  </td>
                  <td>{user.branch_name || user.current_branch || '—'}</td>
                  <td>{user.membership_type || '—'}</td>
                  <td>{user.volunteer_points}</td>
                  <td>
                    <span className={duesBadgeClass(user.month_dues_paid_status)}>
                      {user.month_dues_paid_status ?? 'Pending'}
                    </span>
                  </td>
                  <td>
                    <span className={statusBadgeClass(user)}>{statusLabel(user)}</span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        type="button"
                        title="View / Edit"
                        onClick={(e) => {
                          e.stopPropagation()
                          viewUser(user)
                        }}
                      >
                        <i className="ri-edit-line" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && users.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <i className="ri-inbox-line" />
                      No users match your filters
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <span className="pagination-info">
            Showing {users.length} of {total} users
          </span>
          <div className="pagination-controls">
            <button type="button" className="page-btn" disabled={page <= 1} onClick={() => goToPage(page - 1)}>
              <i className="ri-arrow-left-s-line" />
            </button>
            <button type="button" className="page-btn active">
              {page}
            </button>
            <button
              type="button"
              className="page-btn"
              disabled={page >= pages}
              onClick={() => goToPage(page + 1)}
            >
              <i className="ri-arrow-right-s-line" />
            </button>
          </div>
        </div>
      </section>

      {selectedUser && (
        <div className="drawer-overlay" onClick={closeDrawer}>
          <div className="drawer-box" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-hdr">
              <h3 className="modal-title">User Profile</h3>
              <button type="button" className="modal-close" onClick={closeDrawer}>
                <i className="ri-close-line" />
              </button>
            </div>

            {actionError && (
              <div className="error-banner" style={{ marginBottom: 12 }}>
                <i className="ri-error-warning-line" /> {actionError}
              </div>
            )}

            {!editMode && (
              <>
                <div className="profile-top">
                  {selectedUser.profile_picture_url ? (
                    <img
                      src={selectedUser.profile_picture_url}
                      alt={selectedUser.full_name}
                      className="avatar-lg"
                    />
                  ) : (
                    <div className="avatar-placeholder" style={{ width: 64, height: 64, fontSize: 22 }}>
                      {userInitials(selectedUser.full_name)}
                    </div>
                  )}
                  <div>
                    <p className="profile-name">{selectedUser.full_name}</p>
                    <p className="profile-id">
                      {selectedUser.member_id ?? selectedUser.id} · Joined {formatDate(selectedUser.created_at)}
                    </p>
                    <span className={statusBadgeClass(selectedUser)} style={{ marginTop: 6 }}>
                      {statusLabel(selectedUser)}
                    </span>
                    {selectedUser.is_prominent && (
                      <span className="badge badge-active" style={{ marginLeft: 8, marginTop: 6 }}>
                        Prominent Profile
                      </span>
                    )}
                  </div>
                </div>

                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Phone</span>
                    <span className="info-value">{selectedUser.phone || '—'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Email</span>
                    <span className="info-value">{selectedUser.email}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Branch</span>
                    <span className="info-value">{selectedUser.branch_name || selectedUser.current_branch || '—'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Membership</span>
                    <span className="info-value">{selectedUser.membership_type || '—'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Monthly Dues</span>
                    <span className="info-value">{selectedUser.month_dues_paid_status ?? 'Pending'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Annual Affiliation</span>
                    <span className="info-value">{selectedUser.year_affiliation_paid_status ?? 'Pending'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Volunteer Points</span>
                    <span className="info-value">{selectedUser.volunteer_points}</span>
                  </div>
                  {selectedUser.is_prominent && (
                    <>
                      <div className="info-item">
                        <span className="info-label">Dashboard Headline</span>
                        <span className="info-value">
                          {selectedUser.prominent_headline || '—'}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Display Order</span>
                        <span className="info-value">{selectedUser.prominent_order}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="drawer-actions">
                  <button type="button" className="btn-outline drawer-btn" onClick={startEdit}>
                    <i className="ri-edit-line" /> Edit Details
                  </button>
                  {selectedUser.is_active && (
                    <button
                      type="button"
                      className="btn-danger drawer-btn"
                      onClick={() => void deactivateUser()}
                      disabled={actionPending}
                    >
                      <i className="ri-forbid-line" /> Deactivate
                    </button>
                  )}
                </div>
              </>
            )}

            {editMode && editBuffer && (
              <>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editBuffer.full_name}
                    onChange={(e) => setEditBuffer({ ...editBuffer, full_name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editBuffer.phone}
                    onChange={(e) => setEditBuffer({ ...editBuffer, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={editBuffer.email}
                    onChange={(e) => setEditBuffer({ ...editBuffer, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Member ID</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editBuffer.member_id}
                    onChange={(e) => setEditBuffer({ ...editBuffer, member_id: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Branch</label>
                  <select
                    className="form-select"
                    value={editBuffer.branch_id}
                    onChange={(e) => {
                      const branch = branches.find((b) => b.id === e.target.value)
                      setEditBuffer({
                        ...editBuffer,
                        branch_id: e.target.value,
                        current_branch: branch?.name ?? editBuffer.current_branch,
                      })
                    }}
                  >
                    <option value="">—</option>
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name} ({branch.region_name})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Membership Type</label>
                  <select
                    className="form-select"
                    value={editBuffer.membership_type}
                    onChange={(e) => setEditBuffer({ ...editBuffer, membership_type: e.target.value })}
                  >
                    <option value="">—</option>
                    {MEMBERSHIP_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Monthly Dues Status</label>
                  <select
                    className="form-select"
                    value={editBuffer.month_dues_paid_status}
                    onChange={(e) =>
                      setEditBuffer({ ...editBuffer, month_dues_paid_status: e.target.value })
                    }
                  >
                    <option value="">Pending</option>
                    <option value="PAID">Paid</option>
                    <option value="UNPAID">Unpaid</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Annual Affiliation Status</label>
                  <select
                    className="form-select"
                    value={editBuffer.year_affiliation_paid_status}
                    onChange={(e) =>
                      setEditBuffer({ ...editBuffer, year_affiliation_paid_status: e.target.value })
                    }
                  >
                    <option value="">Pending</option>
                    <option value="PAID">Paid</option>
                    <option value="UNPAID">Unpaid</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="checkbox"
                      checked={editBuffer.is_prominent}
                      onChange={(e) =>
                        setEditBuffer({ ...editBuffer, is_prominent: e.target.checked })
                      }
                    />
                    Prominent Profile — show on member dashboard
                  </label>
                </div>

                {editBuffer.is_prominent && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Dashboard Headline</label>
                      <input
                        type="text"
                        className="form-input"
                        value={editBuffer.prominent_headline}
                        onChange={(e) =>
                          setEditBuffer({ ...editBuffer, prominent_headline: e.target.value })
                        }
                        placeholder="Short tagline shown on the dashboard"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Display Order</label>
                      <input
                        type="number"
                        className="form-input"
                        min={0}
                        value={editBuffer.prominent_order}
                        onChange={(e) =>
                          setEditBuffer({
                            ...editBuffer,
                            prominent_order: parseInt(e.target.value, 10) || 0,
                          })
                        }
                      />
                    </div>
                  </>
                )}

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => {
                      setEditMode(false)
                      setEditBuffer(null)
                    }}
                  >
                    Cancel
                  </button>
                  <button type="button" className="btn-green" onClick={() => void saveEdit()} disabled={actionPending}>
                    <i className="ri-check-line" /> {actionPending ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
