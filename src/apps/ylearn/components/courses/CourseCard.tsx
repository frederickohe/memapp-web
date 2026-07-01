import { YlearnLink } from '../layout/YlearnShell'
import { getCourseImage } from '../../core/data/courseMedia'
import type { Course } from '../../core/types'

export function CourseCard({
  course,
  showImage = false,
}: {
  course: Course
  showImage?: boolean
}) {
  const full = (course.seatsRemaining ?? 0) <= 0
  const imageUrl = getCourseImage(course.subject, course.name)

  return (
    <article className={`yl-course-card${showImage ? ' yl-course-card-with-image' : ''}`}>
      {showImage && (
        <YlearnLink to={`/courses/${course.id}`} className="yl-course-card-image-link">
          <img src={imageUrl} alt="" className="yl-course-card-image" />
          <span className="yl-course-card-subject">{course.subject}</span>
        </YlearnLink>
      )}
      <div className="yl-course-card-body">
        <div className="yl-flex-between" style={{ marginBottom: '0.75rem' }}>
          <div>
            <h3 className="yl-course-card-title">{course.name}</h3>
            <p className="text-muted yl-course-card-provider">{course.providerName}</p>
          </div>
          <span className="yl-level-pill">{course.level}</span>
        </div>
        <dl className="yl-course-card-meta">
          <div>
            <dt>Start</dt>
            <dd>{new Date(course.startTime).toLocaleDateString()}</dd>
          </div>
          <div>
            <dt>Fees</dt>
            <dd>£{course.fees.toFixed(2)}</dd>
          </div>
          <div>
            <dt>Seats</dt>
            <dd>
              {course.enrolledCount}/{course.maxCapacity}
              {full && <span className="yl-course-full">Full</span>}
            </dd>
          </div>
          {!showImage && (
            <div>
              <dt>Subject</dt>
              <dd>{course.subject}</dd>
            </div>
          )}
        </dl>
        <YlearnLink to={`/courses/${course.id}`} className="yl-btn yl-btn-primary yl-course-card-btn">
          View course
        </YlearnLink>
      </div>
    </article>
  )
}
