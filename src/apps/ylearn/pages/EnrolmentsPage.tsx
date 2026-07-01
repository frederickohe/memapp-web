import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useYlearnAuth } from '../core/AuthContext'
import { getUserEnrolments } from '../core/data/enrolments'
import {
  CURRENT_ENROLMENT_STATUSES,
  PAST_ENROLMENT_STATUSES,
} from '../core/types'
import type { Enrolment } from '../core/types'
import { EnrolmentBadge } from '../components/ui/Badge'
import { YlearnLink } from '../components/layout/YlearnShell'
import { ylearnBasePath } from '../../../config/hosts'

export function EnrolmentsPage() {
  const { user } = useYlearnAuth()
  const [params] = useSearchParams()
  const [enrolments, setEnrolments] = useState<Enrolment[]>([])
  const base = ylearnBasePath()
  const tab = params.get('tab') === 'past' ? 'past' : 'current'

  useEffect(() => {
    if (!user) return
    void getUserEnrolments().then(setEnrolments)
  }, [user])

  const filtered = enrolments.filter((e) =>
    tab === 'current'
      ? CURRENT_ENROLMENT_STATUSES.includes(e.status)
      : PAST_ENROLMENT_STATUSES.includes(e.status),
  )

  return (
    <div>
      {params.get('success') && (
        <p className="yl-alert-success">
          Enrolment confirmed. You can now access course content.
        </p>
      )}

      <div className="yl-tabs">
        <a href={`${base}/enrolments?tab=current`} className={`yl-tab ${tab === 'current' ? 'active' : ''}`}>
          Current
        </a>
        <a href={`${base}/enrolments?tab=past`} className={`yl-tab ${tab === 'past' ? 'active' : ''}`}>
          Past
        </a>
      </div>

      {filtered.length === 0 ? (
        <div className="yl-card" style={{ textAlign: 'center' }}>
          <p className="text-muted">No enrolments in this tab.</p>
          <YlearnLink to="/courses" className="yl-link" style={{ marginTop: '0.75rem', display: 'inline-block' }}>
            Find a course
          </YlearnLink>
        </div>
      ) : (
        <ul className="yl-space-y">
          {filtered.map((e) => (
            <li key={e.id} className="yl-card">
              <div className="yl-flex-between">
                <div>
                  <h3 style={{ fontWeight: 600 }}>{e.course?.name}</h3>
                  <p className="text-muted" style={{ fontSize: '0.875rem' }}>{e.course?.providerName}</p>
                  {e.status === 'removed' && e.removalReason && (
                    <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#dc2626' }}>
                      Removed: {e.removalReason}
                      {e.removalNote ? ` — ${e.removalNote}` : ''}
                    </p>
                  )}
                </div>
                <EnrolmentBadge status={e.status} />
              </div>
              {e.course && (
                <dl className="yl-grid-2" style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
                  <div>
                    <dt className="text-muted">Start</dt>
                    <dd>{new Date(e.course.startTime).toLocaleDateString()}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Capacity</dt>
                    <dd>{e.course.enrolledCount}/{e.course.maxCapacity}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Fees</dt>
                    <dd>£{e.course.fees.toFixed(2)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Level</dt>
                    <dd style={{ textTransform: 'capitalize' }}>{e.course.level}</dd>
                  </div>
                </dl>
              )}
              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
                {e.course && (
                  <YlearnLink to={`/courses/${e.courseId}`} className="yl-link" style={{ fontSize: '0.875rem' }}>
                    Course details
                  </YlearnLink>
                )}
                {e.status === 'enrolled' && (
                  <YlearnLink to={`/content/${e.courseId}`} className="yl-link" style={{ fontSize: '0.875rem' }}>
                    View content
                  </YlearnLink>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
