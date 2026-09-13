import { Link, Outlet, useLocation } from 'react-router-dom'
import { ylearnPortalUrl } from '../../config/hosts'
import { legalPaths } from '../../config/legal'
import styles from './WebsiteLayout.module.css'

export function WebsiteLayout() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'
  const ylearnUrl = ylearnPortalUrl()

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
            <a href={ylearnUrl}>Learning Portal</a>
            <Link to={legalPaths.privacy}>Privacy</Link>
            <Link to={legalPaths.terms}>Terms</Link>
          </nav>
        </header>
      )}
      <main className={styles.main}>
        <Outlet />
      </main>
      {!isHome && (
        <footer className={styles.footer}>
          <p>YMCA App — ymemberapp.com</p>
          <nav className={styles.footerLinks}>
            <Link to={legalPaths.privacy}>Privacy Policy</Link>
            <Link to={legalPaths.terms}>Terms of Use</Link>
            <Link to={legalPaths.accountDeletion}>Account Deletion</Link>
            <a href={ylearnUrl}>Learning Portal</a>
          </nav>
        </footer>
      )}
    </div>
  )
}
