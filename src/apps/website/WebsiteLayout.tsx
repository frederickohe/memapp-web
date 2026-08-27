import { Link, Outlet, useLocation } from 'react-router-dom'
import styles from './WebsiteLayout.module.css'

export function WebsiteLayout() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  return (
    <div className={styles.shell}>
      {!isHome && (
        <header className={styles.header}>
          <Link to="/" className={styles.brand}>
            <img src="/ymca-logo.png" alt="" className={styles.brandMark} />
            <span>YMCA App</span>
          </Link>
          <nav className={styles.nav}>
            <Link to="/">Home</Link>
            <a href="#programs">Programs</a>
            <a href="#membership">Membership</a>
          </nav>
        </header>
      )}
      <main className={styles.main}>
        <Outlet />
      </main>
      {!isHome && (
        <footer className={styles.footer}>
          <p>YMCA App — ymemberapp.com</p>
        </footer>
      )}
    </div>
  )
}
