import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminBasePath } from '../../../../config/hosts'
import { MockDataBanner } from '../../components/MockDataBanner'
import { getYmcaBranchCount, YmcaBranchMap } from '../../components/YmcaBranchMap'
import { memberUserApi, paymentApi, vhsApi } from '../../core/services'
import type { MemberUserOverview, PaymentOverview } from '../../core/models'
import { ApiError } from '../../core/utils/apiError'
import { formatGhs } from '../../core/utils/formatGhs'
import '../../styles/shared.css'
import './dashboard.css'

const NOTIFICATION_CATEGORIES = [
  {
    type: 'INFO',
    label: 'Info',
    description: 'General updates and announcements for members',
    icon: 'ri-information-line',
    color: 'blue',
  },
  {
    type: 'WARNING',
    label: 'Warning',
    description: 'Important cautions and reminders',
    icon: 'ri-alert-line',
    color: 'orange',
  },
  {
    type: 'ERROR',
    label: 'Error',
    description: 'Failed payments and system issues',
    icon: 'ri-error-warning-line',
    color: 'red',
  },
  {
    type: 'SUCCESS',
    label: 'Success',
    description: 'Confirmations and completed actions',
    icon: 'ri-checkbox-circle-line',
    color: 'green',
  },
  {
    type: 'PROMOTIONAL',
    label: 'Promotional',
    description: 'Offers, events, and program highlights',
    icon: 'ri-megaphone-line',
    color: 'purple',
  },
  {
    type: 'TRANSACTIONAL',
    label: 'Transactional',
    description: 'Payments, renewals, and receipts',
    icon: 'ri-exchange-dollar-line',
    color: 'teal',
  },
  {
    type: 'OTP',
    label: 'OTP',
    description: 'One-time verification codes',
    icon: 'ri-shield-keyhole-line',
    color: 'indigo',
  },
  {
    type: 'ALERT',
    label: 'Alert',
    description: 'Urgent notices requiring attention',
    icon: 'ri-notification-badge-line',
    color: 'rose',
  },
] as const

const CATEGORY_ICON_CLASS: Record<string, string> = {
  blue: 'icon-blue',
  orange: 'icon-orange',
  red: 'icon-red',
  green: 'icon-green',
  purple: 'icon-purple',
  teal: 'icon-teal',
  indigo: 'icon-indigo',
  rose: 'icon-rose',
}

export function DashboardPage() {
  const branchCount = getYmcaBranchCount()
  const base = adminBasePath()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userOverview, setUserOverview] = useState<MemberUserOverview | null>(null)
  const [paymentOverview, setPaymentOverview] = useState<PaymentOverview | null>(null)
  const [pendingVhsCount, setPendingVhsCount] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    const results = await Promise.allSettled([
      memberUserApi.overview(),
      paymentApi.overview(),
      vhsApi.list({ limit: 1, status: 'pending' }),
    ])

    const [usersResult, paymentsResult, vhsResult] = results

    if (usersResult.status === 'fulfilled') {
      setUserOverview(usersResult.value)
    }

    if (paymentsResult.status === 'fulfilled') {
      setPaymentOverview(paymentsResult.value)
    }

    if (vhsResult.status === 'fulfilled') {
      setPendingVhsCount(vhsResult.value.total)
    }

    const failures = results.filter((r) => r.status === 'rejected')
    if (failures.length === results.length) {
      setError(
        failures[0].status === 'rejected' && failures[0].reason instanceof ApiError
          ? failures[0].reason.message
          : 'Failed to load dashboard data.',
      )
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const liveStats = [
    {
      label: 'Total Users',
      value: userOverview?.total_users ?? '—',
      icon: 'ri-group-fill',
      color: 'blue',
      link: `${base}/users`,
    },
    {
      label: 'Active Users',
      value: userOverview?.active_users ?? '—',
      icon: 'ri-user-star-fill',
      color: 'green',
      link: `${base}/users`,
    },
    {
      label: 'Pending VHS',
      value: pendingVhsCount,
      icon: 'ri-time-line',
      color: 'orange',
      link: `${base}/vhs`,
    },
    {
      label: 'Revenue Collected',
      value: paymentOverview ? formatGhs(paymentOverview.total_revenue_ghs) : '—',
      icon: 'ri-bank-card-line',
      color: 'purple',
      link: `${base}/finance`,
    },
  ]

  return (
    <>
      <section className="stats-grid dashboard-stats">
        {liveStats.map((stat) => (
          <Link key={stat.label} to={stat.link} className="stat-card stat-card-link">
            <div className={`stat-icon icon-${stat.color}`}>
              <i className={stat.icon} />
            </div>
            <div>
              <p className="stat-val">{loading ? '…' : stat.value}</p>
              <p className="stat-lbl">{stat.label}</p>
            </div>
          </Link>
        ))}
      </section>

      {error && (
        <div className="error-banner" style={{ marginBottom: 16 }}>
          <i className="ri-error-warning-line" /> {error}
        </div>
      )}

      <section className="card map-card map-card-full">
        <div className="card-hdr">
          <h2 className="card-title">YMCA Branches in Ghana</h2>
        </div>
        <MockDataBanner message="Branch locations are based on YMCA Ghana regional offices. Click a pin for details." />
        <div className="map-box map-box-tall">
          <YmcaBranchMap className="osm-map-container" />
        </div>
        <div className="map-legend">
          <span className="ldot ldot-blue" />
          <span className="ltext">{branchCount} Branches</span>
        </div>
      </section>

      <section className="notif-section">
        <div className="notif-section-hdr">
          <h2 className="card-title">Notification Categories</h2>
          <p className="notif-section-sub">Browse and manage notifications by type</p>
        </div>
        <MockDataBanner message="No notification analytics endpoint exists yet — counts are sample data for preview." />
        <div className="notif-categories-grid">
          {NOTIFICATION_CATEGORIES.map((category) => (
            <button key={category.type} type="button" className="notif-category-card">
              <div className={`notif-category-icon ${CATEGORY_ICON_CLASS[category.color] ?? ''}`}>
                <i className={category.icon} />
              </div>
              <div className="notif-category-body">
                <div className="notif-category-top">
                  <h3 className="notif-category-label">{category.label}</h3>
                </div>
                <p className="notif-category-desc">{category.description}</p>
              </div>
              <i className="ri-arrow-right-s-line notif-category-arrow" />
            </button>
          ))}
        </div>
      </section>
    </>
  )
}
