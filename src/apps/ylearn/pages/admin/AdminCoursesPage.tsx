import { useEffect, useState } from 'react'
import { listAllCourses, archiveCourse } from '../../core/data/courses'
import type { Course } from '../../core/types'
import { YlearnLink } from '../../components/layout/YlearnShell'

export function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])

  function refresh() {
    void listAllCourses().then(setCourses)
  }

  useEffect(() => {
    refresh()
  }, [])

  async function handleArchive(courseId: string) {
    await archiveCourse(courseId)
    refresh()
  }

  return (
    <div>
      <div className="yl-flex-between" style={{ marginBottom: '1.5rem' }}>
        <h2 className="yl-page-title" style={{ marginBottom: 0 }}>Manage courses</h2>
        <YlearnLink to="/admin/courses/new" className="yl-btn yl-btn-primary">
          Create course
        </YlearnLink>
      </div>
      <div className="yl-table-wrap">
        <table className="yl-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Level</th>
              <th>Fees</th>
              <th>Capacity</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td style={{ textTransform: 'capitalize' }}>{c.level}</td>
                <td>£{c.fees.toFixed(2)}</td>
                <td>{c.enrolledCount}/{c.maxCapacity}</td>
                <td style={{ textTransform: 'capitalize' }}>{c.status}</td>
                <td>
                  <YlearnLink to={`/admin/courses/${c.id}/edit`} className="yl-link" style={{ marginRight: '0.5rem' }}>
                    Edit
                  </YlearnLink>
                  <YlearnLink to={`/admin/courses/${c.id}/enrolments`} className="yl-link" style={{ marginRight: '0.5rem' }}>
                    Enrolments
                  </YlearnLink>
                  {c.status === 'active' && (
                    <button
                      type="button"
                      onClick={() => void handleArchive(c.id)}
                      style={{ color: '#dc2626', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', fontSize: 'inherit' }}
                    >
                      Archive
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
