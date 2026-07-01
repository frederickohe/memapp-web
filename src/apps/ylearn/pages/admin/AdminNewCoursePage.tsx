import { useEffect, useState } from 'react'
import { listProviders } from '../../core/data/courses'
import type { Provider } from '../../core/types'
import { CourseForm } from '../../components/admin/CourseForm'
import { YlearnLink } from '../../components/layout/YlearnShell'

export function AdminNewCoursePage() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void listProviders()
      .then(setProviders)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="yl-loading">Loading…</div>

  if (providers.length === 0) {
    return (
      <p className="text-muted">
        Create a provider first on the{' '}
        <YlearnLink to="/admin/providers" className="yl-link">Providers</YlearnLink> page.
      </p>
    )
  }

  return (
    <div>
      <h2 className="yl-page-title">Create course</h2>
      <CourseForm providers={providers} />
    </div>
  )
}
