import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { searchCourses } from '../core/data/courses'
import type { Course } from '../core/types'
import { CourseSearchForm } from '../components/courses/CourseSearchForm'
import { CourseCard } from '../components/courses/CourseCard'

export function CoursesPage() {
  const [params] = useSearchParams()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    void searchCourses({
      subject: params.get('subject') ?? undefined,
      level: params.get('level') ?? undefined,
      location: params.get('location') ?? undefined,
    })
      .then(setCourses)
      .finally(() => setLoading(false))
  }, [params])

  return (
    <>
      <header className="yl-catalog-header">
        <div>
          <p className="yl-section-eyebrow">Course catalogue</p>
          <h1 className="yl-page-title" style={{ marginBottom: '0.5rem' }}>All courses</h1>
          <p className="text-muted" style={{ fontSize: '0.9375rem', maxWidth: '36rem' }}>
            Search by subject, level, or location. Enrol online and access learning materials from your dashboard.
          </p>
        </div>
      </header>
      <CourseSearchForm />
      {loading ? (
        <div className="yl-grid-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="yl-pulse" style={{ height: '12rem' }} />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="yl-card" style={{ textAlign: 'center' }}>
          <p className="text-muted">No courses found. Try broadening your filters.</p>
        </div>
      ) : (
        <div className="yl-course-grid">
          {courses.map((c) => (
            <CourseCard key={c.id} course={c} showImage />
          ))}
        </div>
      )}
    </>
  )
}
