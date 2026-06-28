import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { adminBasePath } from '../../config/hosts'
import { useAuth } from './core/AuthContext'

export function RequireAuth() {
  const { isAuthenticated } = useAuth()
  const base = adminBasePath()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to={`${base}/login`} replace state={{ from: location }} />
  }

  return <Outlet />
}

export function RequireGuest() {
  const { isAuthenticated } = useAuth()
  const base = adminBasePath()

  if (isAuthenticated) {
    return <Navigate to={`${base}/dashboard`} replace />
  }

  return <Outlet />
}
