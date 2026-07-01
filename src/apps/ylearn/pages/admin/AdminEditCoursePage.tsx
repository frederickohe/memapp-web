import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getCourseById, listProviders } from '../../core/data/courses'
import type { Course, Provider } from '../../core/types'
import { CourseForm } from '../../components/admin/CourseForm'

export function AdminEditCoursePage() {
  const { id } = useParams<{ id: string }>()
  const [course, setCourse] = useState<Course | null>(null)
  const [providers, setProviders] = useState<Provider[]>([])

  useEffect(() => {
    if (!id) return
    void Promise.all([getCourseById(id), listProviders()]).then(([c, p]) => {
      setCourse(c)
      setProviders(p)
    })
  }, [id])

  if (!course) return <div className="yl-loading">Loading…</div>

  return (
    <div>
      <h2 className="yl-page-title">Edit course</h2>
      <CourseForm providers={providers} course={course} />
    </div>
  )
}
