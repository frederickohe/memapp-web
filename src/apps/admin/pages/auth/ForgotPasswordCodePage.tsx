import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { adminBasePath } from '../../../../config/hosts'
import { authApi } from '../../core/services'
import { ApiError } from '../../core/utils/apiError'
import '../../styles/admin-global.css'
import '../../styles/auth-shared.css'

type LocationState = {
  phone?: string
  destination?: string
}

export function ForgotPasswordCodePage() {
  const base = adminBasePath()
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state || {}) as LocationState
  const phone = state.phone?.trim() || ''
  const destination = state.destination || ''

  const [otp, setOtp] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [resending, setResending] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  if (!phone) {
    return <Navigate to={`${base}/forgot-password`} replace />
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (otp.trim().length !== 5) {
      setErrorMessage('Enter the 5-digit verification code.')
      return
    }

    setSubmitting(true)
    setErrorMessage(null)

    try {
      const response = await authApi.verifyPasswordResetOtp({ phone, otp: otp.trim() })
      navigate(`${base}/forgot-password/reset`, {
        state: { resetToken: response.reset_token, phone },
        replace: true,
      })
    } catch (err) {
      setErrorMessage(
        err instanceof ApiError ? err.message : 'Invalid or expired code. Please try again.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  const resend = async () => {
    setResending(true)
    setErrorMessage(null)
    try {
      await authApi.requestPasswordReset({ phone })
    } catch (err) {
      setErrorMessage(
        err instanceof ApiError ? err.message : 'Could not resend code. Please try again.',
      )
    } finally {
      setResending(false)
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

        <h1 className="auth-title">Enter reset code</h1>
        <p className="auth-sub">
          We sent a 5-digit code to {destination || 'your phone'}. Enter it below to continue.
        </p>

        {errorMessage && (
          <div className="auth-alert auth-alert-error">
            <i className="ri-error-warning-line" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={(e) => void submit(e)} noValidate>
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
          </div>

          <button type="submit" className="btn-dark auth-submit" disabled={submitting}>
            {submitting && <i className="ri-loader-4-line spin" />}
            <span>{submitting ? 'Verifying...' : 'Verify code'}</span>
          </button>
        </form>

        <button type="button" className="btn-link-skip" onClick={() => void resend()} disabled={resending}>
          {resending ? 'Resending...' : 'Resend code'}
        </button>

        <p className="auth-footnote">
          <Link to={`${base}/forgot-password`} className="auth-inline-link">
            Use a different number
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
