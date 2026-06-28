import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { adminBasePath } from '../../config/hosts'
import { ADMIN_NAV, ADMIN_PAGE_TITLES } from './adminNav'
import { useAuth } from './core/AuthContext'
import './styles/admin-global.css'
import './styles/layout.css'

export function AdminLayout() {
  const base = adminBasePath()
  const location = useLocation()
  const navigate = useNavigate()
  const { admin, logout, logoutLocally } = useAuth()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState<'sidebar' | 'topbar' | null>(null)
  const [loggingOut, setLoggingOut] = useState(false)

  const segment = location.pathname.replace(base, '').split('/').filter(Boolean)[0] || 'dashboard'
  const currentTitle = ADMIN_PAGE_TITLES[segment] ?? 'Dashboard'

  const adminName = admin?.full_name ?? 'Admin'
  const adminInitial = adminName.charAt(0).toUpperCase()
  const adminRoleName = (admin?.role?.name ?? 'admin')
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

  useEffect(() => {
    setUserMenuOpen(null)
  }, [location.pathname])

  useEffect(() => {
    const close = () => setUserMenuOpen(null)
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [])

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await logout()
      navigate(`${base}/login`)
    } catch {
      logoutLocally()
      navigate(`${base}/login`)
    } finally {
      setLoggingOut(false)
    }
  }

  const navLink = (path: string) => `${base}/${path}`

  return (
    <div className="admin-app layout">
      <aside className={`sidebar${sidebarOpen ? ' sidebar-open' : ''}`}>
        <div className="sidebar-top">
          <div className="logo">
            <div className="sidebar-logo-text">
              <span className="logo-volt">Ymca</span>
              <span className="logo-go"> Admin</span>
            </div>
          </div>
          <button type="button" className="close-btn" onClick={() => setSidebarOpen(false)}>
            <i className="ri-close-line" />
          </button>
        </div>

        <nav className="nav">
          {ADMIN_NAV.map((item) => (
            <Link
              key={item.path}
              to={navLink(item.path)}
              className={`nav-item${segment === item.path ? ' nav-active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <i className={`${item.icon} nav-icon`} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div
          className="sidebar-user"
          onClick={(e) => {
            e.stopPropagation()
            setUserMenuOpen((open) => (open === 'sidebar' ? null : 'sidebar'))
          }}
        >
          <div className="avatar-initial">{adminInitial}</div>
          <div className="uinfo">
            <span className="uname">{adminName}</span>
            <span className="urole">{adminRoleName}</span>
          </div>
          <i className="ri-arrow-down-s-line" style={{ color: '#bbb', marginLeft: 'auto' }} />

          {userMenuOpen === 'sidebar' && (
            <div className="user-menu" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="user-menu-item"
                onClick={() => navigate(`${base}/change-password`)}
              >
                <i className="ri-lock-password-line" /> Change Password
              </button>
              <button
                type="button"
                className="user-menu-item user-menu-danger"
                onClick={() => void handleLogout()}
                disabled={loggingOut}
              >
                <i className="ri-logout-box-r-line" />{' '}
                {loggingOut ? 'Signing out...' : 'Sign Out'}
              </button>
            </div>
          )}
        </div>
      </aside>

      <div
        className={`overlay${sidebarOpen ? ' overlay-show' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      <main className="main">
        <header className="topbar">
          <div className="topbar-left">
            <button type="button" className="hamburger" onClick={() => setSidebarOpen(true)}>
              <i className="ri-menu-line" />
            </button>
            <h1 className="page-title">{currentTitle}</h1>
          </div>
          <div
            className="topbar-right"
            onClick={(e) => {
              e.stopPropagation()
              setUserMenuOpen((open) => (open === 'topbar' ? null : 'topbar'))
            }}
          >
            <div className="avatar-initial">{adminInitial}</div>
            <div className="uinfo">
              <span className="uname">{adminName}</span>
              <span className="urole">{adminRoleName}</span>
            </div>
            <i className="ri-arrow-down-s-line" style={{ color: '#bbb' }} />

            {userMenuOpen === 'topbar' && (
              <div className="user-menu user-menu-topbar" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  className="user-menu-item"
                  onClick={() => navigate(`${base}/change-password`)}
                >
                  <i className="ri-lock-password-line" /> Change Password
                </button>
                <button
                  type="button"
                  className="user-menu-item user-menu-danger"
                  onClick={() => void handleLogout()}
                  disabled={loggingOut}
                >
                  <i className="ri-logout-box-r-line" />{' '}
                  {loggingOut ? 'Signing out...' : 'Sign Out'}
                </button>
              </div>
            )}
          </div>
        </header>

        <Outlet />
      </main>

      <style>{`
        .sidebar-logo-text {
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.5px;
          line-height: 1.2;
        }
        .logo-volt { color: #1a1a2e; }
        .logo-go { color: #22c55e; }
      `}</style>
    </div>
  )
}
