import { useCallback, useEffect, useMemo, useState } from 'react'
import type { AdminUserListItem, Permission, Role } from '../../core/models'
import { adminUserApi, roleApi } from '../../core/services'
import { YMCA_BRANCHES } from '../../core/ymcaBranches'
import { ApiError } from '../../core/utils/apiError'
import { formatTimeAgo } from '../../core/utils/formatTimeAgo'
import '../../styles/admin-global.css'
import './user-roles.css'

const ROLE_COLORS = ['#8b5cf6', '#3b82f6', '#ed1c24', '#f97316', '#06b6d4', '#9ca3af', '#ec4899', '#eab308']

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  national_admin: 'National Admin',
  regional_admin: 'Regional Admin',
  branch_admin: 'Branch Admin',
}

function roleLabel(name: string): string {
  return ROLE_LABELS[name] ?? titleCase(name.replace(/_/g, ' '))
}

function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$'
  let out = ''
  for (let i = 0; i < 12; i++) out += chars[Math.floor(Math.random() * chars.length)]
  return out
}

function titleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase())
}

export function UserRolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [adminUsers, setAdminUsers] = useState<AdminUserListItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [draftPermissionIds, setDraftPermissionIds] = useState<Set<string>>(new Set())
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false)
  const [roleActionPending, setRoleActionPending] = useState(false)
  const [roleActionError, setRoleActionError] = useState<string | null>(null)
  const [newRole, setNewRole] = useState({ name: '', description: '' })

  const [showCreateUserModal, setShowCreateUserModal] = useState(false)
  const [userActionPending, setUserActionPending] = useState(false)
  const [userActionError, setUserActionError] = useState<string | null>(null)
  const [createdUserCredentials, setCreatedUserCredentials] = useState<{ email: string; password: string } | null>(
    null,
  )
  const [newAdminUser, setNewAdminUser] = useState({
    full_name: '',
    email: '',
    phone: '',
    role_id: '',
    assigned_region: '',
    assigned_branch: '',
  })

  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('All')

  const loadAll = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const rolesData = await roleApi.listRoles(true)
      setRoles(rolesData)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load roles.')
    }

    try {
      const permissionsData = await roleApi.listPermissions()
      setPermissions(permissionsData)
    } catch {
      /* Permission catalogue failing to load shouldn't block the rest of the page. */
    }

    try {
      const data = await adminUserApi.list({ limit: 100 })
      setAdminUsers(data.users)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load admin users.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadAll()
  }, [loadAll])

  const roleColor = (index: number) => ROLE_COLORS[index % ROLE_COLORS.length]

  const roleIndex = (roleId: string) => roles.findIndex((r) => r.id === roleId)

  const filteredUsers = useMemo(() => {
    const term = searchTerm.toLowerCase()
    return adminUsers.filter((u) => {
      const matchesSearch =
        u.full_name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)
      const matchesRole = roleFilter === 'All' || u.role.id === roleFilter
      return matchesSearch && matchesRole
    })
  }, [adminUsers, searchTerm, roleFilter])

  const totalAdminUsers = adminUsers.length
  const activeRoleCount = roles.filter((r) => r.is_active).length
  const suspendedUserCount = adminUsers.filter((u) => !u.is_active).length

  const permissionGroups = useMemo(() => {
    const groups = new Map<string, Permission[]>()
    for (const p of permissions) {
      const list = groups.get(p.group) ?? []
      list.push(p)
      groups.set(p.group, list)
    }
    return Array.from(groups.entries()).map(([group, items]) => ({ group, items }))
  }, [permissions])

  const isSuperAdminRole = (role: Role | null) => (role?.name ?? '').toLowerCase() === 'super_admin'

  const isPermissionChecked = (permissionId: string) => draftPermissionIds.has(permissionId)

  const togglePermission = (permissionId: string) => {
    setDraftPermissionIds((prev) => {
      const next = new Set(prev)
      if (next.has(permissionId)) next.delete(permissionId)
      else next.add(permissionId)
      return next
    })
  }

  const viewRole = (role: Role) => {
    setSelectedRole(role)
    setDraftPermissionIds(new Set((role.permissions ?? []).map((p) => p.id)))
    setRoleActionError(null)
    setShowRoleModal(true)
  }

  const closeRoleModal = () => {
    setShowRoleModal(false)
    setSelectedRole(null)
  }

  const saveRolePermissions = async () => {
    if (!selectedRole) return

    setRoleActionPending(true)
    setRoleActionError(null)

    try {
      const updated = await roleApi.setRolePermissions(selectedRole.id, {
        permission_ids: Array.from(draftPermissionIds),
      })
      setRoles((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
      closeRoleModal()
    } catch (err) {
      setRoleActionError(
        err instanceof ApiError ? err.message : 'Could not save permissions. Please try again.',
      )
    } finally {
      setRoleActionPending(false)
    }
  }

  const openCreateRoleModal = () => {
    setNewRole({ name: '', description: '' })
    setDraftPermissionIds(new Set())
    setRoleActionError(null)
    setShowCreateRoleModal(true)
  }

  const closeCreateRoleModal = () => {
    setShowCreateRoleModal(false)
  }

  const createRole = async () => {
    if (!newRole.name.trim()) return

    setRoleActionPending(true)
    setRoleActionError(null)

    try {
      await roleApi.createRole({
        name: newRole.name.trim(),
        description: newRole.description.trim(),
        permission_ids: Array.from(draftPermissionIds),
      })
      closeCreateRoleModal()
      void loadAll()
    } catch (err) {
      setRoleActionError(err instanceof ApiError ? err.message : 'Could not create role. Please try again.')
    } finally {
      setRoleActionPending(false)
    }
  }

  const openCreateUserModal = () => {
    setNewAdminUser({
      full_name: '',
      email: '',
      phone: '',
      role_id: roles[0]?.id ?? '',
      assigned_region: '',
      assigned_branch: '',
    })
    setUserActionError(null)
    setCreatedUserCredentials(null)
    setShowCreateUserModal(true)
  }

  const closeCreateUserModal = () => {
    setShowCreateUserModal(false)
    setCreatedUserCredentials(null)
  }

  const createAdminUser = async () => {
    const { full_name, email, phone, role_id, assigned_region, assigned_branch } = newAdminUser
    if (!full_name.trim() || !email.trim() || !phone.trim() || !role_id) return

    const selectedRole = roles.find((r) => r.id === role_id)
    if (selectedRole?.name === 'regional_admin' && !assigned_region.trim()) {
      setUserActionError('Regional admins must have an assigned region.')
      return
    }
    if (selectedRole?.name === 'branch_admin' && !assigned_branch.trim()) {
      setUserActionError('Branch admins must have an assigned branch.')
      return
    }

    const tempPassword = generateTempPassword()

    setUserActionPending(true)
    setUserActionError(null)

    try {
      await adminUserApi.create({
        full_name: full_name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password: tempPassword,
        role_id,
        reset_required: true,
        assigned_region: assigned_region.trim() || undefined,
        assigned_branch: assigned_branch.trim() || undefined,
      })
      setCreatedUserCredentials({ email: email.trim(), password: tempPassword })
      void loadAll()
    } catch (err) {
      setUserActionError(
        err instanceof ApiError ? err.message : 'Could not create admin user. Please try again.',
      )
    } finally {
      setUserActionPending(false)
    }
  }

  const toggleUserStatus = async (u: AdminUserListItem) => {
    if (!u.is_active) return

    try {
      await adminUserApi.deactivate(u.id)
      setAdminUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, is_active: false } : x)))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not deactivate user.')
    }
  }

  const renderPermissionGroups = (disableSuperAdmin?: boolean) =>
    permissionGroups.map((group) => (
      <div className="perm-group" key={group.group}>
        <p className="perm-group-title">{titleCase(group.group)}</p>
        <div className="perm-list">
          {group.items.map((p) => (
            <label className="perm-row" key={p.id}>
              <span>{p.description || p.name}</span>
              <input
                type="checkbox"
                checked={isPermissionChecked(p.id)}
                onChange={() => togglePermission(p.id)}
                disabled={disableSuperAdmin && isSuperAdminRole(selectedRole)}
              />
            </label>
          ))}
        </div>
      </div>
    ))

  return (
    <>
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon icon-blue">
            <i className="ri-shield-user-fill" />
          </div>
          <div>
            <p className="stat-val">{totalAdminUsers}</p>
            <p className="stat-lbl">Total Admin Users</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-purple">
            <i className="ri-government-fill" />
          </div>
          <div>
            <p className="stat-val">{activeRoleCount}</p>
            <p className="stat-lbl">Active Roles</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-orange">
            <i className="ri-vip-crown-fill" />
          </div>
          <div>
            <p className="stat-val">{roles.length}</p>
            <p className="stat-lbl">Total Roles</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-red">
            <i className="ri-forbid-line" />
          </div>
          <div>
            <p className="stat-val">{suspendedUserCount}</p>
            <p className="stat-lbl">Inactive Users</p>
          </div>
        </div>
      </section>

      {error && (
        <div className="auth-alert auth-alert-error" style={{ marginBottom: 18 }}>
          <i className="ri-error-warning-line" />
          <span>{error}</span>
        </div>
      )}

      <section className="role-section">
        <div className="section-hdr">
          <h2 className="section-title">Roles & Permissions</h2>
          <button type="button" className="btn-dark" onClick={openCreateRoleModal}>
            <i className="ri-add-line" /> Create Role
          </button>
        </div>

        {loading ? (
          <div className="empty-state">
            <i className="ri-loader-4-line spin" /> Loading roles...
          </div>
        ) : (
          <div className="role-grid">
            {roles.map((role, i) => (
              <div className="role-tile" key={role.id} onClick={() => viewRole(role)} role="button" tabIndex={0}>
                <div className="role-tile-top">
                  <span className="role-dot" style={{ background: roleColor(i) }} />
                  <span className="role-access-tag">{role.is_system ? 'System role' : 'Custom role'}</span>
                </div>
                <h3 className="role-name">{roleLabel(role.name)}</h3>
                <p className="role-desc">{role.description || 'No description provided.'}</p>
                <div className="role-footer">
                  <span>
                    <i className="ri-key-2-line" /> {(role.permissions ?? []).length} permissions
                  </span>
                  <span className="role-edit-link">
                    <i className="ri-edit-line" /> Edit Permissions
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card table-card">
        <div className="card-hdr">
          <h2 className="card-title">Admin Users</h2>
          <div className="filter-bar">
            <div className="search-box">
              <i className="ri-search-line" />
              <input
                type="text"
                placeholder="Search name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select className="filter-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="All">All Roles</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {roleLabel(r.name)}
                </option>
              ))}
            </select>
            <button type="button" className="btn-dark" onClick={openCreateUserModal}>
              <i className="ri-user-add-line" /> Create Admin
            </button>
          </div>
        </div>

        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Admin User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Last Active</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => {
                const idx = roleIndex(u.role.id)
                const color = roleColor(idx >= 0 ? idx : 0)
                return (
                  <tr key={u.id}>
                    <td>
                      <div className="cust-left">
                        <img
                          src={`https://i.pravatar.cc/40?u=${u.id}`}
                          alt={u.full_name}
                          className="avatar-sm"
                        />
                        <span className="cell-name">{u.full_name}</span>
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <span className="role-pill" style={{ background: `${color}1A`, color }}>
                        {roleLabel(u.role.name)}
                      </span>
                    </td>
                    <td>{formatTimeAgo(u.last_login_at)}</td>
                    <td>
                      <span className={`badge ${u.is_active ? 'badge-active' : 'badge-inactive'}`}>
                        {u.is_active ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td>
                      <div className="row-actions">
                        {u.is_active && (
                          <button type="button" title="Deactivate" onClick={() => void toggleUserStatus(u)}>
                            <i className="ri-pause-circle-line" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filteredUsers.length === 0 && !loading && (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <i className="ri-inbox-line" /> No admin users match your filters
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {showRoleModal && (
        <div className="modal-overlay" onClick={closeRoleModal}>
          <div className="modal-box modal-wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-hdr">
              <div>
                <h3 className="modal-title">{selectedRole ? roleLabel(selectedRole.name) : ''}</h3>
                <p className="modal-sub" style={{ margin: '2px 0 0' }}>
                  {selectedRole?.is_system ? 'System role' : 'Custom role'}
                </p>
              </div>
              <button type="button" className="modal-close" onClick={closeRoleModal}>
                <i className="ri-close-line" />
              </button>
            </div>

            <p className="role-modal-desc">{selectedRole?.description}</p>

            {roleActionError && (
              <div className="auth-alert auth-alert-error" style={{ marginBottom: 14 }}>
                <i className="ri-error-warning-line" />
                <span>{roleActionError}</span>
              </div>
            )}

            <h4 className="section-sub-title">Permissions</h4>
            {renderPermissionGroups(true)}
            {isSuperAdminRole(selectedRole) && (
              <p className="perm-note">
                <i className="ri-information-line" /> Super Admin always has full access and cannot be restricted.
              </p>
            )}

            <div className="modal-footer">
              <button type="button" className="btn-outline" onClick={closeRoleModal}>
                Cancel
              </button>
              <button
                type="button"
                className="btn-green"
                disabled={isSuperAdminRole(selectedRole) || roleActionPending}
                onClick={() => void saveRolePermissions()}
              >
                <i className="ri-check-line" /> Save Permissions
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateRoleModal && (
        <div className="modal-overlay" onClick={closeCreateRoleModal}>
          <div className="modal-box modal-wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-hdr">
              <h3 className="modal-title">Create New Role</h3>
              <button type="button" className="modal-close" onClick={closeCreateRoleModal}>
                <i className="ri-close-line" />
              </button>
            </div>

            {roleActionError && (
              <div className="auth-alert auth-alert-error" style={{ marginBottom: 14 }}>
                <i className="ri-error-warning-line" />
                <span>{roleActionError}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Role Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. operations_manager"
                value={newRole.name}
                onChange={(e) => setNewRole((r) => ({ ...r, name: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <input
                type="text"
                className="form-input"
                placeholder="What this role can do"
                value={newRole.description}
                onChange={(e) => setNewRole((r) => ({ ...r, description: e.target.value }))}
              />
            </div>

            <h4 className="section-sub-title">Permissions</h4>
            {renderPermissionGroups()}

            <div className="modal-footer">
              <button type="button" className="btn-outline" onClick={closeCreateRoleModal}>
                Cancel
              </button>
              <button
                type="button"
                className="btn-green"
                disabled={!newRole.name.trim() || roleActionPending}
                onClick={() => void createRole()}
              >
                <i className="ri-check-line" /> Create Role
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateUserModal && (
        <div className="modal-overlay" onClick={closeCreateUserModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-hdr">
              <h3 className="modal-title">Create Admin User</h3>
              <button type="button" className="modal-close" onClick={closeCreateUserModal}>
                <i className="ri-close-line" />
              </button>
            </div>

            {!createdUserCredentials ? (
              <>
                {userActionError && (
                  <div className="auth-alert auth-alert-error" style={{ marginBottom: 14 }}>
                    <i className="ri-error-warning-line" />
                    <span>{userActionError}</span>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Akosua Frimpong"
                    value={newAdminUser.full_name}
                    onChange={(e) => setNewAdminUser((u) => ({ ...u, full_name: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="name@voltgo.com"
                    value={newAdminUser.email}
                    onChange={(e) => setNewAdminUser((u) => ({ ...u, email: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="0551234567"
                    value={newAdminUser.phone}
                    onChange={(e) => setNewAdminUser((u) => ({ ...u, phone: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Assign Role</label>
                  <select
                    className="form-select"
                    value={newAdminUser.role_id}
                    onChange={(e) => setNewAdminUser((u) => ({ ...u, role_id: e.target.value }))}
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {roleLabel(r.name)}
                      </option>
                    ))}
                  </select>
                </div>
                {roles.find((r) => r.id === newAdminUser.role_id)?.name === 'regional_admin' && (
                  <div className="form-group">
                    <label className="form-label">Assigned Region</label>
                    <select
                      className="form-select"
                      value={newAdminUser.assigned_region}
                      onChange={(e) =>
                        setNewAdminUser((u) => ({ ...u, assigned_region: e.target.value }))
                      }
                    >
                      <option value="">Select region</option>
                      {[...new Set(YMCA_BRANCHES.map((b) => b.region))].map((region) => (
                        <option key={region} value={region}>
                          {region}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {roles.find((r) => r.id === newAdminUser.role_id)?.name === 'branch_admin' && (
                  <div className="form-group">
                    <label className="form-label">Assigned Branch</label>
                    <select
                      className="form-select"
                      value={newAdminUser.assigned_branch}
                      onChange={(e) =>
                        setNewAdminUser((u) => ({ ...u, assigned_branch: e.target.value }))
                      }
                    >
                      <option value="">Select branch</option>
                      {YMCA_BRANCHES.map((branch) => (
                        <option key={branch.id} value={branch.name}>
                          {branch.name} ({branch.region})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <p className="perm-note">
                  <i className="ri-information-line" /> A temporary password will be generated automatically. The new
                  admin will be required to change it on first login.
                </p>

                <div className="modal-footer">
                  <button type="button" className="btn-outline" onClick={closeCreateUserModal}>
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn-green"
                    disabled={
                      !newAdminUser.full_name.trim() ||
                      !newAdminUser.email.trim() ||
                      !newAdminUser.phone.trim() ||
                      !newAdminUser.role_id ||
                      userActionPending
                    }
                    onClick={() => void createAdminUser()}
                  >
                    <i className="ri-user-add-line" /> Create Admin User
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="success-box">
                  <i className="ri-checkbox-circle-fill" />
                  <h2>Admin user created</h2>
                  <p>
                    Share these temporary credentials with {createdUserCredentials.email} securely. They&apos;ll be
                    asked to set a new password on first login.
                  </p>
                </div>

                <div className="credential-box">
                  <div className="credential-row">
                    <span className="info-label">Email</span>
                    <span className="info-value">{createdUserCredentials.email}</span>
                  </div>
                  <div className="credential-row">
                    <span className="info-label">Temporary Password</span>
                    <span className="info-value credential-pass">{createdUserCredentials.password}</span>
                  </div>
                </div>

                <p className="perm-note">
                  <i className="ri-alarm-warning-line" /> This password is shown only once and cannot be retrieved
                  later — copy it now.
                </p>

                <div className="modal-footer">
                  <button type="button" className="btn-dark" onClick={closeCreateUserModal}>
                    Done
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
