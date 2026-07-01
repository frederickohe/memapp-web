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
import { ylearnBasePath } from '../../../config/hosts'
import { loadAppConfig } from './appConfig'
import { setUnauthorizedHandler } from './apiClient'
import { ylearnAuthApi } from './services'
import type { UserProfile, UserRole } from './types'
import { storage } from './utils/storage'

interface AuthContextValue {
  user: UserProfile | null
  loading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<UserProfile>
  logout: () => Promise<void>
  requireRole: (role?: UserRole) => UserProfile | null
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function YlearnAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => storage.getJson<UserProfile>('user'))
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const base = ylearnBasePath()

  const clearSession = useCallback(() => {
    storage.removeItem('token')
    storage.removeItem('refresh_token')
    storage.removeItem('user')
    setUser(null)
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession()
      navigate(`${base}/login`, { replace: true })
    })
  }, [base, clearSession, navigate])

  useEffect(() => {
    void loadAppConfig().finally(async () => {
      const token = storage.getItem('token')
      if (!token) {
        setLoading(false)
        return
      }
      try {
        const profile = await ylearnAuthApi.me()
        setUser(profile)
        storage.setJson('user', profile)
      } catch {
        clearSession()
      } finally {
        setLoading(false)
      }
    })
  }, [clearSession])

  const login = useCallback(async (email: string, password: string) => {
    const profile = await ylearnAuthApi.login({ email, password })
    setUser(profile)
    return profile
  }, [])

  const logout = useCallback(async () => {
    await ylearnAuthApi.logout()
    clearSession()
  }, [clearSession])

  const requireRole = useCallback(
    (role?: UserRole) => {
      if (!user) return null
      if (role && user.role !== role) return null
      return user
    },
    [user],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: !!user && !!storage.getItem('token'),
      login,
      logout,
      requireRole,
    }),
    [user, loading, login, logout, requireRole],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useYlearnAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useYlearnAuth must be used within YlearnAuthProvider')
  return ctx
}
