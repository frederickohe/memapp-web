import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ylearnBasePath } from '../../../../config/hosts'
import { useYlearnAuth } from '../../core/AuthContext'
import { Button } from '../ui/Button'

export function AuthForm() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useYlearnAuth()
  const navigate = useNavigate()
  const base = ylearnBasePath()

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const data = new FormData(e.currentTarget)
    const email = String(data.get('email'))
    const password = String(data.get('password'))

    try {
      const profile = await login(email, password)
      navigate(profile.role === 'admin' ? `${base}/admin` : `${base}/dashboard`)
    } catch {
      setError('Invalid email or password. Use your YMCA member or admin account.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="yl-card yl-form">
      <div className="yl-form-group">
        <label className="yl-label">Email</label>
        <input name="email" type="email" required className="yl-input" autoComplete="username" />
      </div>
      <div className="yl-form-group">
        <label className="yl-label">Password</label>
        <input name="password" type="password" required minLength={8} className="yl-input" autoComplete="current-password" />
      </div>
      {error && <p className="yl-error">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Please wait…' : 'Sign in'}
      </Button>
      <p className="text-muted" style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
        Sign in with the same email and password you use for the YMCA Member App.
      </p>
    </form>
  )
}
