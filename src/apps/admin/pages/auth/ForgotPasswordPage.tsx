import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { adminBasePath } from '../../../../config/hosts'
import { authApi } from '../../core/services'
import { ApiError } from '../../core/utils/apiError'
import '../../styles/admin-global.css'
import '../../styles/auth-shared.css'

export function ForgotPasswordPage() {
  const base = adminBasePath()
  const navigate = useNavigate()

  const [phone, setPhone] = useState('')
  const [touched, setTouched] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const phoneInvalid = touched && phone.trim().length < 7

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setTouched(true)
    const trimmed = phone.trim()
    if (trimmed.length < 7) return

    setSubmitting(true)
    setErrorMessage(null)

    try {
      const response = await authApi.requestPasswordReset({ phone: trimmed })
      navigate(`${base}/forgot-password/code`, {
        state: {
          phone: trimmed,
          destination: response.destination || '',
        },
      })
    } catch (err) {
      setErrorMessage(
        err instanceof ApiError ? err.message : 'Unable to send reset code. Please try again.',
      )
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

        <h1 className="auth-title">Reset your password</h1>
        <p className="auth-sub">
          Enter the phone number on your admin account. We will send a 5-digit reset code by SMS.
        </p>

        {errorMessage && (
          <div className="auth-alert auth-alert-error">
            <i className="ri-error-warning-line" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={(e) => void submit(e)} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="phone">
              Phone number
            </label>
            <input
              id="phone"
              type="tel"
              className={`form-input${phoneInvalid ? ' input-error' : ''}`}
              placeholder="+233XXXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onBlur={() => setTouched(true)}
              autoComplete="tel"
            />
            {phoneInvalid && <p className="field-error">Enter a valid phone number.</p>}
          </div>

          <button type="submit" className="btn-dark auth-submit" disabled={submitting}>
            {submitting && <i className="ri-loader-4-line spin" />}
            <span>{submitting ? 'Sending...' : 'Send reset code'}</span>
          </button>
        </form>

        <p className="auth-footnote">
          <Link to={`${base}/login`} className="auth-inline-link">
            Back to sign in
          </Link>
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
        .auth-inline-link {
          color: #ed1c24;
          font-weight: 600;
          text-decoration: none;
        }
        .auth-inline-link:hover { text-decoration: underline; }
      `}</style>
    </div>
  )
}
