import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getCourseById } from '../core/data/courses'
import { useYlearnAuth } from '../core/AuthContext'
import type { Course } from '../core/types'
import { EnrollButton } from '../components/courses/EnrollButton'
import { YlearnLink } from '../components/layout/YlearnShell'

export function CourseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useYlearnAuth()
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    void getCourseById(id)
      .then(setCourse)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="yl-pulse" style={{ height: '20rem', maxWidth: '48rem' }} />
  if (!course) return <p>Course not found.</p>

  return (
    <div className="yl-card" style={{ maxWidth: '48rem' }}>
      <p className="text-muted" style={{ fontSize: '0.875rem', textTransform: 'capitalize' }}>
        {course.level} · {course.subject}
      </p>
      <h1 style={{ marginTop: '0.25rem', fontSize: '1.875rem', fontWeight: 600 }}>{course.name}</h1>
      <p className="text-muted" style={{ marginTop: '0.5rem' }}>
        {course.providerName} — {course.providerAddress}
      </p>

      <dl className="yl-grid-2" style={{ marginTop: '2rem', gap: '1rem' }}>
        {[
          ['Instructor', course.instructor],
          ['Credit hours', course.creditHours],
          ['Start', new Date(course.startTime).toLocaleString()],
          ['Duration', `${course.numberOfWeeks} weeks`],
          ['Fees', `£${course.fees.toFixed(2)}`],
          [
            'Capacity',
            `${course.enrolledCount} enrolled / ${course.maxCapacity} max (${course.seatsRemaining} remaining)`,
          ],
        ].map(([label, value]) => (
          <div key={String(label)}>
            <dt className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase' }}>{label}</dt>
            <dd style={{ marginTop: '0.25rem' }}>{value}</dd>
          </div>
        ))}
      </dl>

      <div style={{ marginTop: '2rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
        <EnrollButton course={course} />
        {user?.role === 'learner' && (
          <YlearnLink to="/enrolments" className="yl-btn yl-btn-secondary">
            My enrolments
          </YlearnLink>
        )}
      </div>
    </div>
  )
}
