import { MockDataBanner } from '../../components/MockDataBanner'
import { getYmcaBranchCount, YmcaBranchMap } from '../../components/YmcaBranchMap'
import '../../styles/shared.css'
import './dashboard.css'

const NOTIFICATION_CATEGORIES = [
  {
    type: 'INFO',
    label: 'Info',
    description: 'General updates and announcements for members',
    icon: 'ri-information-line',
    color: 'blue',
    count: 48,
  },
  {
    type: 'WARNING',
    label: 'Warning',
    description: 'Important cautions and reminders',
    icon: 'ri-alert-line',
    color: 'orange',
    count: 12,
  },
  {
    type: 'ERROR',
    label: 'Error',
    description: 'Failed deliveries and system issues',
    icon: 'ri-error-warning-line',
    color: 'red',
    count: 3,
  },
  {
    type: 'SUCCESS',
    label: 'Success',
    description: 'Confirmations and completed actions',
    icon: 'ri-checkbox-circle-line',
    color: 'green',
    count: 156,
  },
  {
    type: 'PROMOTIONAL',
    label: 'Promotional',
    description: 'Offers, events, and program highlights',
    icon: 'ri-megaphone-line',
    color: 'purple',
    count: 24,
  },
  {
    type: 'TRANSACTIONAL',
    label: 'Transactional',
    description: 'Payments, renewals, and receipts',
    icon: 'ri-exchange-dollar-line',
    color: 'teal',
    count: 89,
  },
  {
    type: 'OTP',
    label: 'OTP',
    description: 'One-time verification codes',
    icon: 'ri-shield-keyhole-line',
    color: 'indigo',
    count: 34,
  },
  {
    type: 'ALERT',
    label: 'Alert',
    description: 'Urgent notices requiring attention',
    icon: 'ri-notification-badge-line',
    color: 'rose',
    count: 7,
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

  return (
    <>
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
                  <span className="notif-category-count">{category.count}</span>
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
