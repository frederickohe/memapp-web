import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { adminBasePath } from '../../../../config/hosts'
import { useAuth } from '../../core/AuthContext'
import { TwoFactorRequiredError } from '../../core/services'
import { ApiError } from '../../core/utils/apiError'
import '../../styles/admin-global.css'
import '../../styles/auth-shared.css'

export function LoginPage() {
  const base = adminBasePath()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login, completeTwoFactor } = useAuth()

  const sessionExpired = searchParams.get('sessionExpired') === '1'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [challengeToken, setChallengeToken] = useState<string | null>(null)
  const [destination, setDestination] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [touched, setTouched] = useState({ email: false, password: false })

  const emailInvalid = touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const passwordInvalid = touched.password && !password

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setTouched({ email: true, password: true })

    if (challengeToken) {
      if (otp.trim().length !== 5) {
        setErrorMessage('Enter the 5-digit verification code.')
        return
      }
    } else if (!email || !password || emailInvalid) return

    setSubmitting(true)
    setErrorMessage(null)

    try {
      const { resetRequired } = challengeToken
        ? await completeTwoFactor(challengeToken, otp.trim())
        : await login({ email, password })
      if (resetRequired) {
        navigate(`${base}/change-password?forced=1`)
      } else {
        navigate(`${base}/dashboard`)
      }
    } catch (err) {
      if (err instanceof TwoFactorRequiredError) {
        setChallengeToken(err.challengeToken)
        setDestination(err.destination)
        setOtp('')
        return
      }
      setErrorMessage(err instanceof ApiError ? err.message : 'Unable to sign in. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="admin-app auth-shell">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <img src="/ymca-logo.png" alt="YMCA App" className="auth-logo-img" />
            <div className="auth-logo-text">
              <span className="logo-volt">YMCA</span>
              <span className="logo-go"> Admin</span>
            </div>
          </div>
          <p className="auth-tag">Admin Portal</p>
        </div>

        <h1 className="auth-title">{challengeToken ? 'Check your code' : 'Welcome back'}</h1>
        <p className="auth-sub">
          {challengeToken
            ? `Enter the 5-digit code sent to ${destination || 'you'}.`
            : 'Sign in to manage members, programs, and operations.'}
        </p>

        {sessionExpired && (
          <div className="auth-alert auth-alert-info">
            <i className="ri-time-line" />
            <span>Your session expired. Please sign in again.</span>
          </div>
        )}

        {errorMessage && (
          <div className="auth-alert auth-alert-error">
            <i className="ri-error-warning-line" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={(e) => void submit(e)} noValidate>
          {challengeToken ? (
            <div className="form-group">
              <label className="form-label" htmlFor="otp">
                Verification code
              </label>
              <input
                id="otp"
                inputMode="numeric"
                autoComplete="one-time-code"
                className="form-input"
                placeholder="5-digit code"
                value={otp}
                maxLength={5}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 5))}
              />
              <button
                type="button"
                className="auth-back-link"
                onClick={() => {
                  setChallengeToken(null)
                  setOtp('')
                  setErrorMessage(null)
                }}
              >
                Use a different account
              </button>
            </div>
          ) : (
          <>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className={`form-input${emailInvalid ? ' input-error' : ''}`}
              placeholder="admin@ymemberapp.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              autoComplete="username"
            />
            {emailInvalid && <p className="field-error">Enter a valid email address.</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <div className="password-wrap">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className={`form-input${passwordInvalid ? ' input-error' : ''}`}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
              >
                <i className={showPassword ? 'ri-eye-off-line' : 'ri-eye-line'} />
              </button>
            </div>
            {passwordInvalid && <p className="field-error">Password is required.</p>}
          </div>
          </>
          )}

          <button type="submit" className="btn-dark auth-submit" disabled={submitting}>
            {submitting && <i className="ri-loader-4-line spin" />}
            <span>{submitting ? 'Signing in...' : 'Sign In'}</span>
          </button>
        </form>

        <p className="auth-footnote">
          <i className="ri-shield-keyhole-line" />
          Access is restricted to authorized administrators.
        </p>
      </div>

      <style>{`
        .auth-logo-text {
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.5px;
        }
        .logo-volt { color: #111111; }
        .logo-go { color: #ed1c24; }
        .auth-back-link {
          margin-top: 12px;
          padding: 0;
          border: 0;
          background: none;
          color: #6b6c6e;
          font-size: 13px;
          cursor: pointer;
        }
      `}</style>
    </div>
  )
}
