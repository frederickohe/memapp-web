import { useSearchParams, useNavigate } from 'react-router-dom'
import { type FormEvent } from 'react'
import { ylearnBasePath } from '../../../../config/hosts'
import { Button } from '../ui/Button'

export function CourseSearchForm() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const base = ylearnBasePath()

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const q = new URLSearchParams()
    ;['subject', 'level', 'location'].forEach((key) => {
      const v = String(data.get(key) ?? '').trim()
      if (v) q.set(key, v)
    })
    navigate(`${base}/courses?${q.toString()}`)
  }

  return (
    <form onSubmit={onSubmit} className="yl-card yl-search-form">
      <input
        name="subject"
        placeholder="Subject or keyword"
        defaultValue={params.get('subject') ?? ''}
        className="yl-input"
      />
      <select name="level" defaultValue={params.get('level') ?? ''} className="yl-select">
        <option value="">Any level</option>
        <option value="beginner">Beginner</option>
        <option value="intermediate">Intermediate</option>
        <option value="advanced">Advanced</option>
      </select>
      <input
        name="location"
        placeholder="City or provider area"
        defaultValue={params.get('location') ?? ''}
        className="yl-input"
      />
      <Button type="submit">Search</Button>
    </form>
  )
}
