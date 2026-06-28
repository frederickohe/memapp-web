import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminBasePath } from '../../../../config/hosts'
import { MockDataBanner } from '../../components/MockDataBanner'
import { paymentApi } from '../../core/services'
import { YMCA_BRANCHES } from '../../core/ymcaBranches'
import { ApiError } from '../../core/utils/apiError'
import '../../styles/admin-global.css'
import './settings.css'

type SettingsTab = 'general' | 'pricing' | 'notifications' | 'security'

export function SettingsPage() {
  const navigate = useNavigate()
  const base = adminBasePath()

  const [activeTab, setActiveTab] = useState<SettingsTab>('general')
  const [saved, setSaved] = useState(false)
  const [configLoading, setConfigLoading] = useState(false)

  const [general, setGeneral] = useState({
    organizationName: 'Young Men\'s Christian Association of Ghana',
    shortName: 'YMCA Ghana',
    supportEmail: 'info@ymcaghana.org',
    supportPhone: '+233 30 222 1234',
    headquarters: 'Castle Road, Adabraka, Accra (P.O. Box GP738)',
    website: 'https://ymcaghana.org',
    defaultLanguage: 'English',
    timezone: 'GMT (Accra)',
  })

  const [pricing, setPricing] = useState({
    monthlyDuesGhs: 50,
    annualAffiliationGhs: 200,
    currency: 'GHS',
    defaultProvider: 'moolre',
  })

  const [notifications, setNotifications] = useState({
    vhsSubmissions: true,
    paymentFailures: true,
    newMemberRegistrations: true,
    duesReminders: true,
    weeklyReports: true,
    newsPublished: false,
  })

  const [security, setSecurity] = useState({
    twoFactorRequired: false,
    sessionTimeoutMin: 60,
    passwordExpiryDays: 90,
    ipRestrictionEnabled: false,
  })

  const loginHistory = [
    { admin: 'Admin User', device: 'Chrome · Windows', location: 'Accra, GH', time: 'Just now', status: 'Success' },
    {
      admin: 'Regional Admin',
      device: 'Safari · macOS',
      location: 'Kumasi, GH',
      time: '3h ago',
      status: 'Success',
    },
  ]

  const loadPaymentConfig = useCallback(async () => {
    setConfigLoading(true)
    try {
      const config = await paymentApi.config()
      setPricing({
        monthlyDuesGhs: config.monthly_dues_amount_ghs,
        annualAffiliationGhs: config.annual_affiliation_amount_ghs,
        currency: config.currency,
        defaultProvider: config.default_provider,
      })
    } catch (err: unknown) {
      console.warn('Could not load payment config:', err instanceof ApiError ? err.message : err)
    } finally {
      setConfigLoading(false)
    }
  }, [])

  useEffect(() => {
    if (activeTab === 'pricing') {
      void loadPaymentConfig()
    }
  }, [activeTab, loadPaymentConfig])

  const setTab = (tab: SettingsTab) => {
    setActiveTab(tab)
    setSaved(false)
  }

  const goToChangePassword = () => {
    navigate(`${base}/change-password`)
  }

  const saveSettings = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="settings-shell">
      <div className="settings-nav">
        <button
          type="button"
          className={`settings-nav-item${activeTab === 'general' ? ' settings-nav-active' : ''}`}
          onClick={() => setTab('general')}
        >
          <i className="ri-building-line" /> Organization Profile
        </button>
        <button
          type="button"
          className={`settings-nav-item${activeTab === 'pricing' ? ' settings-nav-active' : ''}`}
          onClick={() => setTab('pricing')}
        >
          <i className="ri-price-tag-3-line" /> Affiliation Fees
        </button>
        <button
          type="button"
          className={`settings-nav-item${activeTab === 'notifications' ? ' settings-nav-active' : ''}`}
          onClick={() => setTab('notifications')}
        >
          <i className="ri-notification-3-line" /> Notifications
        </button>
        <button
          type="button"
          className={`settings-nav-item${activeTab === 'security' ? ' settings-nav-active' : ''}`}
          onClick={() => setTab('security')}
        >
          <i className="ri-shield-keyhole-line" /> Security
        </button>
      </div>

      <div className="settings-content">
        {activeTab === 'general' && (
          <div className="card">
            <div className="card-hdr">
              <h2 className="card-title">Organization Profile</h2>
            </div>

            <MockDataBanner message="Organization profile fields are preview-only until a settings API is connected." />

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Organization Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={general.organizationName}
                  onChange={(e) => setGeneral((g) => ({ ...g, organizationName: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Short Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={general.shortName}
                  onChange={(e) => setGeneral((g) => ({ ...g, shortName: e.target.value }))}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Support Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={general.supportEmail}
                  onChange={(e) => setGeneral((g) => ({ ...g, supportEmail: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Support Phone</label>
                <input
                  type="text"
                  className="form-input"
                  value={general.supportPhone}
                  onChange={(e) => setGeneral((g) => ({ ...g, supportPhone: e.target.value }))}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">National Headquarters</label>
              <input
                type="text"
                className="form-input"
                value={general.headquarters}
                onChange={(e) => setGeneral((g) => ({ ...g, headquarters: e.target.value }))}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Website</label>
                <input
                  type="url"
                  className="form-input"
                  value={general.website}
                  onChange={(e) => setGeneral((g) => ({ ...g, website: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Default Language</label>
                <select
                  className="form-select"
                  value={general.defaultLanguage}
                  onChange={(e) => setGeneral((g) => ({ ...g, defaultLanguage: e.target.value }))}
                >
                  <option value="English">English</option>
                  <option value="Twi">Twi</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Timezone</label>
              <select
                className="form-select"
                value={general.timezone}
                onChange={(e) => setGeneral((g) => ({ ...g, timezone: e.target.value }))}
              >
                <option value="GMT (Accra)">GMT (Accra)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>

            <h3 className="settings-subhdr">Regional Branches</h3>
            <p className="settings-hint">
              YMCA Ghana operates through regional offices and local branches across the country.
            </p>
            <div className="city-grid">
              {YMCA_BRANCHES.map((branch) => (
                <div className="city-toggle" key={branch.id} style={{ cursor: 'default' }}>
                  <span>{branch.name}</span>
                  <span style={{ fontSize: 11, color: '#888' }}>{branch.region}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'pricing' && (
          <div className="card">
            <div className="card-hdr">
              <h2 className="card-title">Membership & Affiliation Fees</h2>
            </div>

            <MockDataBanner message="Fee amounts are loaded from the payment service. Saving updated amounts will require a backend settings endpoint — contact your administrator to change live values via environment configuration." />

            {configLoading ? (
              <p className="settings-hint">Loading current fee configuration…</p>
            ) : (
              <>
                <p className="settings-hint">
                  Set the amounts members pay for monthly dues and annual affiliation through the member app.
                </p>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Monthly Membership Dues ({pricing.currency})</label>
                    <input
                      type="number"
                      className="form-input"
                      min={0}
                      step={0.01}
                      value={pricing.monthlyDuesGhs}
                      onChange={(e) =>
                        setPricing((p) => ({ ...p, monthlyDuesGhs: Number(e.target.value) }))
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Annual Affiliation Fee ({pricing.currency})</label>
                    <input
                      type="number"
                      className="form-input"
                      min={0}
                      step={0.01}
                      value={pricing.annualAffiliationGhs}
                      onChange={(e) =>
                        setPricing((p) => ({ ...p, annualAffiliationGhs: Number(e.target.value) }))
                      }
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Provider</label>
                  <input
                    type="text"
                    className="form-input"
                    value={pricing.defaultProvider}
                    readOnly
                    style={{ background: '#f5f6fa' }}
                  />
                </div>

                <div className="surge-preview">
                  <i className="ri-information-line" />
                  Members are charged <strong>{pricing.currency} {pricing.monthlyDuesGhs.toFixed(2)}</strong> for
                  monthly dues and <strong>{pricing.currency} {pricing.annualAffiliationGhs.toFixed(2)}</strong> for
                  annual affiliation.
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="card">
            <div className="card-hdr">
              <h2 className="card-title">Admin Notification Preferences</h2>
            </div>

            <MockDataBanner />

            <div className="toggle-row">
              <div>
                <p className="toggle-label">New VHS Submissions</p>
                <p className="toggle-sub">Notify when a member submits volunteer hours for review</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={notifications.vhsSubmissions}
                  onChange={(e) => setNotifications((n) => ({ ...n, vhsSubmissions: e.target.checked }))}
                />
                <span className="switch-slider" />
              </label>
            </div>
            <div className="toggle-row">
              <div>
                <p className="toggle-label">Payment Failures</p>
                <p className="toggle-sub">Notify on failed dues or affiliation payments</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={notifications.paymentFailures}
                  onChange={(e) => setNotifications((n) => ({ ...n, paymentFailures: e.target.checked }))}
                />
                <span className="switch-slider" />
              </label>
            </div>
            <div className="toggle-row">
              <div>
                <p className="toggle-label">New Member Registrations</p>
                <p className="toggle-sub">Notify when a new member joins through the app</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={notifications.newMemberRegistrations}
                  onChange={(e) =>
                    setNotifications((n) => ({ ...n, newMemberRegistrations: e.target.checked }))
                  }
                />
                <span className="switch-slider" />
              </label>
            </div>
            <div className="toggle-row">
              <div>
                <p className="toggle-label">Dues & Affiliation Reminders</p>
                <p className="toggle-sub">Alert when members have overdue payments</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={notifications.duesReminders}
                  onChange={(e) => setNotifications((n) => ({ ...n, duesReminders: e.target.checked }))}
                />
                <span className="switch-slider" />
              </label>
            </div>
            <div className="toggle-row">
              <div>
                <p className="toggle-label">Weekly Report Emails</p>
                <p className="toggle-sub">Auto-send membership and finance summary reports</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={notifications.weeklyReports}
                  onChange={(e) => setNotifications((n) => ({ ...n, weeklyReports: e.target.checked }))}
                />
                <span className="switch-slider" />
              </label>
            </div>
            <div className="toggle-row">
              <div>
                <p className="toggle-label">News Published</p>
                <p className="toggle-sub">Notify when a news post or event is published</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={notifications.newsPublished}
                  onChange={(e) => setNotifications((n) => ({ ...n, newsPublished: e.target.checked }))}
                />
                <span className="switch-slider" />
              </label>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="card">
            <div className="card-hdr">
              <h2 className="card-title">Security Settings</h2>
            </div>

            <div className="toggle-row">
              <div>
                <p className="toggle-label">Change My Password</p>
                <p className="toggle-sub">Update the password used to sign in to this admin account</p>
              </div>
              <button type="button" className="btn-outline" onClick={goToChangePassword}>
                <i className="ri-lock-password-line" /> Change Password
              </button>
            </div>

            <MockDataBanner message="The toggles and login history below are not yet backed by a live endpoint — preview data only." />

            <div className="toggle-row">
              <div>
                <p className="toggle-label">Require Two-Factor Authentication</p>
                <p className="toggle-sub">All admin users must enable 2FA to sign in</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={security.twoFactorRequired}
                  onChange={(e) => setSecurity((s) => ({ ...s, twoFactorRequired: e.target.checked }))}
                />
                <span className="switch-slider" />
              </label>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Session Timeout (minutes)</label>
                <input
                  type="number"
                  className="form-input"
                  value={security.sessionTimeoutMin}
                  onChange={(e) => setSecurity((s) => ({ ...s, sessionTimeoutMin: Number(e.target.value) }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password Expiry (days)</label>
                <input
                  type="number"
                  className="form-input"
                  value={security.passwordExpiryDays}
                  onChange={(e) => setSecurity((s) => ({ ...s, passwordExpiryDays: Number(e.target.value) }))}
                />
              </div>
            </div>

            <div className="toggle-row">
              <div>
                <p className="toggle-label">IP Restriction</p>
                <p className="toggle-sub">Limit admin portal access to approved IP ranges</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={security.ipRestrictionEnabled}
                  onChange={(e) => setSecurity((s) => ({ ...s, ipRestrictionEnabled: e.target.checked }))}
                />
                <span className="switch-slider" />
              </label>
            </div>

            <h3 className="settings-subhdr">Recent Login Activity</h3>
            <div className="tbl-wrap">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Admin</th>
                    <th>Device</th>
                    <th>Location</th>
                    <th>Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loginHistory.map((log) => (
                    <tr key={`${log.admin}-${log.time}`}>
                      <td style={{ fontWeight: 600, color: '#1a1a2e' }}>{log.admin}</td>
                      <td>{log.device}</td>
                      <td>{log.location}</td>
                      <td>{log.time}</td>
                      <td>
                        <span className={`badge ${log.status === 'Success' ? 'badge-active' : 'badge-cancelled'}`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="save-bar">
          {saved && (
            <span className="save-confirm">
              <i className="ri-checkbox-circle-fill" /> Settings saved
            </span>
          )}
          <button type="button" className="btn-outline">
            Discard Changes
          </button>
          <button type="button" className="btn-green" onClick={saveSettings}>
            <i className="ri-save-line" /> Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
