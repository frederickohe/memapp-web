import { Link, Outlet } from 'react-router-dom'
import { adminBasePath } from '../../config/hosts'
import styles from './AdminLayout.module.css'

export function AdminLayout() {
  const base = adminBasePath()

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.brandMark}>Y</span>
          <div>
            <strong>Ymca Admin</strong>
            <p>Member App</p>
          </div>
        </div>
        <nav className={styles.nav}>
          <Link to={base || '/'}>Dashboard</Link>
          <Link to={`${base}/members`}>Members</Link>
          <Link to={`${base}/programs`}>Programs</Link>
          <Link to={`${base}/forms`}>Forms</Link>
        </nav>
      </aside>
      <div className={styles.content}>
        <header className={styles.topbar}>
          <h1>Administration</h1>
          <span className={styles.badge}>admin.ymemberapp.com</span>
        </header>
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
