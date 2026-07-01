import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ylearnBasePath } from '../../../../config/hosts'
import { createDraftEnrolment } from '../../core/data/enrolments'
import { useYlearnAuth } from '../../core/AuthContext'
import type { Course } from '../../core/types'
import { YlearnLink } from '../layout/YlearnShell'
import { Button } from '../ui/Button'

export function EnrollButton({ course }: { course: Course }) {
  const { user } = useYlearnAuth()
  const navigate = useNavigate()
  const base = ylearnBasePath()
  const [loading, setLoading] = useState(false)
  const full = (course.seatsRemaining ?? 0) <= 0

  if (!user) {
    return (
      <YlearnLink to="/login" className="yl-btn yl-btn-accent">
        Sign in to enrol
      </YlearnLink>
    )
  }

  if (user.role !== 'learner') {
    return <p className="text-muted" style={{ fontSize: '0.875rem' }}>Administrators cannot enrol as learners.</p>
  }

  if (course.status !== 'active' || full) {
    return (
      <button disabled className="yl-btn" style={{ background: '#e5e7eb', color: '#6b7280' }}>
        {full ? 'Course full' : 'Unavailable'}
      </button>
    )
  }

  async function handleEnrol() {
    setLoading(true)
    try {
      const id = await createDraftEnrolment(user!.uid, course.id)
      navigate(`${base}/checkout/${id}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      if (msg === 'ALREADY_ENROLLED') {
        navigate(`${base}/enrolments`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button type="button" onClick={() => void handleEnrol()} disabled={loading}>
      {loading ? 'Please wait…' : 'Enrol now'}
    </Button>
  )
}
