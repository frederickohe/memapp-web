import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { adminBasePath } from '../../../../config/hosts'
import { useAuth } from '../../core/AuthContext'
import { authApi } from '../../core/services'
import { ApiError } from '../../core/utils/apiError'
import '../../styles/admin-global.css'
import '../../styles/auth-shared.css'
import './change-password.css'

export function ChangePasswordPage() {
  const base = adminBasePath()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { admin } = useAuth()

  const isForced = searchParams.get('forced') === '1'
  const adminName = admin?.full_name ?? 'Admin'

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [touched, setTouched] = useState({ current: false, new: false, confirm: false })
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const mismatch = touched.confirm && newPassword !== confirmPassword

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setTouched({ current: true, new: true, confirm: true })

    if (!currentPassword || newPassword.length < 8 || newPassword !== confirmPassword) return

    setSubmitting(true)
    setErrorMessage(null)

    try {
      await authApi.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      })
      setSuccess(true)
      setTimeout(() => navigate(`${base}/dashboard`), 1400)
    } catch (err) {
      setErrorMessage(
        err instanceof ApiError ? err.message : 'Unable to change password. Please try again.',
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
            <div className="auth-logo-text">
              <span className="logo-volt">Ymca</span>
              <span className="logo-go"> Admin</span>
            </div>
          </div>
          <p className="auth-tag">Admin Portal</p>
        </div>

        {!success ? (
          <>
            <h1 className="auth-title">{isForced ? 'Set a new password' : 'Change your password'}</h1>
            {isForced ? (
              <p className="auth-sub">
                Hi {adminName}, your account requires a password reset before you continue.
              </p>
            ) : (
              <p className="auth-sub">Update the password used to sign in to the admin portal.</p>
            )}

            {errorMessage && (
              <div className="auth-alert auth-alert-error">
                <i className="ri-error-warning-line" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={(e) => void submit(e)} noValidate>
              <div className="form-group">
                <label className="form-label" htmlFor="current_password">
                  Current Password
                </label>
                <input
                  id="current_password"
                  type="password"
                  className="form-input"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, current: true }))}
                  autoComplete="current-password"
                  placeholder="Enter current password"
                />
                {touched.current && !currentPassword && (
                  <p className="field-error">Current password is required.</p>
                )}
              </div>

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
                <span>{submitting ? 'Updating...' : 'Update Password'}</span>
              </button>

              {!isForced && (
                <button
                  type="button"
                  className="btn-link-skip"
                  onClick={() => navigate(`${base}/dashboard`)}
                >
                  Cancel
                </button>
              )}
            </form>
          </>
        ) : (
          <div className="success-box">
            <i className="ri-checkbox-circle-fill" />
            <h2>Password updated</h2>
            <p>Taking you to the dashboard...</p>
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
      `}</style>
    </div>
  )
}
