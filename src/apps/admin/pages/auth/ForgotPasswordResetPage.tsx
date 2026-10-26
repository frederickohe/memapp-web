import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { adminBasePath } from '../../../../config/hosts'
import { authApi } from '../../core/services'
import { ApiError } from '../../core/utils/apiError'
import '../../styles/admin-global.css'
import '../../styles/auth-shared.css'
import './change-password.css'

type LocationState = {
  resetToken?: string
  phone?: string
}

export function ForgotPasswordResetPage() {
  const base = adminBasePath()
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state || {}) as LocationState
  const resetToken = state.resetToken || ''

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [touched, setTouched] = useState({ new: false, confirm: false })
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  if (!resetToken) {
    return <Navigate to={`${base}/forgot-password`} replace />
  }

  const mismatch = touched.confirm && newPassword !== confirmPassword

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setTouched({ new: true, confirm: true })
    if (newPassword.length < 8 || newPassword !== confirmPassword) return

    setSubmitting(true)
    setErrorMessage(null)

    try {
      await authApi.completePasswordReset({
        reset_token: resetToken,
        new_password: newPassword,
      })
      setSuccess(true)
      setTimeout(() => navigate(`${base}/login`), 1400)
    } catch (err) {
      setErrorMessage(
        err instanceof ApiError ? err.message : 'Unable to update password. Please try again.',
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

        {!success ? (
          <>
            <h1 className="auth-title">Choose a new password</h1>
            <p className="auth-sub">Set a new password for your admin account, then sign in.</p>

            {errorMessage && (
              <div className="auth-alert auth-alert-error">
                <i className="ri-error-warning-line" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={(e) => void submit(e)} noValidate>
              <div className="form-group">
                <label className="form-label" htmlFor="new_password">
                  New Password
                </label>
                <input
                  id="new_password"
                  type="password"
                  className="form-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, new: true }))}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                />
                {touched.new && newPassword.length < 8 && (
                  <p className="field-error">New password must be at least 8 characters.</p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="confirm_password">
                  Confirm New Password
                </label>
                <input
                  id="confirm_password"
                  type="password"
                  className="form-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
                  autoComplete="new-password"
                  placeholder="Re-enter new password"
                />
                {mismatch && <p className="field-error">Passwords do not match.</p>}
              </div>

              <button type="submit" className="btn-dark auth-submit" disabled={submitting}>
                {submitting && <i className="ri-loader-4-line spin" />}
                <span>{submitting ? 'Updating...' : 'Update password'}</span>
              </button>
            </form>

            <p className="auth-footnote">
              <Link to={`${base}/login`} className="auth-inline-link">
                Back to sign in
              </Link>
            </p>
          </>
        ) : (
          <div className="success-box">
            <i className="ri-checkbox-circle-fill" />
            <h2>Password updated</h2>
            <p>Taking you to sign in...</p>
          </div>
        )}
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
