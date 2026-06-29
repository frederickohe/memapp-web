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
            <span className={styles.brandMark}>Y</span>
            <span>YMCA Member App</span>
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
          <p>Ymca Member App — ymemberapp.com</p>
        </footer>
      )}
    </div>
  )
}
