import styles from './HomePage.module.css'

export function HomePage() {
  return (
    <section className={styles.hero}>
      <div>
        <p className={styles.eyebrow}>Ymca Member App</p>
        <h1>Your membership, programs, and community in one place.</h1>
        <p className={styles.lead}>
          Browse programs, manage your membership, and stay connected with your
          local YMCA branch.
        </p>
        <div className={styles.actions}>
          <a className={styles.primary} href="#membership">
            Get started
          </a>
          <a className={styles.secondary} href="#programs">
            Explore programs
          </a>
        </div>
      </div>
      <div className={styles.panel}>
        <h2>What you can do</h2>
        <ul>
          <li>Register for classes and activities</li>
          <li>Track membership and payments</li>
          <li>Receive news and announcements</li>
          <li>Complete forms and enrollments online</li>
        </ul>
      </div>
    </section>
  )
}
