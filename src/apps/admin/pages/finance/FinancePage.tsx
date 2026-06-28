import { useCallback, useEffect, useMemo, useState } from 'react'
import './finance.css'
import '../../styles/shared.css'
import { MockDataBanner } from '../../components/MockDataBanner'
import { paymentApi } from '../../core/services'
import type { AdminPayment, PaymentStatus, PaymentType } from '../../core/models'
import { ApiError } from '../../core/utils/apiError'
import { formatGhs } from '../../core/utils/formatGhs'

interface PayoutRow {
  riderId: string
  riderName: string
  avatar: string
  amount: number
  method: string
  status: 'Paid' | 'Pending' | 'Failed'
  date: string
}

const WEEKLY_REVENUE = [
  { day: 'Mon', value: 3200 },
  { day: 'Tue', value: 4100 },
  { day: 'Wed', value: 2950 },
  { day: 'Thu', value: 4800 },
  { day: 'Fri', value: 5600 },
  { day: 'Sat', value: 6900 },
  { day: 'Sun', value: 4000 },
]

const PAYMENT_SPLIT = [
  { method: 'MTN MoMo', percent: 52, color: '#ffc107' },
  { method: 'Vodafone Cash', percent: 21, color: '#ef4444' },
  { method: 'AirtelTigo Money', percent: 14, color: '#3b82f6' },
  { method: 'Card (Paystack)', percent: 13, color: '#8b5cf6' },
]

const PAYOUTS: PayoutRow[] = [
  { riderId: 'RD-1042', riderName: 'Eddie Lobanovskiy', avatar: 'https://i.pravatar.cc/36?img=11', amount: 640, method: 'MTN MoMo', status: 'Paid', date: 'Jun 16, 2026' },
  { riderId: 'RD-1043', riderName: 'Alexey Stave', avatar: 'https://i.pravatar.cc/36?img=12', amount: 412, method: 'Vodafone Cash', status: 'Paid', date: 'Jun 16, 2026' },
  { riderId: 'RD-1044', riderName: 'Anton Tkacheve', avatar: 'https://i.pravatar.cc/36?img=13', amount: 388, method: 'MTN MoMo', status: 'Pending', date: 'Jun 16, 2026' },
  { riderId: 'RD-1045', riderName: 'Kwesi Boateng', avatar: 'https://i.pravatar.cc/36?img=15', amount: 290, method: 'AirtelTigo Money', status: 'Failed', date: 'Jun 16, 2026' },
  { riderId: 'RD-1046', riderName: 'Yaw Darko', avatar: 'https://i.pravatar.cc/36?img=16', amount: 510, method: 'MTN MoMo', status: 'Paid', date: 'Jun 16, 2026' },
]

const TYPE_LABELS: Record<PaymentType, string> = {
  bundle_purchase: 'Bundle Purchase',
  delivery_payment: 'Pay-Per-Delivery',
  refund: 'Refund',
}

function formatPaymentDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function titleCaseStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

