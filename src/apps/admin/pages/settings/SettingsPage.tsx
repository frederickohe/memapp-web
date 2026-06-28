import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminBasePath } from '../../../../config/hosts'
import { MockDataBanner } from '../../components/MockDataBanner'
import '../../styles/admin-global.css'
import './settings.css'

type SettingsTab = 'general' | 'pricing' | 'ai' | 'notifications' | 'security'

export function SettingsPage() {
  const navigate = useNavigate()
  const base = adminBasePath()

  const [activeTab, setActiveTab] = useState<SettingsTab>('general')
  const [saved, setSaved] = useState(false)

  const [general, setGeneral] = useState({
    companyName: 'VoltGo Technologies Ltd.',
    supportEmail: 'support@voltgo.com',
    supportPhone: '+233 30 222 4455',
    operatingCity: 'Accra',
    defaultLanguage: 'English',
    timezone: 'GMT (Accra)',
  })

  const cities = ['Accra', 'Kumasi', 'Tema', 'Takoradi']
  const [enabledCities, setEnabledCities] = useState<Record<string, boolean>>({
    Accra: true,
    Kumasi: false,
    Tema: false,
    Takoradi: false,
  })

  const [pricing, setPricing] = useState({
    baseFareBicycle: 15,
    baseFareMoto: 20,
    perKmRate: 2.5,
    surgeMin: 1.1,
    surgeMax: 1.8,
    surgeThreshold: 1.5,
    longDistanceCredits: 2,
  })

  const [ai, setAi] = useState({
    routeOptimizationEnabled: true,
    reoptimizeIntervalSec: 60,
    batchingEnabled: true,
    maxBatchOrdersMoto: 3,
    maxBatchOrdersBike: 1,
    demandForecastEnabled: true,
    speedAnomalyThreshold: 60,
    idleAnomalyMinutes: 30,
    etaAccuracyTargetMin: 5,
  })

  const [notifications, setNotifications] = useState({
    orderAlerts: true,
    riderSOS: true,
    kycSubmissions: true,
    paymentFailures: true,
    slaBreaches: true,
    weeklyReports: true,
    marketingEmails: false,
  })

  const [security, setSecurity] = useState({
    twoFactorRequired: true,
    sessionTimeoutMin: 60,
    passwordExpiryDays: 90,
    ipRestrictionEnabled: false,
  })

  const loginHistory = [
    { admin: 'Cephas', device: 'Chrome · Windows', location: 'Accra, GH', time: 'Just now', status: 'Success' },
    {
      admin: 'Akosua Frimpong',
      device: 'Safari · macOS',
      location: 'Accra, GH',
      time: '2h ago',
      status: 'Success',
    },
    { admin: 'Unknown', device: 'Chrome · Android', location: 'Lagos, NG', time: '1d ago', status: 'Blocked' },
    {
      admin: 'Michael Asare',
      device: 'Edge · Windows',
      location: 'Tema, GH',
      time: '2d ago',
      status: 'Success',
    },
  ]

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
          <i className="ri-building-line" /> General
        </button>
        <button
          type="button"
          className={`settings-nav-item${activeTab === 'pricing' ? ' settings-nav-active' : ''}`}
          onClick={() => setTab('pricing')}
        >
          <i className="ri-price-tag-3-line" /> Pricing & Surge
        </button>
        <button
          type="button"
          className={`settings-nav-item${activeTab === 'ai' ? ' settings-nav-active' : ''}`}
          onClick={() => setTab('ai')}
        >
          <i className="ri-robot-2-line" /> AI Settings
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
              <h2 className="card-title">Company Profile</h2>
            </div>

            <MockDataBanner />

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Company Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={general.companyName}
                  onChange={(e) => setGeneral((g) => ({ ...g, companyName: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Support Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={general.supportEmail}
                  onChange={(e) => setGeneral((g) => ({ ...g, supportEmail: e.target.value }))}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Support Phone</label>
                <input
                  type="text"
                  className="form-input"
                  value={general.supportPhone}
                  onChange={(e) => setGeneral((g) => ({ ...g, supportPhone: e.target.value }))}
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

            <h3 className="settings-subhdr">Operating Cities</h3>
            <p className="settings-hint">
              Enable cities where VoltGo currently operates. Per the rollout plan, Accra launches first, expanding to
              Kumasi, Tema, and Takoradi.
            </p>
            <div className="city-grid">
              {cities.map((city) => (
                <label className="city-toggle" key={city}>
                  <span>{city}</span>
                  <input
                    type="checkbox"
                    checked={enabledCities[city]}
                    onChange={(e) => setEnabledCities((c) => ({ ...c, [city]: e.target.checked }))}
                  />
                </label>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'pricing' && (
          <div className="card">
            <div className="card-hdr">
              <h2 className="card-title">Base Pricing</h2>
            </div>

            <MockDataBanner />

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Base Fare — Bicycle (GHS)</label>
                <input
                  type="number"
                  className="form-input"
                  value={pricing.baseFareBicycle}
                  onChange={(e) => setPricing((p) => ({ ...p, baseFareBicycle: Number(e.target.value) }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Base Fare — E-Motorcycle (GHS)</label>
                <input
                  type="number"
                  className="form-input"
                  value={pricing.baseFareMoto}
                  onChange={(e) => setPricing((p) => ({ ...p, baseFareMoto: Number(e.target.value) }))}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Per KM Rate (GHS)</label>
                <input
                  type="number"
                  className="form-input"
                  value={pricing.perKmRate}
                  step={0.1}
                  onChange={(e) => setPricing((p) => ({ ...p, perKmRate: Number(e.target.value) }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Long-Distance Credit Cost</label>
                <input
                  type="number"
                  className="form-input"
                  value={pricing.longDistanceCredits}
                  onChange={(e) => setPricing((p) => ({ ...p, longDistanceCredits: Number(e.target.value) }))}
                />
              </div>
            </div>

            <h3 className="settings-subhdr">Dynamic Surge Pricing</h3>
            <p className="settings-hint">
              Surge activates automatically when the demand-to-supply ratio exceeds the threshold below, per zone.
            </p>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Surge Trigger Threshold (demand:supply)</label>
                <input
                  type="number"
                  className="form-input"
                  value={pricing.surgeThreshold}
                  step={0.1}
                  onChange={(e) => setPricing((p) => ({ ...p, surgeThreshold: Number(e.target.value) }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Min Surge Multiplier</label>
                <input
                  type="number"
                  className="form-input"
                  value={pricing.surgeMin}
                  step={0.1}
                  onChange={(e) => setPricing((p) => ({ ...p, surgeMin: Number(e.target.value) }))}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Max Surge Multiplier (cap)</label>
              <input
                type="number"
                className="form-input"
                value={pricing.surgeMax}
                step={0.1}
                onChange={(e) => setPricing((p) => ({ ...p, surgeMax: Number(e.target.value) }))}
              />
            </div>

            <div className="surge-preview">
              <i className="ri-flashlight-line" />
              Surge will range between <strong>{pricing.surgeMin}x</strong> and <strong>{pricing.surgeMax}x</strong>{' '}
              when demand exceeds <strong>{pricing.surgeThreshold}:1</strong> in a zone.
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="card">
            <div className="card-hdr">
              <h2 className="card-title">Route Optimization Engine</h2>
            </div>

            <MockDataBanner />

            <div className="toggle-row">
              <div>
                <p className="toggle-label">AI Route Optimization</p>
                <p className="toggle-sub">Use OR-Tools VRPTW solver to optimize rider routes</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={ai.routeOptimizationEnabled}
                  onChange={(e) => setAi((a) => ({ ...a, routeOptimizationEnabled: e.target.checked }))}
                />
                <span className="switch-slider" />
              </label>
            </div>

            <div className="form-group">
              <label className="form-label">Re-optimization Interval (seconds)</label>
              <input
                type="number"
                className="form-input"
                value={ai.reoptimizeIntervalSec}
                disabled={!ai.routeOptimizationEnabled}
                onChange={(e) => setAi((a) => ({ ...a, reoptimizeIntervalSec: Number(e.target.value) }))}
              />
            </div>

            <div className="toggle-row">
              <div>
                <p className="toggle-label">Order Batching</p>
                <p className="toggle-sub">Combine nearby orders onto a single rider trip</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={ai.batchingEnabled}
                  onChange={(e) => setAi((a) => ({ ...a, batchingEnabled: e.target.checked }))}
                />
                <span className="switch-slider" />
              </label>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Max Batch Orders — E-Motorcycle</label>
                <input
                  type="number"
                  className="form-input"
                  value={ai.maxBatchOrdersMoto}
                  disabled={!ai.batchingEnabled}
                  onChange={(e) => setAi((a) => ({ ...a, maxBatchOrdersMoto: Number(e.target.value) }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Max Batch Orders — Bicycle</label>
                <input
                  type="number"
                  className="form-input"
                  value={ai.maxBatchOrdersBike}
                  disabled={!ai.batchingEnabled}
                  onChange={(e) => setAi((a) => ({ ...a, maxBatchOrdersBike: Number(e.target.value) }))}
                />
              </div>
            </div>

            <div className="toggle-row">
              <div>
                <p className="toggle-label">Demand Forecasting</p>
                <p className="toggle-sub">Predict order demand by zone and hour for proactive rider positioning</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={ai.demandForecastEnabled}
                  onChange={(e) => setAi((a) => ({ ...a, demandForecastEnabled: e.target.checked }))}
                />
                <span className="switch-slider" />
              </label>
            </div>

            <h3 className="settings-subhdr">AI Safety Monitoring</h3>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Speed Anomaly Threshold (km/h)</label>
                <input
                  type="number"
                  className="form-input"
                  value={ai.speedAnomalyThreshold}
                  onChange={(e) => setAi((a) => ({ ...a, speedAnomalyThreshold: Number(e.target.value) }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Idle Anomaly Threshold (minutes)</label>
                <input
                  type="number"
                  className="form-input"
                  value={ai.idleAnomalyMinutes}
                  onChange={(e) => setAi((a) => ({ ...a, idleAnomalyMinutes: Number(e.target.value) }))}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">ETA Accuracy Target (± minutes)</label>
              <input
                type="number"
                className="form-input"
                value={ai.etaAccuracyTargetMin}
                onChange={(e) => setAi((a) => ({ ...a, etaAccuracyTargetMin: Number(e.target.value) }))}
              />
            </div>
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
                <p className="toggle-label">New Order Alerts</p>
                <p className="toggle-sub">Notify when a new order is placed</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={notifications.orderAlerts}
                  onChange={(e) => setNotifications((n) => ({ ...n, orderAlerts: e.target.checked }))}
                />
                <span className="switch-slider" />
              </label>
            </div>
            <div className="toggle-row">
              <div>
                <p className="toggle-label">Rider SOS Alerts</p>
                <p className="toggle-sub">Immediate alert on rider emergency button press</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={notifications.riderSOS}
                  onChange={(e) => setNotifications((n) => ({ ...n, riderSOS: e.target.checked }))}
                />
                <span className="switch-slider" />
              </label>
            </div>
            <div className="toggle-row">
              <div>
                <p className="toggle-label">New KYC Submissions</p>
                <p className="toggle-sub">Notify when a rider submits documents for review</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={notifications.kycSubmissions}
                  onChange={(e) => setNotifications((n) => ({ ...n, kycSubmissions: e.target.checked }))}
                />
                <span className="switch-slider" />
              </label>
            </div>
            <div className="toggle-row">
              <div>
                <p className="toggle-label">Payment Failures</p>
                <p className="toggle-sub">Notify on failed Mobile Money or card transactions</p>
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
                <p className="toggle-label">SLA Breaches</p>
                <p className="toggle-sub">Notify when an order exceeds promised ETA</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={notifications.slaBreaches}
                  onChange={(e) => setNotifications((n) => ({ ...n, slaBreaches: e.target.checked }))}
                />
                <span className="switch-slider" />
              </label>
            </div>
            <div className="toggle-row">
              <div>
                <p className="toggle-label">Weekly Report Emails</p>
                <p className="toggle-sub">Auto-send scheduled analytics reports</p>
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
                <p className="toggle-label">Marketing Emails</p>
                <p className="toggle-sub">Product updates and announcements</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={notifications.marketingEmails}
                  onChange={(e) => setNotifications((n) => ({ ...n, marketingEmails: e.target.checked }))}
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
