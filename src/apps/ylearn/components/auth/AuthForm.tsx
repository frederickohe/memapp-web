import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ylearnBasePath } from '../../../../config/hosts'
import { useYlearnAuth } from '../../core/AuthContext'
import { TwoFactorRequiredError } from '../../core/services'
import { Button } from '../ui/Button'

export function AuthForm() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, completeTwoFactor } = useYlearnAuth()
  const [challengeToken, setChallengeToken] = useState<string | null>(null)
  const [destination, setDestination] = useState('')
  const [otp, setOtp] = useState('')
  const navigate = useNavigate()
  const base = ylearnBasePath()

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const data = new FormData(e.currentTarget)
    const email = String(data.get('email') || '')
    const password = String(data.get('password') || '')

    try {
      const profile = challengeToken
        ? await completeTwoFactor(challengeToken, otp.trim())
        : await login(email, password)
      navigate(profile.role === 'admin' ? `${base}/admin` : `${base}/dashboard`)
    } catch (err) {
      if (err instanceof TwoFactorRequiredError) {
        setChallengeToken(err.challengeToken)
        setDestination(err.destination)
        setOtp('')
        setError('')
        return
      }
      setError(
        challengeToken
          ? 'That code is invalid or expired. Try again.'
          : 'Invalid email or password. Use your YMCA member or admin account.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="yl-card yl-form">
      {challengeToken ? (
        <div className="yl-form-group">
          <label className="yl-label">Verification code</label>
          <input
            value={otp}
            onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 5))}
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            minLength={5}
            maxLength={5}
            className="yl-input"
            placeholder={destination ? `Code sent to ${destination}` : '5-digit code'}
          />
        </div>
      ) : (
        <>
          <div className="yl-form-group">
            <label className="yl-label">Email</label>
            <input name="email" type="email" required className="yl-input" autoComplete="username" />
          </div>
          <div className="yl-form-group">
            <label className="yl-label">Password</label>
            <input name="password" type="password" required minLength={8} className="yl-input" autoComplete="current-password" />
          </div>
        </>
      )}
      {error && <p className="yl-error">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Please wait…' : 'Sign in'}
      </Button>
      <p className="text-muted" style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
        Sign in with the same email and password you use for the YMCA App.
      </p>
    </form>
  )
}
