import { useEffect, useState } from 'react'
import { useYlearnAuth } from '../core/AuthContext'
import { getUserEnrolments } from '../core/data/enrolments'
import { CURRENT_ENROLMENT_STATUSES } from '../core/types'
import type { Enrolment } from '../core/types'
import { EnrolmentBadge } from '../components/ui/Badge'
import { YlearnLink } from '../components/layout/YlearnShell'

export function DashboardPage() {
  const { user } = useYlearnAuth()
  const [enrolments, setEnrolments] = useState<Enrolment[]>([])

  useEffect(() => {
    if (!user) return
    void getUserEnrolments().then(setEnrolments)
  }, [user])

  if (!user) return null

  const current = enrolments.filter((e) => CURRENT_ENROLMENT_STATUSES.includes(e.status))
  const inProgress = enrolments.filter((e) => e.status === 'enrolled')

  return (
    <div className="yl-space-y-lg">
      <section className="yl-card">
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Welcome, {user.username}</h3>
        <p className="text-muted" style={{ marginTop: '0.25rem', fontSize: '0.875rem' }}>
          {user.address} · {user.phone}
        </p>
      </section>

      <div className="yl-grid-3">
        <div className="yl-card-sm">
          <p className="text-muted" style={{ fontSize: '0.875rem' }}>Courses in progress</p>
          <p className="yl-stat-value">{inProgress.length}</p>
        </div>
        <div className="yl-card-sm">
          <p className="text-muted" style={{ fontSize: '0.875rem' }}>Active enrolments</p>
          <p className="yl-stat-value">{current.length}</p>
        </div>
        <div className="yl-card-sm">
          <p className="text-muted" style={{ fontSize: '0.875rem' }}>Quick links</p>
          <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
            <YlearnLink to="/courses" className="yl-link">Browse courses</YlearnLink>
            <YlearnLink to="/map" className="yl-link">Find centres</YlearnLink>
          </div>
        </div>
      </div>

      <section>
        <h3 style={{ marginBottom: '0.75rem', fontSize: '1.125rem', fontWeight: 600 }}>Recent enrolments</h3>
        {enrolments.length === 0 ? (
          <p className="text-muted">You have not enrolled yet.</p>
        ) : (
          <ul className="yl-space-y">
            {enrolments.slice(0, 5).map((e) => (
              <li key={e.id} className="yl-flex-between yl-card-sm" style={{ padding: '0.75rem 1rem' }}>
                <span>{e.course?.name ?? e.courseId}</span>
                <EnrolmentBadge status={e.status} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
