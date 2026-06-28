import './analytics.css'
import '../../styles/shared.css'
import { MockDataBanner } from '../../components/MockDataBanner'

const KPIS = [
  { label: 'Avg Delivery Time', value: '24 min', change: '-8%', positive: true, icon: 'ri-time-line', color: 'blue' },
  { label: 'First-Attempt Success', value: '94%', change: '+3%', positive: true, icon: 'ri-checkbox-circle-line', color: 'green' },
  { label: 'Rider Utilization', value: '78%', change: '+5%', positive: true, icon: 'ri-pulse-line', color: 'purple' },
  { label: 'Avg ETA Accuracy', value: '±4 min', change: '+1%', positive: true, icon: 'ri-route-line', color: 'orange' },
]

const WEEKLY_TREND = [
  { day: 'Mon', value: 62 },
  { day: 'Tue', value: 78 },
  { day: 'Wed', value: 55 },
  { day: 'Thu', value: 91 },
  { day: 'Fri', value: 102 },
  { day: 'Sat', value: 134 },
  { day: 'Sun', value: 88 },
]

const ZONES = [
  { name: 'Madina', orders: 312, percent: 28 },
  { name: 'East Legon', orders: 248, percent: 22 },
  { name: 'Lapaz', orders: 196, percent: 17 },
  { name: 'Kasoa', orders: 154, percent: 14 },
  { name: 'Adenta', orders: 122, percent: 11 },
  { name: 'Other zones', orders: 88, percent: 8 },
]

const FLEET_HEALTH = {
  avgBattery: 76,
  dueMaintenance: 6,
  totalVehicles: 90,
  avgMileage: '1,240 km',
}

const RETENTION = [
  { tier: 'Starter Pack', renewalRate: 41, churn: 22 },
  { tier: 'Business Lite', renewalRate: 68, churn: 11 },
  { tier: 'Business Pro', renewalRate: 82, churn: 6 },
  { tier: 'Enterprise', renewalRate: 91, churn: 3 },
]

const AI_PERFORMANCE = {
  timeSavedPct: 31,
  distanceSavedPct: 24,
  co2AvoidedKg: 1840,
  avgOptTimeMs: 870,
}

const KPI_ICON_CLASS: Record<string, string> = {
  blue: 'icon-blue',
  green: 'icon-green',
  purple: 'icon-purple',
  orange: 'icon-orange',
}

