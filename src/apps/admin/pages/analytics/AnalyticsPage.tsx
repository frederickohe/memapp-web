import { useCallback, useEffect, useMemo, useState } from 'react'
import { ScopeFilterBar } from '../../components/ScopeFilterBar'
import { branchApi } from '../../core/services'
import type { ProgressOverview, ScopeFilterParams } from '../../core/models'
import { ApiError } from '../../core/utils/apiError'
import '../../styles/shared.css'
import './analytics.css'

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

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function AnalyticsPage() {
  const [scopeFilter, setScopeFilter] = useState<ScopeFilterParams>({ scope: 'national' })
  const [overview, setOverview] = useState<ProgressOverview | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await branchApi.progressOverview(scopeFilter)
      setOverview(data)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load progress data.')
      setOverview(null)
    } finally {
      setLoading(false)
    }
  }, [scopeFilter])

  useEffect(() => {
    void load()
  }, [load])

  const goalLabel = useMemo(() => {
    if (scopeFilter.scope === 'branch') return 'Branch membership goal'
    if (scopeFilter.scope === 'region') return 'Regional membership goal'
    return 'National membership goal'
  }, [scopeFilter.scope])

  const goalHint = useMemo(() => {
    if (scopeFilter.scope === 'branch') {
      return 'Each branch is expected to reach 50 members.'
    }
    if (scopeFilter.scope === 'region') {
      return 'Regional target is 50 members per active branch in this region.'
    }
    return 'National YMCA target is 1,000 members (50 per branch).'
  }, [scopeFilter.scope])

  const scopeLabel = useMemo(() => {
    if (scopeFilter.scope === 'branch' && overview?.branch_name) return overview.branch_name
    if (scopeFilter.scope === 'region' && overview?.region_name) return overview.region_name
    return 'National (All)'
  }, [scopeFilter.scope, overview])

  return (
    <>
      {error && (
        <div className="auth-alert auth-alert-error" style={{ marginBottom: 18 }}>
          <i className="ri-error-warning-line" />
          <span>{error}</span>
        </div>
      )}

      <ScopeFilterBar value={scopeFilter} onChange={setScopeFilter} />

      <p className="text-muted" style={{ margin: '0 0 16px', fontSize: '0.9rem' }}>
        Viewing progress for: <strong>{scopeLabel}</strong>
      </p>

      <section className="goal-card">
        <div className="goal-card-hdr">
          <div>
            <p className="goal-eyebrow">Primary progress metric</p>
            <h2 className="goal-title">{goalLabel}</h2>
            <p className="goal-hint">{goalHint}</p>
          </div>
          <div className="goal-pct">
            {loading ? '…' : `${overview?.member_progress_pct ?? 0}%`}
          </div>
        </div>
        <div className="goal-counts">
          <span className="goal-current">
            {loading ? '…' : (overview?.total_members ?? 0).toLocaleString()}
          </span>
          <span className="goal-sep">/</span>
          <span className="goal-target">
            {loading ? '…' : (overview?.member_target ?? 0).toLocaleString()}
          </span>
          <span className="goal-unit">members</span>
        </div>
        <div className="goal-bar" aria-hidden="true">
          <div
            className="goal-bar-fill"
            style={{ width: `${overview?.member_progress_pct ?? 0}%` }}
          />
        </div>
        <p className="goal-remaining">
          {loading
            ? 'Calculating remaining members…'
            : (overview?.members_remaining ?? 0) === 0
              ? 'Membership goal reached for this scope.'
              : `${(overview?.members_remaining ?? 0).toLocaleString()} members still needed to reach the target.`}
        </p>
      </section>

      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon icon-blue">
            <i className="ri-building-2-fill" />
          </div>
          <div>
            <p className="stat-val">{loading ? '…' : (overview?.branch_count ?? 0)}</p>
            <p className="stat-lbl">YMCA Branches</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-green">
            <i className="ri-group-fill" />
          </div>
          <div>
            <p className="stat-val">{loading ? '…' : (overview?.active_members ?? 0)}</p>
            <p className="stat-lbl">Active Members</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-purple">
            <i className="ri-user-unfollow-line" />
          </div>
          <div>
            <p className="stat-val">{loading ? '…' : (overview?.inactive_members ?? 0)}</p>
            <p className="stat-lbl">Inactive Members</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-orange">
            <i className="ri-time-fill" />
          </div>
          <div>
            <p className="stat-val">{loading ? '…' : (overview?.pending_vhs ?? 0)}</p>
            <p className="stat-lbl">Pending VHS</p>
          </div>
        </div>
      </section>

      <section className="mid-row">
        <div className="left-col">
          <div className="card goal-progress-card">
            <div className="card-hdr">
              <h2 className="card-title">Goal Progress</h2>
            </div>
            <div className="donut-center">
              <svg viewBox="0 0 200 200" className="donut-svg">
                <circle cx="100" cy="100" r="70" fill="none" stroke="#f0f0f0" strokeWidth="22" />
                <circle
                  cx="100"
                  cy="100"
                  r="70"
                  fill="none"
                  stroke="#1e3a5f"
                  strokeWidth="22"
                  strokeDasharray={`${(overview?.member_progress_pct ?? 0) * 4.4} ${440 - (overview?.member_progress_pct ?? 0) * 4.4}`}
                  strokeDashoffset="0"
                  transform="rotate(-90 100 100)"
                  strokeLinecap="round"
                />
                <text
                  x="100"
                  y="92"
                  textAnchor="middle"
                  fontSize="34"
                  fontWeight="700"
                  fill="#1a1a2e"
                  fontFamily="Poppins,sans-serif"
                >
                  {overview?.member_progress_pct ?? 0}%
                </text>
                <text
                  x="100"
                  y="118"
                  textAnchor="middle"
                  fontSize="13"
                  fill="#aaa"
                  fontFamily="Poppins,sans-serif"
                >
                  of target
                </text>
              </svg>
            </div>
            <div className="donut-legend">
              <span className="dl-item">
                <span className="dl-dot" style={{ background: '#1e3a5f' }} />
                Current ({overview?.total_members ?? 0})
              </span>
              <span className="dl-item">
                <span className="dl-dot" style={{ background: '#e5e7eb' }} />
                Remaining ({overview?.members_remaining ?? 0})
              </span>
            </div>
          </div>

          <div className="card progress-insights-card">
            <h2 className="card-title">Progress Insights</h2>
            <div className="insight-list">
              <div className="insight-row">
                <div className="insight-icon icon-green">
                  <i className="ri-checkbox-circle-fill" />
                </div>
                <div>
                  <p className="insight-val">
                    {loading
                      ? '…'
                      : `${overview?.branches_at_goal ?? 0} / ${overview?.branch_count ?? 0}`}
                  </p>
                  <p className="insight-lbl">Branches at 50-member goal</p>
                </div>
              </div>
              <div className="insight-row">
                <div className="insight-icon icon-blue">
                  <i className="ri-bar-chart-grouped-fill" />
                </div>
                <div>
                  <p className="insight-val">
                    {loading ? '…' : (overview?.avg_members_per_branch ?? 0)}
                  </p>
                  <p className="insight-lbl">Avg members per branch</p>
                </div>
              </div>
              <div className="insight-row">
                <div className="insight-icon icon-teal">
                  <i className="ri-user-heart-fill" />
                </div>
                <div>
                  <p className="insight-val">
                    {loading ? '…' : `${overview?.active_member_pct ?? 0}%`}
                  </p>
                  <p className="insight-lbl">Active membership rate</p>
                </div>
              </div>
              <div className="insight-row">
                <div className="insight-icon icon-orange">
                  <i className="ri-hand-heart-fill" />
                </div>
                <div>
                  <p className="insight-val">
                    {loading ? '…' : (overview?.approved_vhs ?? 0)}
                  </p>
                  <p className="insight-lbl">Approved volunteer hours</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="right-col">
          <div className="card">
            <h2 className="card-title" style={{ marginBottom: 14 }}>
              Branch Goal Progress
            </h2>
            <div className="riders-hdr">
              <span>Branch Name</span>
              <span>Progress</span>
            </div>
            {(overview?.top_branches ?? []).map((branch) => (
              <div key={branch.branch_id} className="rider-row">
                <div className="rider-left">
                  <div className="avatar-sm" style={{ background: '#1e3a5f', color: '#fff', display: 'grid', placeItems: 'center' }}>
                    <i className="ri-building-line" />
                  </div>
                  <div>
                    <p className="rider-name">{branch.branch_name}</p>
                    <p className="rider-email">{branch.region_name}</p>
                    <div className="branch-progress-bar" aria-hidden="true">
                      <div
                        className="branch-progress-fill"
                        style={{ width: `${branch.member_progress_pct}%` }}
                      />
                    </div>
                  </div>
                </div>
                <span className="rider-count">
                  {branch.member_count}/{branch.member_target}
                </span>
              </div>
            ))}
            {!loading && (overview?.top_branches.length ?? 0) === 0 && (
              <div className="empty-state">
                <i className="ri-inbox-line" /> No branch data
              </div>
            )}
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
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Member ID</th>
                <th>Name</th>
                <th>Branch</th>
                <th>Registered</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state">
                      <i className="ri-loader-4-line spin" /> Loading progress...
                    </div>
                  </td>
                </tr>
              )}
              {!loading &&
                (overview?.recent_registrations ?? []).map((member) => (
                  <tr key={member.id}>
                    <td className="td-track">{member.member_id ?? member.id}</td>
                    <td>{member.name}</td>
                    <td>{member.branch_name ?? '—'}</td>
                    <td>{formatDate(member.created_at)}</td>
                    <td>
                      <span className={`badge ${statusBadgeClass(member.status)}`}>
                        {statusLabel(member.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              {!loading && (overview?.recent_registrations.length ?? 0) === 0 && (
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
