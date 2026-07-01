import { useEffect, useState } from 'react'
import { getAdminStats } from '../../core/data/users'
import { listAllCourses } from '../../core/data/courses'
import type { Course } from '../../core/types'
import { YlearnLink } from '../../components/layout/YlearnShell'

export function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    learners: 0,
    activeCourses: 0,
    currentEnrolments: 0,
  })
  const [courses, setCourses] = useState<Course[]>([])

  useEffect(() => {
    void Promise.all([getAdminStats(), listAllCourses()]).then(([s, c]) => {
      setStats(s)
      setCourses(c)
    })
  }, [])

  return (
    <div className="yl-space-y-lg">
      <div className="yl-grid-4">
        {[
          ['Users', stats.totalUsers],
          ['Learners', stats.learners],
          ['Active courses', stats.activeCourses],
          ['Enrolments', stats.currentEnrolments],
        ].map(([label, value]) => (
          <div key={String(label)} className="yl-card-sm">
            <p className="text-muted" style={{ fontSize: '0.875rem' }}>{label}</p>
            <p className="yl-stat-value">{value}</p>
          </div>
        ))}
      </div>

      <section className="yl-card">
        <div className="yl-flex-between" style={{ marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Courses overview</h3>
          <YlearnLink to="/admin/courses/new" className="yl-link" style={{ fontSize: '0.875rem' }}>
            Create course
          </YlearnLink>
        </div>
        <div className="yl-table-wrap">
          <table className="yl-table">
            <thead>
              <tr>
                <th>Course</th>
                <th>Provider</th>
                <th>Enrolled</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.providerName}</td>
                  <td>{c.enrolledCount}/{c.maxCapacity}</td>
                  <td>
                    <YlearnLink to={`/admin/courses/${c.id}/enrolments`} className="yl-link">
                      Enrolments
                    </YlearnLink>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
