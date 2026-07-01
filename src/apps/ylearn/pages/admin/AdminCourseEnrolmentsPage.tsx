import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getCourseById } from '../../core/data/courses'
import { getCourseEnrolments } from '../../core/data/enrolments'
import type { Course, Enrolment } from '../../core/types'
import { EnrolmentBadge } from '../../components/ui/Badge'
import { RemoveLearnerForm } from '../../components/admin/RemoveLearnerForm'
import { YlearnLink } from '../../components/layout/YlearnShell'

export function AdminCourseEnrolmentsPage() {
  const { id } = useParams<{ id: string }>()
  const [course, setCourse] = useState<Course | null>(null)
  const [enrolments, setEnrolments] = useState<Enrolment[]>([])

  useEffect(() => {
    if (!id) return
    void Promise.all([getCourseById(id), getCourseEnrolments(id)]).then(([c, e]) => {
      setCourse(c)
      setEnrolments(e)
    })
  }, [id])

  if (!course) return <div className="yl-loading">Loading…</div>

  return (
    <div>
      <YlearnLink to="/admin/courses" className="yl-link" style={{ fontSize: '0.875rem' }}>
        ← Courses
      </YlearnLink>
      <h2 className="yl-page-title">{course.name} — Enrolments</h2>
      <p className="text-muted" style={{ fontSize: '0.875rem' }}>
        {course.enrolledCount} enrolled / {course.maxCapacity} max
      </p>

      <ul className="yl-space-y" style={{ marginTop: '1.5rem' }}>
        {enrolments.length === 0 ? (
          <li className="text-muted">No enrolments yet.</li>
        ) : (
          enrolments.map((e) => (
            <li key={e.id} className="yl-card">
              <div className="yl-flex-between">
                <span style={{ fontWeight: 500 }}>{e.username ?? e.userId}</span>
                <EnrolmentBadge status={e.status} />
              </div>
              <p className="text-muted" style={{ fontSize: '0.75rem' }}>Payment: {e.paymentStatus}</p>
              {e.status === 'enrolled' && (
                <RemoveLearnerForm enrolmentId={e.id} username={e.username} />
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  )
}
