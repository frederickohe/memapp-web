import { useEffect, useState } from 'react'
import { searchCourses } from '../core/data/courses'
import { FEATURED_VIDEOS, getCourseImage, TECH_SUBJECTS } from '../core/data/courseMedia'
import type { Course } from '../core/types'
import { useYlearnAuth } from '../core/AuthContext'
import { YlearnLink } from '../components/layout/YlearnShell'
import { CourseCard } from '../components/courses/CourseCard'

function isTechCourse(course: Course): boolean {
  const haystack = `${course.subject} ${course.name}`.toLowerCase()
  return TECH_SUBJECTS.some((s) => haystack.includes(s.toLowerCase().split(' ')[0]))
}

export function HomePage() {
  const { user } = useYlearnAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [activeVideo, setActiveVideo] = useState<(typeof FEATURED_VIDEOS)[number]>(
    FEATURED_VIDEOS[0],
  )

  useEffect(() => {
    void searchCourses({})
      .then((all) => {
        const tech = all.filter(isTechCourse)
        setCourses(tech.length > 0 ? tech.slice(0, 6) : all.slice(0, 6))
      })
      .finally(() => setLoading(false))
  }, [])

  const dashboardPath = user?.role === 'admin' ? '/admin' : '/dashboard'

  return (
    <div className="yl-home">
      <section className="yl-hero">
        <div className="yl-hero-inner">
          <div className="yl-hero-copy">
            <p className="yl-hero-eyebrow">YMCA E-Learning</p>
            <h1 className="yl-hero-title">
              Learn tech skills that
              <span className="yl-hero-accent"> open doors</span>
            </h1>
            <p className="yl-hero-lead">
              Browse instructor-led courses in programming, web development, data science, and more.
              Study online or find a learning centre near you.
            </p>
            <div className="yl-hero-actions">
              <YlearnLink to="/courses" className="yl-btn yl-btn-hero-primary">
                Explore courses
              </YlearnLink>
              {user ? (
                <YlearnLink to={dashboardPath} className="yl-btn yl-btn-hero-secondary">
                  Go to dashboard
                </YlearnLink>
              ) : (
                <YlearnLink to="/register" className="yl-btn yl-btn-hero-secondary">
                  Create account
                </YlearnLink>
              )}
            </div>
            <div className="yl-hero-stats">
              <div>
                <strong>{TECH_SUBJECTS.length}+</strong>
                <span>Tech subjects</span>
              </div>
              <div>
                <strong>Online</strong>
                <span>& in-person</span>
              </div>
              <div>
                <strong>YMCA</strong>
                <span>Certified paths</span>
              </div>
            </div>
          </div>
          <div className="yl-hero-visual" aria-hidden="true">
            <div className="yl-hero-image-stack">
              <img
                src={getCourseImage('programming')}
                alt=""
                className="yl-hero-img yl-hero-img-main"
              />
              <img
                src={getCourseImage('web development')}
                alt=""
                className="yl-hero-img yl-hero-img-secondary"
              />
              <div className="yl-hero-floating-card">
                <span className="yl-hero-floating-icon">▶</span>
                <div>
                  <p>Video lessons</p>
                  <strong>Learn at your pace</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="yl-home-section">
        <div className="yl-section-header">
          <div>
            <p className="yl-section-eyebrow">Featured courses</p>
            <h2 className="yl-section-title">Popular tech programmes</h2>
            <p className="yl-section-desc">
              Enrol in courses led by experienced instructors at YMCA learning providers.
            </p>
          </div>
          <YlearnLink to="/courses" className="yl-btn yl-btn-secondary yl-section-cta">
            View all courses
          </YlearnLink>
        </div>

        {loading ? (
          <div className="yl-course-grid">
            {[1, 2, 3].map((i) => (
              <div key={i} className="yl-pulse yl-course-skeleton" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="yl-card yl-empty-state">
            <p>No courses available yet. Check back soon or browse the full catalogue.</p>
            <YlearnLink to="/courses" className="yl-btn yl-btn-primary" style={{ marginTop: '1rem' }}>
              Browse catalogue
            </YlearnLink>
          </div>
        ) : (
          <div className="yl-course-grid">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} showImage />
            ))}
          </div>
        )}
      </section>

      <section className="yl-home-section yl-video-section">
        <div className="yl-section-header yl-section-header-center">
          <p className="yl-section-eyebrow">Preview lessons</p>
          <h2 className="yl-section-title">Watch before you enrol</h2>
          <p className="yl-section-desc">
            Sample free introductory videos from our tech curriculum areas.
          </p>
        </div>

        <div className="yl-video-layout">
          <div className="yl-video-player-wrap">
            <div className="yl-video-player">
              <iframe
                title={activeVideo.title}
                src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?rel=0`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="yl-video-active-meta">
              <span className="yl-video-subject-pill">{activeVideo.subject}</span>
              <h3>{activeVideo.title}</h3>
              <p>{activeVideo.description}</p>
            </div>
          </div>

          <ul className="yl-video-playlist">
            {FEATURED_VIDEOS.map((video) => (
              <li key={video.id}>
                <button
                  type="button"
                  className={`yl-video-playlist-item${activeVideo.id === video.id ? ' active' : ''}`}
                  onClick={() => setActiveVideo(video)}
                >
                  <span className="yl-video-thumb">
                    <img
                      src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                      alt=""
                    />
                    <span className="yl-video-play-icon">▶</span>
                  </span>
                  <span className="yl-video-playlist-text">
                    <strong>{video.title}</strong>
                    <span>{video.subject}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="yl-home-section">
        <div className="yl-map-teaser">
          <div className="yl-map-teaser-copy">
            <p className="yl-section-eyebrow">Find a centre</p>
            <h2 className="yl-section-title">Learning providers near you</h2>
            <p className="yl-section-desc">
              The map shows YMCA-affiliated course providers across the region. Click a location
              to see which tech programmes run there, check addresses, and compare available seats.
            </p>
            <ul className="yl-map-teaser-list">
              <li>See provider addresses and course offerings</li>
              <li>Filter by location when searching courses</li>
              <li>Enrol online, learn in person or hybrid</li>
            </ul>
            <YlearnLink to="/map" className="yl-btn yl-btn-accent">
              Open providers map
            </YlearnLink>
          </div>
          <div className="yl-map-teaser-visual">
            <div className="yl-map-teaser-card">
              <div className="yl-map-teaser-pin" />
              <p className="yl-map-teaser-card-title">YMCA Learning Centre</p>
              <p className="yl-map-teaser-card-meta">3 tech courses · 12 seats open</p>
            </div>
            <div className="yl-map-teaser-card yl-map-teaser-card-offset">
              <div className="yl-map-teaser-pin yl-map-teaser-pin-alt" />
              <p className="yl-map-teaser-card-title">Community Tech Hub</p>
              <p className="yl-map-teaser-card-meta">Web Dev · Data Science</p>
            </div>
          </div>
        </div>
      </section>

      <section className="yl-cta-banner">
        <div>
          <h2>Ready to start learning?</h2>
          <p>Join thousands of learners building skills for tomorrow&apos;s workforce.</p>
        </div>
        <div className="yl-cta-banner-actions">
          <YlearnLink to="/courses" className="yl-btn yl-btn-hero-primary">
            Browse courses
          </YlearnLink>
          {!user && (
            <YlearnLink to="/login" className="yl-btn yl-btn-hero-secondary">
              Sign in
            </YlearnLink>
          )}
        </div>
      </section>
    </div>
  )
}
