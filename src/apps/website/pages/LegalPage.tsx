import type { ReactNode } from 'react'
import styles from './LegalPage.module.css'

type LegalPageProps = {
  title: string
  updated: string
  children: ReactNode
}

export function LegalPage({ title, updated, children }: LegalPageProps) {
  return (
    <article className={styles.page}>
      <p className={styles.kicker}>YMCA Ghana Member App</p>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.updated}>Last updated {updated}</p>
      {children}
    </article>
  )
}

export function LegalSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className={styles.section}>
      <h2>{title}</h2>
      {children}
    </section>
  )
}

export { styles as legalStyles }
