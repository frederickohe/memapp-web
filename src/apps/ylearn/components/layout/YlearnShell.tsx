import { Link, NavLink } from 'react-router-dom'
import { ylearnBasePath } from '../../../../config/hosts'
import { useYlearnAuth } from '../../core/AuthContext'

const learnerLinks = [
  { path: '', label: 'Home' },
  { path: 'dashboard', label: 'Dashboard' },
  { path: 'courses', label: 'All Courses' },
  { path: 'enrolments', label: 'My Enrolments' },
  { path: 'map', label: 'Find Centres' },
]

const adminLinks = [
  { path: 'admin', label: 'Dashboard' },
  { path: 'admin/courses', label: 'Courses' },
  { path: 'admin/users', label: 'Users' },
  { path: 'admin/providers', label: 'Providers' },
  { path: '', label: 'Public home' },
  { path: 'courses', label: 'Catalogue' },
  { path: 'map', label: 'Find Centres' },
]

export function YlearnShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useYlearnAuth()
  const base = ylearnBasePath()
  const links = user?.role === 'admin' ? adminLinks : learnerLinks

  return (
    <div className="yl-shell">
      <aside className="yl-sidebar">
        <Link to={base} className="yl-sidebar-brand">
          <img src="/ymca-logo.png" alt="" className="yl-sidebar-logo" />
          <div>
            <p>YMCA</p>
            <h1>E-Learning</h1>
          </div>
        </Link>
        <nav className="yl-nav">
          {user
            ? links.map((l) => (
                <NavLink
                  key={l.path || 'home'}
                  to={l.path ? `${base}/${l.path}` : base}
                  end={l.path === '' || l.path === 'admin' || l.path === 'dashboard'}
                >
                  {l.label}
                </NavLink>
              ))
            : (
              <>
                <NavLink to={base} end>Home</NavLink>
                <NavLink to={`${base}/courses`}>Courses</NavLink>
                <NavLink to={`${base}/map`}>Find Centres</NavLink>
                <NavLink to={`${base}/login`}>Login</NavLink>
              </>
            )}
        </nav>
        {user && (
          <div className="yl-sidebar-footer">
            <p>{user.username}</p>
            <p className="yl-role">{user.role}</p>
            <button type="button" className="yl-sign-out" onClick={() => void logout()}>
              Sign out
            </button>
          </div>
        )}
      </aside>
      <main className="yl-main">{children}</main>
    </div>
  )
}

export function YlearnLink({
  to,
  children,
  className = '',
  style,
}: {
  to: string
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  const base = ylearnBasePath()
  const href = to.startsWith('/') ? `${base}${to}` : `${base}/${to}`
  return (
    <Link to={href} className={className} style={style}>
      {children}
    </Link>
  )
}
