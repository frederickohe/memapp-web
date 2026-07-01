import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { ylearnBasePath } from '../../config/hosts'
import { useYlearnAuth } from './core/AuthContext'
import { YlearnShell } from './components/layout/YlearnShell'

export function RequireYlearnAuth() {
  const { isAuthenticated, loading } = useYlearnAuth()
  const base = ylearnBasePath()
  const location = useLocation()

  if (loading) {
    return <div className="yl-loading">Loading…</div>
  }

  if (!isAuthenticated) {
    return <Navigate to={`${base}/login`} replace state={{ from: location }} />
  }

  return (
    <YlearnShell>
      <Outlet />
    </YlearnShell>
  )
}

export function RequireYlearnGuest() {
  const { isAuthenticated, user, loading } = useYlearnAuth()
  const base = ylearnBasePath()

  if (loading) {
    return <div className="yl-loading">Loading…</div>
  }

  if (isAuthenticated) {
    const dest = user?.role === 'admin' ? `${base}/admin` : `${base}/dashboard`
    return <Navigate to={dest} replace />
  }

  return <Outlet />
}

export function RequireYlearnLearner() {
  const { user, loading } = useYlearnAuth()
  const base = ylearnBasePath()

  if (loading) {
    return <div className="yl-loading">Loading…</div>
  }

  if (!user || user.role !== 'learner') {
    return <Navigate to={`${base}/login`} replace />
  }

  return <Outlet />
}

export function RequireYlearnAdmin() {
  const { user, loading } = useYlearnAuth()
  const base = ylearnBasePath()

  if (loading) {
    return <div className="yl-loading">Loading…</div>
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to={`${base}/login`} replace />
  }

  return <Outlet />
}

export function YlearnPublicLayout() {
  return (
    <YlearnShell>
      <Outlet />
    </YlearnShell>
  )
}
