import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ylearnBasePath } from '../../../config/hosts'
import { useYlearnAuth } from '../core/AuthContext'
import { getEnrolment } from '../core/data/enrolments'
import { getCourseById } from '../core/data/courses'
import type { Course, Enrolment } from '../core/types'
import { CheckoutForm } from '../components/checkout/CheckoutForm'

export function CheckoutPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useYlearnAuth()
  const navigate = useNavigate()
  const base = ylearnBasePath()
  const [enrolment, setEnrolment] = useState<Enrolment | null>(null)
  const [course, setCourse] = useState<Course | null>(null)

  useEffect(() => {
    if (!id || !user) return
    void getEnrolment(id).then(async (e) => {
      if (!e || e.userId !== user.uid) {
        setEnrolment(null)
        return
      }
      if (!['draft', 'checkedOut'].includes(e.status)) {
        navigate(`${base}/enrolments`, { replace: true })
        return
      }
      setEnrolment(e)
      const c = await getCourseById(e.courseId)
      setCourse(c)
    })
  }, [id, user, navigate, base])

  if (!enrolment || !course) return <div className="yl-loading">Loading…</div>

  return (
    <div>
      <h2 className="yl-page-title">Checkout</h2>
      <CheckoutForm enrolment={enrolment} course={course} />
    </div>
  )
}
