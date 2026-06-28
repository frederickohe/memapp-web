import { useCallback, useEffect, useMemo, useState } from 'react'
import { riderApi } from '../../core/services'
import type { AdminRider, KycStatus } from '../../core/models'
import { ApiError } from '../../core/utils/apiError'
import './kyc.css'

type StatusFilter = 'All' | KycStatus

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

function kycStatusLabel(status: KycStatus): string {
  if (status === 'approved') return 'Approved'
  if (status === 'rejected') return 'Rejected'
  return 'Pending'
}

function kycBadgeClass(status: KycStatus): string {
  if (status === 'approved') return 'badge-active'
  if (status === 'rejected') return 'badge-cancelled'
  return 'badge-warning'
}

export function KycPage() {
  const [submissions, setSubmissions] = useState<AdminRider[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)

  const [selectedSubmission, setSelectedSubmission] = useState<AdminRider | null>(null)
  const [actionPending, setActionPending] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending')

  const load = useCallback(
    async (targetPage = 1) => {
      setLoading(true)
      setError(null)

      try {
        const data = await riderApi.list({
          page: targetPage,
          limit: 20,
          kyc_status: statusFilter === 'All' ? undefined : statusFilter,
        })
        setSubmissions(data.riders)
        setTotal(data.total)
        setPage(data.page)
        setPages(data.pages || 1)
      } catch (err: unknown) {
        setError(err instanceof ApiError ? err.message : 'Failed to load KYC submissions.')
      } finally {
        setLoading(false)
      }
    },
    [statusFilter],
  )

  useEffect(() => {
    void load()
  }, [load])

  const filteredSubmissions = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return submissions
    return submissions.filter(
      (s) => s.full_name.toLowerCase().includes(term) || s.id.toLowerCase().includes(term),
    )
  }, [submissions, searchTerm])

  const pendingCount = useMemo(
    () => submissions.filter((s) => s.kyc_status === 'pending').length,
    [submissions],
  )
  const approvedCount = useMemo(
    () => submissions.filter((s) => s.kyc_status === 'approved').length,
    [submissions],
  )
  const rejectedCount = useMemo(
    () => submissions.filter((s) => s.kyc_status === 'rejected').length,
    [submissions],
  )

  const goToPage = (target: number) => {
    if (target < 1 || target > pages) return
    void load(target)
  }

  const reviewSubmission = (submission: AdminRider) => {
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
      const updated = await riderApi.approve(selectedSubmission.id)
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
      const updated = await riderApi.reject(selectedSubmission.id, { reason })
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
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon icon-orange">
            <i className="ri-file-shield-2-line" />
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
          <h2 className="card-title">KYC Submissions</h2>
          <div className="filter-bar">
            <div className="search-box">
              <i className="ri-search-line" />
              <input
                type="text"
                placeholder="Search applicant or ID..."
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
                <th>Applicant</th>
                <th>Vehicle Type</th>
                <th>Ghana Card No.</th>
                <th>Submitted</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <i className="ri-loader-4-line spin" /> Loading submissions...
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
                filteredSubmissions.map((s) => (
                  <tr key={s.id} className="clickable-row" onClick={() => reviewSubmission(s)}>
                    <td>
                      <div className="cust-left">
                        <img
                          src={s.avatar_url || `https://i.pravatar.cc/48?u=${s.id}`}
                          alt={s.full_name}
                          className="avatar-sm"
                        />
                        <div>
                          <p className="cell-name">{s.full_name}</p>
                          <p className="cell-sub">{s.id}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="vehicle-tag">
                        <i className={s.vehicle_type === 'bicycle' ? 'ri-bike-line' : 'ri-e-bike-2-line'} />
                        {s.vehicle_type === 'bicycle' ? 'Bicycle' : 'E-Motorcycle'}
                      </span>
                    </td>
                    <td>{s.ghana_card_no || '—'}</td>
                    <td>{formatSubmittedAt(s.created_at)}</td>
                    <td>
                      <span className={`badge ${kycBadgeClass(s.kyc_status)}`}>
                        {kycStatusLabel(s.kyc_status)}
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
                  <td colSpan={6}>
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
              <h3 className="modal-title">KYC Review</h3>
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
                src={selectedSubmission.avatar_url || `https://i.pravatar.cc/64?u=${selectedSubmission.id}`}
                alt={selectedSubmission.full_name}
                className="avatar-lg"
              />
              <div>
                <p className="profile-name">{selectedSubmission.full_name}</p>
                <p className="profile-id">
                  {selectedSubmission.id} · {formatSubmittedAt(selectedSubmission.created_at)}
                </p>
                <span
                  className={`badge ${kycBadgeClass(selectedSubmission.kyc_status)}`}
                  style={{ marginTop: 6 }}
                >
                  {kycStatusLabel(selectedSubmission.kyc_status)}
                </span>
              </div>
            </div>

            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Phone</span>
                <span className="info-value">{selectedSubmission.phone}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Vehicle Type</span>
                <span className="info-value">
                  {selectedSubmission.vehicle_type === 'bicycle' ? 'Bicycle' : 'E-Motorcycle'}
                </span>
              </div>
              <div className="info-item" style={{ gridColumn: '1 / -1' }}>
                <span className="info-label">Ghana Card No.</span>
                <span className="info-value">{selectedSubmission.ghana_card_no || '—'}</span>
              </div>
            </div>

            <h4 className="section-sub-title">Submitted Documents</h4>
            <div className="doc-grid">
              {selectedSubmission.ghana_card_front_url && (
                <div className="doc-item">
                  <img src={selectedSubmission.ghana_card_front_url} alt="Ghana Card Front" />
                  <span>Ghana Card (Front)</span>
                </div>
              )}
              {selectedSubmission.ghana_card_back_url && (
                <div className="doc-item">
                  <img src={selectedSubmission.ghana_card_back_url} alt="Ghana Card Back" />
                  <span>Ghana Card (Back)</span>
                </div>
              )}
              {selectedSubmission.drivers_license_url && (
                <div className="doc-item">
                  <img src={selectedSubmission.drivers_license_url} alt="Driver's License" />
                  <span>Driver&apos;s License</span>
                </div>
              )}
              {!selectedSubmission.ghana_card_front_url && !selectedSubmission.ghana_card_back_url && (
                <div className="doc-item doc-missing">
                  <i className="ri-file-warning-line" />
                  <span>Document images not returned by this endpoint</span>
                </div>
              )}
            </div>

            {selectedSubmission.kyc_status === 'rejected' && selectedSubmission.kyc_rejection_reason && (
              <div className="rejection-note">
                <i className="ri-close-circle-fill" />
                <span>{selectedSubmission.kyc_rejection_reason}</span>
              </div>
            )}

            {selectedSubmission.kyc_status === 'pending' && (
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
                  <i className="ri-check-line" /> Approve
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
                placeholder="e.g. Ghana Card image unreadable"
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
