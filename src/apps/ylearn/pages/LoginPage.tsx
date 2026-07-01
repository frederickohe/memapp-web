import { YlearnLink } from '../components/layout/YlearnShell'
import { AuthForm } from '../components/auth/AuthForm'

export function LoginPage() {
  return (
    <div>
      <p className="text-muted" style={{ marginBottom: '1rem' }}>Sign in with your YMCA member or admin account.</p>
      <AuthForm />
      <p className="text-muted" style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.875rem' }}>
        Need an account?{' '}
        <YlearnLink to="/register" className="yl-link">
          How to get started
        </YlearnLink>
      </p>
    </div>
  )
}
