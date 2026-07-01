import { useEffect, useState } from 'react'
import { listProvidersWithCourses } from '../core/data/courses'
import type { Course, Provider } from '../core/types'
import { LeafletMap } from '../components/map/LeafletMap'
import { YlearnLink } from '../components/layout/YlearnShell'
import { getCourseImage } from '../core/data/courseMedia'

type ProviderWithCourses = Provider & { courses: Course[] }

export function MapPage() {
  const [providers, setProviders] = useState<ProviderWithCourses[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    void listProvidersWithCourses()
      .then(setProviders)
      .finally(() => setLoading(false))
  }, [])

  const mappable = providers.filter(
    (p) => Number.isFinite(Number(p.latitude)) && Number.isFinite(Number(p.longitude)),
  )

  const selected = providers.find((p) => p.id === selectedId) ?? null

  if (loading) return <div className="yl-pulse yl-map yl-map-page" />

  return (
    <div className="yl-map-page">
      <header className="yl-map-header">
        <div>
          <p className="yl-section-eyebrow">Course locations</p>
          <h1 className="yl-page-title" style={{ marginBottom: '0.5rem' }}>
            Find learning providers
          </h1>
          <p className="yl-map-header-desc">
            YMCA e-learning runs through regional providers — community centres, branches, and
            partner venues. Use the map to discover where courses are delivered, then enrol online.
          </p>
        </div>
        <div className="yl-map-header-stats">
          <div className="yl-map-stat">
            <strong>{providers.length}</strong>
            <span>Providers</span>
          </div>
          <div className="yl-map-stat">
            <strong>{mappable.length}</strong>
            <span>On map</span>
          </div>
          <div className="yl-map-stat">
            <strong>{providers.reduce((n, p) => n + p.courses.length, 0)}</strong>
            <span>Courses</span>
          </div>
        </div>
      </header>

      {providers.length === 0 && (
        <p className="yl-alert-warning">
          No providers found yet. Admins can add learning centres under Admin → Providers.
        </p>
      )}
      {providers.length > 0 && mappable.length === 0 && (
        <p className="yl-alert-warning">
          Providers exist but none have map coordinates. Add latitude and longitude in Admin → Providers.
        </p>
      )}

      <div className="yl-map-layout">
        <div className="yl-map-panel">
          <LeafletMap
            providers={providers}
            selectedProviderId={selectedId}
            onSelectProvider={setSelectedId}
          />
        </div>

        <aside className="yl-map-sidebar">
          <h2 className="yl-map-sidebar-title">All providers</h2>
          <p className="yl-map-sidebar-hint">Click a provider to highlight it on the map.</p>

          <ul className="yl-provider-list">
            {providers.map((p) => {
              const hasCoords =
                Number.isFinite(Number(p.latitude)) && Number.isFinite(Number(p.longitude))
              const isSelected = p.id === selectedId
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    className={`yl-provider-card${isSelected ? ' selected' : ''}`}
                    onClick={() => setSelectedId(p.id)}
                  >
                    <div className="yl-provider-card-top">
                      <span className={`yl-provider-pin${hasCoords ? '' : ' muted'}`} />
                      <div>
                        <strong>{p.name}</strong>
                        <p>{p.address}</p>
                      </div>
                    </div>
                    <div className="yl-provider-card-meta">
                      <span>{p.courses.length} course{p.courses.length !== 1 ? 's' : ''}</span>
                      {!hasCoords && <span className="yl-provider-no-coords">No map pin</span>}
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        </aside>
      </div>

      {selected && (
        <section className="yl-map-detail">
          <div className="yl-map-detail-header">
            <div>
              <h3>{selected.name}</h3>
              <p>{selected.address}</p>
            </div>
            <button
              type="button"
              className="yl-btn yl-btn-ghost"
              onClick={() => setSelectedId(null)}
            >
              Close
            </button>
          </div>

          {selected.courses.length === 0 ? (
            <p className="text-muted">No active courses at this provider right now.</p>
          ) : (
            <ul className="yl-map-course-list">
              {selected.courses.map((course) => (
                <li key={course.id} className="yl-map-course-item">
                  <img
                    src={getCourseImage(course.subject, course.name)}
                    alt=""
                    className="yl-map-course-thumb"
                  />
                  <div className="yl-map-course-info">
                    <strong>{course.name}</strong>
                    <p>
                      {course.subject} · {course.level} · £{course.fees.toFixed(2)}
                    </p>
                    <p className="text-muted">
                      {course.seatsRemaining ?? 0} seats remaining · starts{' '}
                      {new Date(course.startTime).toLocaleDateString()}
                    </p>
                  </div>
                  <YlearnLink to={`/courses/${course.id}`} className="yl-btn yl-btn-secondary yl-btn-sm">
                    View
                  </YlearnLink>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  )
}