export function AnalyticsPage() {
  const maxTrend = Math.max(...WEEKLY_TREND.map((d) => d.value))

  return (
    <>
      <MockDataBanner message="There is no analytics endpoint yet — every figure on this page is sample data for design preview purposes." />

      <section className="stats-grid">
        {KPIS.map((kpi) => (
          <div key={kpi.label} className="stat-card">
            <div className={`stat-icon ${KPI_ICON_CLASS[kpi.color] ?? ''}`}>
              <i className={kpi.icon} />
            </div>
            <div>
              <p className="stat-val">{kpi.value}</p>
              <p className="stat-lbl">{kpi.label}</p>
            </div>
            <span className={`trend-pill ${kpi.positive ? 'trend-up' : 'trend-down'}`}>
              <i className={kpi.positive ? 'ri-arrow-up-line' : 'ri-arrow-down-line'} />
              {kpi.change}
            </span>
          </div>
        ))}
      </section>

      <section className="mid-row">
        <div className="card trend-card">
          <div className="card-hdr">
            <h2 className="card-title">Weekly Delivery Trend</h2>
            <span className="more-dots">···</span>
          </div>
          <div className="bar-chart">
            {WEEKLY_TREND.map((d) => (
              <div key={d.day} className="bar-col">
                <div className="bar-track">
                  <div className="bar-fill" style={{ height: `${(d.value / maxTrend) * 100}%` }}>
                    <span className="bar-value">{d.value}</span>
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
              <h2 className="card-title">Fleet Health</h2>
              <span className="more-dots">···</span>
            </div>
            <div className="donut-center">
              <svg viewBox="0 0 200 200" className="donut-svg">
                <circle cx="100" cy="100" r="70" fill="none" stroke="#f0f0f0" strokeWidth="22" />
                <circle
                  cx="100"
                  cy="100"
                  r="70"
                  fill="none"
                  stroke="#3dd598"
                  strokeWidth="22"
                  strokeDasharray={`${FLEET_HEALTH.avgBattery * 4.4} 440`}
                  strokeDashoffset="0"
                  transform="rotate(-90 100 100)"
                  strokeLinecap="round"
                />
                <text
                  x="100"
                  y="94"
                  textAnchor="middle"
                  fontSize="28"
                  fontWeight="700"
                  fill="#1a1a2e"
                  fontFamily="Poppins,sans-serif"
                >
                  {FLEET_HEALTH.avgBattery}%
                </text>
                <text
                  x="100"
                  y="116"
                  textAnchor="middle"
                  fontSize="12"
                  fill="#aaa"
                  fontFamily="Poppins,sans-serif"
                >
                  Avg Battery
                </text>
              </svg>
            </div>
            <div className="fleet-meta">
              <div className="fleet-meta-row">
                <span className="fleet-meta-label">
                  <i className="ri-tools-line" /> Due Maintenance
                </span>
                <span className="fleet-meta-value warn">{FLEET_HEALTH.dueMaintenance} vehicles</span>
              </div>
              <div className="fleet-meta-row">
                <span className="fleet-meta-label">
                  <i className="ri-e-bike-2-line" /> Total Fleet
                </span>
                <span className="fleet-meta-value">{FLEET_HEALTH.totalVehicles} vehicles</span>
              </div>
              <div className="fleet-meta-row">
                <span className="fleet-meta-label">
                  <i className="ri-road-map-line" /> Avg Mileage
                </span>
                <span className="fleet-meta-value">{FLEET_HEALTH.avgMileage}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mid-row">
        <div className="card">
          <div className="card-hdr">
            <h2 className="card-title">Order Density by Zone</h2>
            <span className="more-dots">···</span>
          </div>
          <div className="zone-list">
            {ZONES.map((zone) => (
              <div key={zone.name} className="zone-row">
                <div className="zone-top">
                  <span className="zone-name">{zone.name}</span>
                  <span className="zone-orders">{zone.orders} orders</span>
                </div>
                <div className="zone-bar-track">
                  <div className="zone-bar-fill" style={{ width: `${zone.percent * (100 / 28)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="right-col">
          <div className="card">
            <div className="card-hdr">
              <h2 className="card-title">AI Route Optimization</h2>
              <span className="more-dots">···</span>
            </div>
            <div className="ai-grid">
              <div className="ai-tile">
                <i className="ri-time-line ai-icon" />
                <p className="ai-val">{AI_PERFORMANCE.timeSavedPct}%</p>
                <p className="ai-lbl">Time Saved</p>
              </div>
              <div className="ai-tile">
                <i className="ri-signpost-line ai-icon" />
                <p className="ai-val">{AI_PERFORMANCE.distanceSavedPct}%</p>
                <p className="ai-lbl">Distance Saved</p>
              </div>
              <div className="ai-tile">
                <i className="ri-leaf-line ai-icon" />
                <p className="ai-val">{AI_PERFORMANCE.co2AvoidedKg}kg</p>
                <p className="ai-lbl">CO₂ Avoided</p>
              </div>
              <div className="ai-tile">
                <i className="ri-flashlight-line ai-icon" />
                <p className="ai-val">{AI_PERFORMANCE.avgOptTimeMs}ms</p>
                <p className="ai-lbl">Avg Opt. Time</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="card table-card">
        <div className="card-hdr">
          <h2 className="card-title">Customer Retention by Bundle Tier</h2>
          <span className="more-dots">···</span>
        </div>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Bundle Tier</th>
                <th>Renewal Rate</th>
                <th>Churn Rate</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {RETENTION.map((row) => (
                <tr key={row.tier}>
                  <td className="td-track">{row.tier}</td>
                  <td>{row.renewalRate}%</td>
                  <td>{row.churn}%</td>
                  <td>
                    <span
                      className={`badge ${
                        row.renewalRate >= 70
                          ? 'badge-completed'
                          : row.renewalRate >= 50
                            ? 'badge-pending'
                            : 'badge-cancelled'
                      }`}
                    >
                      {row.renewalRate >= 70 ? 'Healthy' : row.renewalRate >= 50 ? 'Watch' : 'At Risk'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
