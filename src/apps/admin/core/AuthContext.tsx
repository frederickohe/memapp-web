import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { adminBasePath } from '../../../config/hosts'
import { setUnauthorizedHandler } from './apiClient'
import type { AdminLoginRequest, AdminProfile } from './models'
import { authApi, roleApi } from './services'
import { storage } from './utils/storage'

interface AuthContextValue {
  token: string | null
  admin: AdminProfile | null
  isAuthenticated: boolean
  isSuperAdmin: boolean
  permissionsLoaded: boolean
  hasPermission: (name: string) => boolean
  hasAnyPermission: (names: string[]) => boolean
  login: (payload: AdminLoginRequest) => Promise<{ resetRequired: boolean }>
  logout: () => Promise<void>
  logoutLocally: () => void
  loadPermissions: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const base = adminBasePath()

  const [token, setToken] = useState<string | null>(() => storage.getItem('token'))
  const [admin, setAdmin] = useState<AdminProfile | null>(() => storage.getJson<AdminProfile>('admin'))
  const [permissionNames, setPermissionNames] = useState<Set<string>>(new Set())
  const [permissionsLoaded, setPermissionsLoaded] = useState(false)

  const isSuperAdmin = useMemo(() => {
    const role = admin?.role?.name?.toLowerCase() ?? ''
    return role === 'super_admin' || role === 'super admin'
  }, [admin])

  const clearSession = useCallback(() => {
    setToken(null)
    setAdmin(null)
    setPermissionNames(new Set())
    setPermissionsLoaded(false)
    storage.removeItem('token')
    storage.removeItem('refresh_token')
    storage.removeItem('admin')
  }, [])

  const loadPermissions = useCallback(async () => {
    const roleId = admin?.role?.id
    if (!roleId) {
      setPermissionNames(new Set())
      setPermissionsLoaded(true)
      return
    }

    try {
      const role = await roleApi.getRole(roleId, true)
      setPermissionNames(new Set((role.permissions ?? []).map((p) => p.name)))
    } catch {
      setPermissionNames(new Set())
    } finally {
      setPermissionsLoaded(true)
    }
  }, [admin?.role?.id])

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession()
      navigate(`${base}/login?sessionExpired=1`, { replace: true })
    })
  }, [base, clearSession, navigate])

  useEffect(() => {
    if (token && admin && !permissionsLoaded) {
      void loadPermissions()
    }
  }, [token, admin, permissionsLoaded, loadPermissions])

  // Restore admin profile from the backend when a token exists without cached profile data.
  useEffect(() => {
    if (!token || admin) return

    let cancelled = false

    void authApi
      .me()
      .then((profile) => {
        if (cancelled) return
        setAdmin(profile)
        storage.setJson('admin', profile)
        setPermissionsLoaded(false)
      })
      .catch(() => {
        if (!cancelled) clearSession()
      })

    return () => {
      cancelled = true
    }
  }, [token, admin, clearSession])

  const applySession = useCallback((data: { token: string; admin: AdminProfile }) => {
    setToken(data.token)
    setAdmin(data.admin)
    storage.setItem('token', data.token)
    storage.setJson('admin', data.admin)
    setPermissionsLoaded(false)
  }, [])

  const login = useCallback(async (payload: AdminLoginRequest) => {
    const data = await authApi.login(payload)
    applySession(data)

    try {
      const role = await roleApi.getRole(data.admin.role.id, true)
      setPermissionNames(new Set((role.permissions ?? []).map((p) => p.name)))
    } catch {
      setPermissionNames(new Set())
    } finally {
      setPermissionsLoaded(true)
    }

    return { resetRequired: data.admin.reset_required }
  }, [applySession])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      // ignore when backend is unavailable
    }
    clearSession()
  }, [clearSession])

  const hasPermission = useCallback(
    (name: string) => isSuperAdmin || permissionNames.has(name),
    [isSuperAdmin, permissionNames],
  )

  const hasAnyPermission = useCallback(
    (names: string[]) => isSuperAdmin || names.some((name) => permissionNames.has(name)),
    [isSuperAdmin, permissionNames],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      admin,
      isAuthenticated: !!token,
      isSuperAdmin,
      permissionsLoaded,
      hasPermission,
      hasAnyPermission,
      login,
      logout,
      logoutLocally: clearSession,
      loadPermissions,
    }),
    [
      token,
      admin,
      isSuperAdmin,
      permissionsLoaded,
      hasPermission,
      hasAnyPermission,
      login,
      logout,
      clearSession,
      loadPermissions,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
