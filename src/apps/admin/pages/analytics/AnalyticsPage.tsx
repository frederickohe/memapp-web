import { useCallback, useEffect, useState } from 'react'
import { MockDataBanner } from '../../components/MockDataBanner'
import { getYmcaBranchCount } from '../../components/YmcaBranchMap'
import { vhsApi } from '../../core/services'
import { ApiError } from '../../core/utils/apiError'
import '../../styles/shared.css'
import './analytics.css'

const TOP_BRANCHES = [
  {
    name: 'Accra Central YMCA',
    region: 'Greater Accra',
    count: 124,
    avatar: 'https://i.pravatar.cc/36?img=11',
  },
  {
    name: 'Kumasi YMCA',
    region: 'Ashanti',
    count: 98,
    avatar: 'https://i.pravatar.cc/36?img=12',
  },
  {
    name: 'Tema Community YMCA',
    region: 'Greater Accra',
    count: 76,
    avatar: 'https://i.pravatar.cc/36?img=13',
  },
  {
    name: 'Takoradi YMCA',
    region: 'Western',
    count: 52,
    avatar: 'https://i.pravatar.cc/36?img=14',
  },
]

const RECENT_REGISTRATIONS = [
  {
    id: 'MEM-1042',
    name: 'Ama Serwaa',
    branch: 'Accra Central',
    program: 'Youth Leadership',
    status: 'active',
  },
  {
    id: 'MEM-1041',
    name: 'Kwame Mensah',
    branch: 'Kumasi',
    program: 'Sports & Fitness',
    status: 'pending',
  },
  {
    id: 'MEM-1040',
    name: 'Efua Boateng',
    branch: 'Tema Community',
    program: 'Community Outreach',
    status: 'active',
  },
  {
    id: 'MEM-1039',
    name: 'Kofi Adjei',
    branch: 'Takoradi',
    program: 'Skills Training',
    status: 'active',
  },
  {
    id: 'MEM-1038',
    name: 'Abena Osei',
    branch: 'Accra Central',
    program: 'Summer Camp',
    status: 'pending',
  },
]

function statusBadgeClass(status: string): string {
  if (status === 'active') return 'badge-completed'
  if (status === 'inactive' || status === 'suspended') return 'badge-cancelled'
  return 'badge-pending'
}

function statusLabel(status: string): string {
  return status
    .split('_')
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ')
}

export function AnalyticsPage() {
  const branchCount = getYmcaBranchCount()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingVhsCount, setPendingVhsCount] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const vhsData = await vhsApi.list({ limit: 1, status: 'pending' })
      setPendingVhsCount(vhsData.total)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load analytics data.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <>
      {error && (
        <div className="auth-alert auth-alert-error" style={{ marginBottom: 18 }}>
          <i className="ri-error-warning-line" />
          <span>{error}</span>
        </div>
      )}

      <MockDataBanner message="Membership and branch figures are sample data where no API exists yet." />

      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon icon-blue">
            <i className="ri-building-2-fill" />
          </div>
          <div>
            <p className="stat-val">{branchCount}</p>
            <p className="stat-lbl">YMCA Branches</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-green">
            <i className="ri-group-fill" />
          </div>
          <div>
            <p className="stat-val">1,284</p>
            <p className="stat-lbl">Active Members</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-purple">
            <i className="ri-calendar-event-fill" />
          </div>
          <div>
            <p className="stat-val">12</p>
            <p className="stat-lbl">Upcoming Programs</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-orange">
            <i className="ri-time-fill" />
          </div>
          <div>
            <p className="stat-val">{loading ? '…' : pendingVhsCount}</p>
            <p className="stat-lbl">Pending VHS</p>
          </div>
        </div>
      </section>

      <section className="mid-row">
        <div className="card">
          <div className="card-hdr">
            <h2 className="card-title">Membership Overview</h2>
            <span className="more-dots">···</span>
          </div>
          <MockDataBanner message="No membership analytics endpoint exists yet — this chart shows sample proportions." />
          <div className="donut-center">
            <svg viewBox="0 0 200 200" className="donut-svg">
              <circle cx="100" cy="100" r="70" fill="none" stroke="#f0f0f0" strokeWidth="22" />
              <circle
                cx="100"
                cy="100"
                r="70"
                fill="none"
                stroke="#ff6b4a"
                strokeWidth="22"
                strokeDasharray="44 396"
                strokeDashoffset="0"
                transform="rotate(-90 100 100)"
                strokeLinecap="round"
              />
              <circle
                cx="100"
                cy="100"
                r="70"
                fill="none"
                stroke="#ffc542"
                strokeWidth="22"
                strokeDasharray="44 396"
                strokeDashoffset="-44"
                transform="rotate(-90 100 100)"
                strokeLinecap="round"
              />
              <circle
                cx="100"
                cy="100"
                r="70"
                fill="none"
                stroke="#3dd598"
                strokeWidth="22"
                strokeDasharray="352 88"
                strokeDashoffset="-88"
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
                72%
              </text>
              <text
                x="100"
                y="116"
                textAnchor="middle"
                fontSize="12"
                fill="#aaa"
                fontFamily="Poppins,sans-serif"
              >
                Active
              </text>
            </svg>
          </div>
          <div className="donut-legend">
            <span className="dl-item">
              <span className="dl-dot" style={{ background: '#3dd598' }} />
              Active
            </span>
            <span className="dl-item">
              <span className="dl-dot" style={{ background: '#ffc542' }} />
              Pending
            </span>
            <span className="dl-item">
              <span className="dl-dot" style={{ background: '#ff6b4a' }} />
              Expired
            </span>
          </div>
        </div>

        <div className="right-col">
          <div className="card">
            <h2 className="card-title" style={{ marginBottom: 14 }}>
              Most Active Branches This Month
            </h2>
            <MockDataBanner message="No branch activity endpoint exists yet — preview data only." />
            <div className="riders-hdr">
              <span>Branch Name</span>
              <span>New Members</span>
            </div>
            {TOP_BRANCHES.map((branch) => (
              <div key={branch.name} className="rider-row">
                <div className="rider-left">
                  <img src={branch.avatar} alt={branch.name} className="avatar-sm" />
                  <div>
                    <p className="rider-name">{branch.name}</p>
                    <p className="rider-email">{branch.region}</p>
                  </div>
                </div>
                <span className="rider-count">{branch.count}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="card table-card">
        <div className="card-hdr">
          <h2 className="card-title">Recent Member Registrations</h2>
          <button type="button" className="btn-icon-only" title="Refresh" onClick={() => void load()}>
            <i className="ri-refresh-line" />
          </button>
        </div>
        <MockDataBanner message="No member registration feed exists yet — table shows sample records." />
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Member ID</th>
                <th>Name</th>
                <th>Branch</th>
                <th>Program</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state">
                      <i className="ri-loader-4-line spin" /> Loading analytics...
                    </div>
                  </td>
                </tr>
              )}
              {!loading &&
                RECENT_REGISTRATIONS.map((member) => (
                  <tr key={member.id}>
                    <td className="td-track">{member.id}</td>
                    <td>{member.name}</td>
                    <td>{member.branch}</td>
                    <td>{member.program}</td>
                    <td>
                      <span className={`badge ${statusBadgeClass(member.status)}`}>
                        {statusLabel(member.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              {!loading && RECENT_REGISTRATIONS.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state">
                      <i className="ri-inbox-line" /> No recent registrations
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
