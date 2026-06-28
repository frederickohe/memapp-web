import { useCallback, useEffect, useMemo, useState } from 'react'
import './finance.css'
import '../../styles/shared.css'
import { paymentApi } from '../../core/services'
import type { AdminPayment, PaymentOverview, PaymentStatus, PaymentType } from '../../core/models'
import { ApiError } from '../../core/utils/apiError'
import { formatGhs } from '../../core/utils/formatGhs'

const TYPE_LABELS: Record<PaymentType, string> = {
  monthly_dues: 'Monthly Dues',
  annual_affiliation: 'Annual Affiliation',
  refund: 'Refund',
}

const METHOD_LABELS: Record<string, string> = {
  card: 'Card',
  momo_link: 'MoMo (Web)',
  momo_ussd: 'MoMo (USSD)',
  mtn_momo: 'MTN MoMo',
  vodafone: 'Vodafone Cash',
  airteltigo: 'AirtelTigo',
}

function formatPaymentDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function titleCaseStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

export function FinancePage() {
  const [payments, setPayments] = useState<AdminPayment[]>([])
  const [overview, setOverview] = useState<PaymentOverview | null>(null)
  const [loading, setLoading] = useState(false)
  const [overviewLoading, setOverviewLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)

  const [showActivateModal, setShowActivateModal] = useState(false)
  const [activateReference, setActivateReference] = useState('')
  const [activatePending, setActivatePending] = useState(false)
  const [activateError, setActivateError] = useState<string | null>(null)
  const [activateSuccess, setActivateSuccess] = useState(false)

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | PaymentStatus>('All')
  const [typeFilter, setTypeFilter] = useState<'All' | PaymentType>('All')

  const loadOverview = useCallback(async () => {
    setOverviewLoading(true)
    try {
      const data = await paymentApi.overview()
      setOverview(data)
    } catch {
      setOverview(null)
    } finally {
      setOverviewLoading(false)
    }
  }, [])

  const load = useCallback(async (targetPage = 1) => {
    setLoading(true)
    setError(null)

    const txnStatus = ['success', 'pending', 'failed', 'refunded'].includes(statusFilter)
      ? (statusFilter as PaymentStatus)
      : undefined

    try {
      const data = await paymentApi.list({
        page: targetPage,
        limit: 20,
        status: txnStatus,
        type: typeFilter === 'All' ? undefined : typeFilter,
      })
      setPayments(data.payments)
      setTotal(data.total)
      setPage(data.page)
      setPages(data.pages || 1)
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : 'Failed to load payments.')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, typeFilter])

  useEffect(() => {
    loadOverview()
    load()
  }, [loadOverview, load])

  const filteredTransactions = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return payments
    return payments.filter(
      (t) =>
        t.user.full_name.toLowerCase().includes(term) ||
        t.reference.toLowerCase().includes(term),
    )
  }, [payments, searchTerm])

  const weeklyRevenue = overview?.weekly_revenue ?? []
  const maxRevenue = Math.max(...weeklyRevenue.map((d) => d.value), 1)
  const paymentMethods = overview?.payment_methods ?? []

  const openActivateModal = () => {
    setActivateReference('')
    setActivateError(null)
    setActivateSuccess(false)
    setShowActivateModal(true)
  }

  const closeActivateModal = () => {
    setShowActivateModal(false)
  }

  const confirmActivate = async () => {
    const reference = activateReference.trim()
    if (!reference) return

    setActivatePending(true)
    setActivateError(null)

    try {
      await paymentApi.activate({ reference })
      setActivatePending(false)
      setActivateSuccess(true)
      load(page)
      loadOverview()
    } catch (err: unknown) {
      setActivatePending(false)
      setActivateError(
        err instanceof ApiError
          ? err.message
          : 'Could not activate this payment. Check the reference and try again.',
      )
    }
  }

  const goToPage = (target: number) => {
    if (target < 1 || target > pages) return
    load(target)
  }

  return (
    <>
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon icon-green">
            <i className="ri-money-dollar-circle-fill" />
          </div>
          <div>
            <p className="stat-val">{overview?.total_payments ?? total}</p>
            <p className="stat-lbl">Total Payments</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-blue">
            <i className="ri-checkbox-circle-fill" />
          </div>
          <div>
            <p className="stat-val">{overview?.successful_count ?? '—'}</p>
            <p className="stat-lbl">Successful</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-orange">
            <i className="ri-calendar-check-line" />
          </div>
          <div>
            <p className="stat-val">{formatGhs(overview?.dues_collected_ghs ?? 0)}</p>
            <p className="stat-lbl">Dues Collected</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-purple">
            <i className="ri-building-line" />
          </div>
          <div>
            <p className="stat-val">{formatGhs(overview?.affiliation_collected_ghs ?? 0)}</p>
            <p className="stat-lbl">Affiliation Collected</p>
          </div>
        </div>
      </section>

      <section className="mid-row">
        <div className="card trend-card">
          <div className="card-hdr">
            <h2 className="card-title">Weekly Revenue</h2>
            <span className="more-dots">···</span>
          </div>
          {overviewLoading && (
            <div className="empty-state" style={{ padding: '24px' }}>
              <i className="ri-loader-4-line spin" /> Loading...
            </div>
          )}
          {!overviewLoading && (
            <div className="bar-chart">
              {weeklyRevenue.map((d) => (
                <div key={d.day} className="bar-col">
                  <div className="bar-track">
                    <div className="bar-fill" style={{ height: `${(d.value / maxRevenue) * 100}%` }}>
                      <span className="bar-value">{formatGhs(d.value)}</span>
                    </div>
                  </div>
                  <span className="bar-label">{d.day}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="right-col">
          <div className="card">
            <div className="card-hdr">
              <h2 className="card-title">Payment Methods</h2>
              <span className="more-dots">···</span>
            </div>
            {paymentMethods.length === 0 && !overviewLoading && (
              <div className="empty-state" style={{ padding: '24px' }}>
                <i className="ri-inbox-line" /> No payment data yet
              </div>
            )}
            <div className="pm-list">
              {paymentMethods.map((pm) => (
                <div key={pm.method} className="pm-row">
                  <div className="pm-top">
                    <span className="pm-name">{pm.method}</span>
                    <span className="pm-percent">{pm.percent}%</span>
                  </div>
                  <div className="pm-track">
                    <div className="pm-fill" style={{ width: `${pm.percent}%`, background: pm.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="card table-card">
        <div className="card-hdr">
          <h2 className="card-title">Membership Payments</h2>
          <div className="filter-bar">
            <div className="search-box">
              <i className="ri-search-line" />
              <input
                type="text"
                placeholder="Search by name or reference..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            >
              <option value="All">All Status</option>
              <option value="success">Success</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
            <select
              className="filter-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
            >
              <option value="All">All Types</option>
              <option value="monthly_dues">Monthly Dues</option>
              <option value="annual_affiliation">Annual Affiliation</option>
              <option value="refund">Refund</option>
            </select>
            <button type="button" className="btn-dark" onClick={openActivateModal}>
              <i className="ri-flashlight-line" /> Activate Payment
            </button>
          </div>
        </div>

        {error && (
          <div className="auth-alert auth-alert-error" style={{ margin: '0 20px 16px' }}>
            <i className="ri-error-warning-line" />
            <span>{error}</span>
          </div>
        )}

        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Member</th>
                <th>Type</th>
                <th>Method</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <i className="ri-loader-4-line spin" /> Loading payments...
                    </div>
                  </td>
                </tr>
              )}
              {!loading && (
                <>
                  {filteredTransactions.map((t) => (
                    <tr key={t.id}>
                      <td className="td-track">{t.reference}</td>
                      <td>{t.user.full_name}</td>
                      <td>{TYPE_LABELS[t.type] ?? t.type}</td>
                      <td>{METHOD_LABELS[t.method ?? ''] ?? t.method ?? '—'}</td>
                      <td style={{ fontWeight: 600 }}>
                        {t.type === 'refund' ? '-' : ''}
                        {formatGhs(t.amount < 0 ? -t.amount : t.amount, true)}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            t.status === 'success'
                              ? 'badge-completed'
                              : t.status === 'pending'
                                ? 'badge-pending'
                                : t.status === 'failed'
                                  ? 'badge-cancelled'
                                  : 'badge-info'
                          }`}
                        >
                          {titleCaseStatus(t.status)}
                        </span>
                      </td>
                      <td>{formatPaymentDate(t.created_at)}</td>
                    </tr>
                  ))}
                  {filteredTransactions.length === 0 && (
                    <tr>
                      <td colSpan={7}>
                        <div className="empty-state">
                          <i className="ri-inbox-line" />
                          No transactions match your filters
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <span className="pagination-info">
            Showing page {page} of {pages} · {total} payments total
            {overview ? ` · ${formatGhs(overview.total_revenue_ghs)} revenue` : ''}
          </span>
          <div className="pagination-controls">
            <button type="button" className="page-btn" disabled={page <= 1} onClick={() => goToPage(page - 1)}>
              <i className="ri-arrow-left-s-line" />
            </button>
            <button type="button" className="page-btn active">
              {page}
            </button>
            <button type="button" className="page-btn" disabled={page >= pages} onClick={() => goToPage(page + 1)}>
              <i className="ri-arrow-right-s-line" />
            </button>
          </div>
        </div>
      </section>

      {showActivateModal && (
        <div className="modal-overlay" onClick={closeActivateModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-hdr">
              <h3 className="modal-title">Manually Activate Payment</h3>
              <button type="button" className="modal-close" onClick={closeActivateModal}>
                <i className="ri-close-line" />
              </button>
            </div>

            <p className="modal-sub">
              Use this when a member was charged but their dues or affiliation status was not updated due to a missed webhook.
            </p>

            {activateError && (
              <div className="auth-alert auth-alert-error" style={{ margin: '14px 0' }}>
                <i className="ri-error-warning-line" />
                <span>{activateError}</span>
              </div>
            )}

            {activateSuccess && (
              <div className="auth-alert auth-alert-success" style={{ margin: '14px 0' }}>
                <i className="ri-checkbox-circle-line" />
                <span>Payment activated successfully.</span>
              </div>
            )}

            {!activateSuccess && (
              <div className="form-group">
                <label className="form-label">Payment Reference</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. YMC-DUES-20260628120000-ABC123"
                  value={activateReference}
                  onChange={(e) => setActivateReference(e.target.value)}
                />
              </div>
            )}

            <div className="modal-footer">
              <button type="button" className="btn-outline" onClick={closeActivateModal}>
                {activateSuccess ? 'Close' : 'Cancel'}
              </button>
              {!activateSuccess && (
                <button
                  type="button"
                  className="btn-green"
                  disabled={!activateReference.trim() || activatePending}
                  onClick={confirmActivate}
                >
                  <i className="ri-flashlight-line" /> Activate
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
