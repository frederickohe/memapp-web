import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ylearnBasePath } from '../../../../config/hosts'
import { createCourse, updateCourse, type CourseInput } from '../../core/data/courses'
import type { Course, Provider } from '../../core/types'
import { Button } from '../ui/Button'

export function CourseForm({
  providers,
  course,
}: {
  providers: Provider[]
  course?: Course
}) {
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [pending, setPending] = useState(false)
  const navigate = useNavigate()
  const base = ylearnBasePath()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setPending(true)
    const data = new FormData(e.currentTarget)

    const payload: CourseInput = {
      providerId: String(data.get('providerId')),
      name: String(data.get('name')),
      instructor: String(data.get('instructor')),
      level: String(data.get('level')),
      subject: String(data.get('subject')),
      creditHours: Number(data.get('creditHours')),
      startTime: String(data.get('startTime')),
      numberOfWeeks: Number(data.get('numberOfWeeks')),
      fees: Number(data.get('fees')),
      maxCapacity: Number(data.get('maxCapacity')),
      status: course?.status ?? 'active',
    }

    try {
      if (course) {
        await updateCourse(course.id, payload)
      } else {
        await createCourse(payload)
      }
      setSuccess(true)
      if (!course) {
        navigate(`${base}/admin/courses`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save course.')
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="yl-card yl-form-wide">
      <div className="yl-form-group">
        <label className="yl-label">Provider</label>
        <select name="providerId" required defaultValue={course?.providerId} className="yl-select">
          {providers.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      {(
        [
          ['name', 'Course name', course?.name, 'text'],
          ['instructor', 'Instructor', course?.instructor, 'text'],
          ['subject', 'Subject', course?.subject, 'text'],
          ['level', 'Level (beginner/intermediate/advanced)', course?.level, 'text'],
          ['creditHours', 'Credit hours', course?.creditHours, 'number'],
          ['startTime', 'Start (datetime-local)', course?.startTime?.slice(0, 16), 'datetime-local'],
          ['numberOfWeeks', 'Number of weeks', course?.numberOfWeeks, 'number'],
          ['fees', 'Fees (£)', course?.fees, 'number'],
          ['maxCapacity', 'Max capacity', course?.maxCapacity, 'number'],
        ] as const
      ).map(([name, label, value, inputType]) => (
        <div key={name} className="yl-form-group">
          <label className="yl-label">{label}</label>
          <input
            name={name}
            required
            defaultValue={value != null ? String(value) : ''}
            type={inputType}
            className="yl-input"
            step={name === 'fees' ? '0.01' : undefined}
          />
        </div>
      ))}
      {error && <p className="yl-error">{error}</p>}
      {success && <p className="yl-success">Saved successfully.</p>}
      <Button type="submit" disabled={pending}>
        {pending ? 'Saving…' : course ? 'Update course' : 'Create course'}
      </Button>
    </form>
  )
}
