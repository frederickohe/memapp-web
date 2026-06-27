import { API_BASE_URL } from '../../../config/env'
import styles from './DashboardPage.module.css'

const stats = [
  { label: 'Active members', value: '—' },
  { label: 'Open programs', value: '—' },
  { label: 'Pending forms', value: '—' },
  { label: 'News posts', value: '—' },
]

export function DashboardPage() {
  return (
    <section className={styles.page}>
      <p className={styles.lead}>
        Admin dashboard for the Ymca Member App. Connect this UI to{' '}
        <code>{API_BASE_URL}</code> as backend endpoints are finalized.
      </p>
      <div className={styles.grid}>
        {stats.map((item) => (
          <article key={item.label} className={styles.card}>
            <p>{item.label}</p>
            <strong>{item.value}</strong>
          </article>
        ))}
      </div>
    </section>
  )
}