export function FinancePage() {
  const [activeTab, setActiveTab] = useState<'transactions' | 'payouts'>('transactions')
  const [payments, setPayments] = useState<AdminPayment[]>([])
  const [loading, setLoading] = useState(false)
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
  const [statusFilter, setStatusFilter] = useState<'All' | PaymentStatus | 'Paid' | 'Pending' | 'Failed'>('All')
  const [typeFilter, setTypeFilter] = useState<'All' | PaymentType>('All')

  const maxRevenue = Math.max(...WEEKLY_REVENUE.map((d) => d.value))

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
    if (activeTab === 'transactions') {
      load()
    }
  }, [activeTab, load])

  const filteredTransactions = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return payments
    return payments.filter(
      (t) =>
        t.customer.full_name.toLowerCase().includes(term) ||
        t.reference.toLowerCase().includes(term),
    )
  }, [payments, searchTerm])

  const filteredPayouts = useMemo(() => {
    return PAYOUTS.filter((p) => {
      const matchesSearch =
        p.riderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.riderId.toLowerCase().includes(searchTerm.toLowerCase())
      const payoutStatusFilter = statusFilter as 'All' | 'Paid' | 'Pending' | 'Failed'
      const matchesStatus = payoutStatusFilter === 'All' || p.status === payoutStatusFilter
      return matchesSearch && matchesStatus
    })
  }, [searchTerm, statusFilter])

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
            <p className="stat-val">{total}</p>
            <p className="stat-lbl">Total Payments</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-blue">
            <i className="ri-checkbox-circle-fill" />
          </div>
          <div>
            <p className="stat-val">{payments.filter((p) => p.status === 'success').length}</p>
            <p className="stat-lbl">Successful (this page)</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-orange">
            <i className="ri-hourglass-line" />
          </div>
          <div>
            <p className="stat-val">{payments.filter((p) => p.status === 'pending').length}</p>
            <p className="stat-lbl">Pending (this page)</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-red">
            <i className="ri-error-warning-fill" />
          </div>
          <div>
            <p className="stat-val">{payments.filter((p) => p.status === 'failed').length}</p>
            <p className="stat-lbl">Failed (this page)</p>
          </div>
        </div>
      </section>

      <section className="mid-row">
        <div className="card trend-card">
          <div className="card-hdr">
            <h2 className="card-title">Weekly Revenue</h2>
            <span className="more-dots">···</span>
          </div>
          <MockDataBanner message="No revenue analytics endpoint exists yet — this chart shows sample data." />
          <div className="bar-chart">
            {WEEKLY_REVENUE.map((d) => (
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
        </div>

        <div className="right-col">
          <div className="card">
            <div className="card-hdr">
              <h2 className="card-title">Payment Methods</h2>
              <span className="more-dots">···</span>
            </div>
            <MockDataBanner message="Payment method breakdown is not yet returned by any endpoint — preview data only." />
            <div className="pm-list">
              {PAYMENT_SPLIT.map((pm) => (
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
        <div className="tab-bar">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'transactions' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('transactions')}
          >
            Transactions
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'payouts' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('payouts')}
          >
            Rider Payouts
          </button>
        </div>

        <div className="card-hdr">
          <h2 className="card-title">{activeTab === 'transactions' ? 'All Transactions' : 'Weekly Payout Cycle'}</h2>
          <div className="filter-bar">
            <div className="search-box">
              <i className="ri-search-line" />
              <input
                type="text"
                placeholder="Search..."
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
              {activeTab === 'transactions' && (
                <>
                  <option value="success">Success</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </>
              )}
              {activeTab === 'payouts' && (
                <>
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Failed">Failed</option>
                </>
              )}
            </select>
            {activeTab === 'transactions' && (
              <select
                className="filter-select"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
              >
                <option value="All">All Types</option>
                <option value="bundle_purchase">Bundle Purchase</option>
                <option value="delivery_payment">Pay-Per-Delivery</option>
                <option value="refund">Refund</option>
              </select>
            )}
            {activeTab === 'transactions' && (
              <button type="button" className="btn-dark" onClick={openActivateModal}>
                <i className="ri-flashlight-line" /> Activate Payment
              </button>
            )}
          </div>
        </div>

        {error && activeTab === 'transactions' && (
          <div className="auth-alert auth-alert-error" style={{ margin: '0 20px 16px' }}>
            <i className="ri-error-warning-line" />
            <span>{error}</span>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Customer</th>
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
                        <td>{t.customer.full_name}</td>
                        <td>{TYPE_LABELS[t.type] ?? t.type}</td>
                        <td>{t.method || '—'}</td>
                        <td
                          style={{
                            color: t.type === 'refund' ? '#ef4444' : '#1a1a2e',
                            fontWeight: 600,
                          }}
                        >
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
        )}

        {activeTab === 'payouts' && (
          <div>
            <div style={{ padding: '0 20px' }}>
              <MockDataBanner message="There is no admin endpoint yet for rider payouts — this table shows sample data only." />
            </div>
            <div className="tbl-wrap">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Rider</th>
                    <th>Rider ID</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {filteredPayouts.map((p) => (
                    <tr key={p.riderId}>
                      <td>
                        <div className="rider-left">
                          <img src={p.avatar} alt={p.riderName} className="avatar-sm" />
                          <span style={{ fontWeight: 600, color: '#1a1a2e' }}>{p.riderName}</span>
                        </div>
                      </td>
                      <td className="td-track">{p.riderId}</td>
                      <td style={{ fontWeight: 600 }}>{formatGhs(p.amount)}</td>
                      <td>{p.method}</td>
                      <td>
                        <span
                          className={`badge ${
                            p.status === 'Paid'
                              ? 'badge-completed'
                              : p.status === 'Pending'
                                ? 'badge-pending'
                                : 'badge-cancelled'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td>{p.date}</td>
                      <td>
                        <div className="row-actions">
                          <button type="button" title="View details" disabled>
                            <i className="ri-eye-line" />
                          </button>
                          {p.status === 'Failed' && (
                            <button type="button" title="Retry payout" disabled>
                              <i className="ri-refresh-line" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredPayouts.length === 0 && (
                    <tr>
                      <td colSpan={7}>
                        <div className="empty-state">
                          <i className="ri-inbox-line" />
                          No payouts match your filters
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="pagination">
            <span className="pagination-info">
              Showing page {page} of {pages} · {total} payments total
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
        )}
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
              Use this when a customer was charged via Paystack but their credits or bundle weren&apos;t activated due to a missed webhook.
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
                <label className="form-label">Paystack Reference</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. VGB-1781344431934-kv1w6z"
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
