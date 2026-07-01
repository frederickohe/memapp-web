import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useYlearnAuth } from '../core/AuthContext'
import { userCanAccessContent } from '../core/data/enrolments'
import { getCourseContent } from '../core/data/content'
import { getCourseById } from '../core/data/courses'
import type { ContentItem, Course } from '../core/types'

export function ContentPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const { user } = useYlearnAuth()
  const [allowed, setAllowed] = useState<boolean | null>(null)
  const [course, setCourse] = useState<Course | null>(null)
  const [items, setItems] = useState<ContentItem[]>([])

  useEffect(() => {
    if (!courseId || !user) return
    void userCanAccessContent(courseId).then(async (ok) => {
      setAllowed(ok)
      if (!ok) return
      const [c, content] = await Promise.all([
        getCourseById(courseId),
        getCourseContent(courseId),
      ])
      setCourse(c)
      setItems(content)
    })
  }, [courseId, user])

  if (allowed === null) return <div className="yl-loading">Loading…</div>

  if (!allowed) {
    return (
      <div className="yl-card">
        <p style={{ color: '#dc2626' }}>
          You do not have access to this content. Enrol and complete checkout first, or you may
          have been removed from the course.
        </p>
      </div>
    )
  }

  if (!course) return <p>Course not found.</p>

  return (
    <div className="yl-content-layout">
      <aside className="yl-card" style={{ padding: '1rem' }}>
        <h3 style={{ fontWeight: 600 }}>{course.name}</h3>
        <p className="text-muted" style={{ marginTop: '0.25rem', fontSize: '0.75rem' }}>Modules</p>
        <ol style={{ marginTop: '0.75rem', paddingLeft: '1rem', fontSize: '0.875rem' }} className="yl-space-y">
          {items.map((item) => (
            <li key={item.id}>{item.title}</li>
          ))}
        </ol>
      </aside>
      <section className="yl-space-y">
        {items.length === 0 ? (
          <p className="text-muted">No content published yet.</p>
        ) : (
          items.map((item) => (
            <article key={item.id} className="yl-card">
              <h4 style={{ fontWeight: 600, textTransform: 'capitalize' }}>{item.type}: {item.title}</h4>
              {item.type === 'text' && item.body && (
                <div className="yl-prose">{item.body}</div>
              )}
              {item.type === 'video' && item.url && (
                <div className="yl-video">
                  <iframe src={item.url} title={item.title} allowFullScreen />
                </div>
              )}
              {item.type === 'resource' && item.url && (
                <a href={item.url} target="_blank" rel="noreferrer" className="yl-link" style={{ marginTop: '0.75rem', display: 'inline-block', fontSize: '0.875rem' }}>
                  Download resource
                </a>
              )}
            </article>
          ))
        )}
      </section>
    </div>
  )
}
