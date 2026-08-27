import { YlearnLink } from '../components/layout/YlearnShell'

export function RegisterPage() {
  return (
    <div className="yl-card yl-form">
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>YMCA account required</h2>
      <p className="text-muted" style={{ marginBottom: '1rem' }}>
        E-Learn uses your existing YMCA App account. Create a member profile in the YMCA app first,
        then return here to sign in and enrol in courses.
      </p>
      <YlearnLink to="/login" className="yl-btn yl-btn-primary" style={{ display: 'inline-flex' }}>
        Go to sign in
      </YlearnLink>
    </div>
  )
}
