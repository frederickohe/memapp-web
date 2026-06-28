import { useCallback, useEffect, useMemo, useState } from 'react'
import { ScopeFilterBar } from '../../components/ScopeFilterBar'
import { vhsApi } from '../../core/services'
import type { ScopeFilterParams, VolunteerHoursSubmission, VhsStatus } from '../../core/models'
import { ApiError } from '../../core/utils/apiError'
import './vhs.css'

type StatusFilter = 'All' | VhsStatus

function formatSubmittedAt(value: string): string {
  const date = new Date(value)
  const datePart = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  const timePart = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
  return `${datePart} · ${timePart}`
}

function formatVolunteerDate(value: string): string {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function vhsStatusLabel(status: VhsStatus): string {
  if (status === 'approved') return 'Approved'
  if (status === 'rejected') return 'Rejected'
  return 'Pending'
}

function vhsBadgeClass(status: VhsStatus): string {
  if (status === 'approved') return 'badge-active'
  if (status === 'rejected') return 'badge-cancelled'
  return 'badge-warning'
}

export function VhsPage() {
  const [submissions, setSubmissions] = useState<VolunteerHoursSubmission[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)

  const [selectedSubmission, setSelectedSubmission] = useState<VolunteerHoursSubmission | null>(null)
  const [actionPending, setActionPending] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending')
  const [scopeFilter, setScopeFilter] = useState<ScopeFilterParams>({ scope: 'national' })

  const load = useCallback(
    async (targetPage = 1) => {
      setLoading(true)
      setError(null)

      try {
        const data = await vhsApi.list({
          page: targetPage,
          limit: 20,
          status: statusFilter === 'All' ? undefined : statusFilter,
          ...scopeFilter,
        })
        setSubmissions(data.submissions)
        setTotal(data.total)
        setPage(data.page)
        setPages(data.pages || 1)
      } catch (err: unknown) {
        setError(err instanceof ApiError ? err.message : 'Failed to load volunteer hours submissions.')
      } finally {
        setLoading(false)
      }
    },
    [statusFilter, scopeFilter],
  )

  useEffect(() => {
    void load()
  }, [load])

  const filteredSubmissions = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return submissions
    return submissions.filter(
      (s) =>
        s.member_name.toLowerCase().includes(term) ||
        s.id.toLowerCase().includes(term) ||
        (s.member_id ?? '').toLowerCase().includes(term) ||
        s.activity_name.toLowerCase().includes(term),
    )
  }, [submissions, searchTerm])

  const pendingCount = useMemo(
    () => submissions.filter((s) => s.status === 'pending').length,
    [submissions],
  )
  const approvedCount = useMemo(
    () => submissions.filter((s) => s.status === 'approved').length,
    [submissions],
  )
  const rejectedCount = useMemo(
    () => submissions.filter((s) => s.status === 'rejected').length,
    [submissions],
  )

  const goToPage = (target: number) => {
    if (target < 1 || target > pages) return
    void load(target)
  }

  const reviewSubmission = (submission: VolunteerHoursSubmission) => {
    setSelectedSubmission(submission)
    setActionError(null)
  }

  const closeReview = () => {
    setSelectedSubmission(null)
  }

  const approve = async () => {
    if (!selectedSubmission) return

    setActionPending(true)
    setActionError(null)

    try {
      const updated = await vhsApi.approve(selectedSubmission.id)
      setSubmissions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
      closeReview()
    } catch (err: unknown) {
      setActionError(err instanceof ApiError ? err.message : 'Approval failed. Please try again.')
    } finally {
      setActionPending(false)
    }
  }

  const openRejectModal = () => {
    setRejectReason('')
    setShowRejectModal(true)
  }

  const closeRejectModal = () => {
    setShowRejectModal(false)
  }

  const confirmReject = async () => {
    const reason = rejectReason.trim()
    if (!selectedSubmission || !reason) return

    setActionPending(true)
    try {
      const updated = await vhsApi.reject(selectedSubmission.id, { reason })
      setSubmissions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
      setShowRejectModal(false)
      closeReview()
    } catch (err: unknown) {
      setActionError(err instanceof ApiError ? err.message : 'Rejection failed. Please try again.')
    } finally {
      setActionPending(false)
    }
  }

  return (
    <>
      <ScopeFilterBar value={scopeFilter} onChange={setScopeFilter} />

      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon icon-orange">
            <i className="ri-time-line" />
          </div>
          <div>
            <p className="stat-val">{pendingCount}</p>
            <p className="stat-lbl">Pending (this page)</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-green">
            <i className="ri-checkbox-circle-fill" />
          </div>
          <div>
            <p className="stat-val">{approvedCount}</p>
            <p className="stat-lbl">Approved (this page)</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-red">
            <i className="ri-close-circle-fill" />
          </div>
          <div>
            <p className="stat-val">{rejectedCount}</p>
            <p className="stat-lbl">Rejected (this page)</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-blue">
            <i className="ri-team-line" />
          </div>
          <div>
            <p className="stat-val">{total}</p>
            <p className="stat-lbl">Total Matching</p>
          </div>
        </div>
      </section>

      <section className="card table-card">
        <div className="card-hdr">
          <h2 className="card-title">VHS Submissions</h2>
          <div className="filter-bar">
            <div className="search-box">
              <i className="ri-search-line" />
              <input
                type="text"
                placeholder="Search member, activity, or ID..."
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
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
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
                <th>Member</th>
                <th>Activity</th>
                <th>Hours</th>
                <th>Volunteer Date</th>
                <th>Submitted</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <i className="ri-loader-4-line spin" /> Loading submissions...
                    </div>
                  </td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <i className="ri-error-warning-line" /> {error}
                    </div>
                  </td>
                </tr>
              )}
              {!loading &&
                !error &&
                filteredSubmissions.map((s) => (
                  <tr key={s.id} className="clickable-row" onClick={() => reviewSubmission(s)}>
                    <td>
                      <div className="cust-left">
                        <img
                          src={s.member_avatar_url || `https://i.pravatar.cc/48?u=${s.user_id}`}
                          alt={s.member_name}
                          className="avatar-sm"
                        />
                        <div>
                          <p className="cell-name">{s.member_name}</p>
                          <p className="cell-sub">{s.member_id || s.id}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <p className="cell-name">{s.activity_name}</p>
                      <p className="cell-sub">{s.branch || s.member_branch || '—'}</p>
                    </td>
                    <td>
                      <span className="hours-tag">
                        <i className="ri-time-line" />
                        {s.hours}h
                      </span>
                    </td>
                    <td>{formatVolunteerDate(s.volunteer_date)}</td>
                    <td>{formatSubmittedAt(s.created_at)}</td>
                    <td>
                      <span className={`badge ${vhsBadgeClass(s.status)}`}>
                        {vhsStatusLabel(s.status)}
                      </span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          type="button"
                          title="Review submission"
                          onClick={(e) => {
                            e.stopPropagation()
                            reviewSubmission(s)
                          }}
                        >
                          <i className="ri-eye-line" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              {!loading && !error && filteredSubmissions.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <i className="ri-inbox-line" />
                      No submissions match your filters
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <span className="pagination-info">
            Showing page {page} of {pages} · {total} total
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

      {selectedSubmission && (
        <div className="drawer-overlay" onClick={closeReview}>
          <div className="drawer-box" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-hdr">
              <h3 className="modal-title">Volunteer Hours Review</h3>
              <button type="button" className="modal-close" onClick={closeReview}>
                <i className="ri-close-line" />
              </button>
            </div>

            {actionError && (
              <div className="auth-alert auth-alert-error" style={{ marginBottom: 16 }}>
                <i className="ri-error-warning-line" />
                <span>{actionError}</span>
              </div>
            )}

            <div className="profile-top">
              <img
                src={
                  selectedSubmission.member_avatar_url ||
                  `https://i.pravatar.cc/64?u=${selectedSubmission.user_id}`
                }
                alt={selectedSubmission.member_name}
                className="avatar-lg"
              />
              <div>
                <p className="profile-name">{selectedSubmission.member_name}</p>
                <p className="profile-id">
                  {selectedSubmission.member_id || selectedSubmission.id} ·{' '}
                  {formatSubmittedAt(selectedSubmission.created_at)}
                </p>
                <span
                  className={`badge ${vhsBadgeClass(selectedSubmission.status)}`}
                  style={{ marginTop: 6 }}
                >
                  {vhsStatusLabel(selectedSubmission.status)}
                </span>
              </div>
            </div>

            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Phone</span>
                <span className="info-value">{selectedSubmission.member_phone || '—'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Branch</span>
                <span className="info-value">
                  {selectedSubmission.branch || selectedSubmission.member_branch || '—'}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Hours Volunteered</span>
                <span className="info-value">{selectedSubmission.hours} hours</span>
              </div>
              <div className="info-item">
                <span className="info-label">Volunteer Date</span>
                <span className="info-value">{formatVolunteerDate(selectedSubmission.volunteer_date)}</span>
              </div>
              <div className="info-item" style={{ gridColumn: '1 / -1' }}>
                <span className="info-label">Activity</span>
                <span className="info-value">{selectedSubmission.activity_name}</span>
              </div>
              {selectedSubmission.activity_description && (
                <div className="info-item" style={{ gridColumn: '1 / -1' }}>
                  <span className="info-label">Description</span>
                  <span className="info-value">{selectedSubmission.activity_description}</span>
                </div>
              )}
            </div>

            {selectedSubmission.status === 'pending' && selectedSubmission.points_to_award != null && (
              <div className="points-preview">
                <i className="ri-medal-line" />
                Approving will award {selectedSubmission.points_to_award} points (10 pts/hour)
              </div>
            )}

            {selectedSubmission.status === 'approved' && selectedSubmission.points_awarded != null && (
              <div className="points-preview">
                <i className="ri-medal-line" />
                {selectedSubmission.points_awarded} points awarded
              </div>
            )}

            <h4 className="section-sub-title">Supporting Document</h4>
            <div className="doc-grid">
              {selectedSubmission.proof_document_url ? (
                <div className="doc-item">
                  <img src={selectedSubmission.proof_document_url} alt="Proof of volunteer hours" />
                  <span>Proof of volunteer hours</span>
                </div>
              ) : (
                <div className="doc-item doc-missing">
                  <i className="ri-file-warning-line" />
                  <span>No supporting document attached</span>
                </div>
              )}
            </div>

            {selectedSubmission.status === 'rejected' && selectedSubmission.rejection_reason && (
              <div className="rejection-note">
                <i className="ri-close-circle-fill" />
                <span>{selectedSubmission.rejection_reason}</span>
              </div>
            )}

            {selectedSubmission.status === 'pending' && (
              <div className="drawer-actions">
                <button
                  type="button"
                  className="btn-danger drawer-btn"
                  disabled={actionPending}
                  onClick={openRejectModal}
                >
                  <i className="ri-close-line" /> Reject
                </button>
                <button
                  type="button"
                  className="btn-green drawer-btn"
                  disabled={actionPending}
                  onClick={() => void approve()}
                >
                  <i className="ri-check-line" /> Approve &amp; Award Points
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showRejectModal && (
        <div className="modal-overlay" onClick={closeRejectModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-hdr">
              <h3 className="modal-title">Reject Submission</h3>
              <button type="button" className="modal-close" onClick={closeRejectModal}>
                <i className="ri-close-line" />
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Reason for Rejection (required)</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="e.g. Hours cannot be verified without supervisor signature"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-outline" onClick={closeRejectModal}>
                Cancel
              </button>
              <button
                type="button"
                className="btn-danger"
                disabled={!rejectReason.trim() || actionPending}
                onClick={() => void confirmReject()}
              >
                <i className="ri-close-line" /> Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
