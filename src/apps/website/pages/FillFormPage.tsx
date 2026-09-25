import { useEffect, useState, type FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { API_BASE_URL } from '../../../config/env'
import { appStoreLinks } from '../../../config/hosts'
import styles from './FillFormPage.module.css'

type GateState = 'email' | 'member' | 'download' | 'closed' | 'missing'

type PublicForm = {
  id: string
  title: string
  description: string | null
  is_active: boolean
}

const APP_SCHEME = 'memapp'

function formsApi(path: string): string {
  const base = API_BASE_URL.endsWith('/api/v1')
    ? API_BASE_URL
    : `${API_BASE_URL.replace(/\/$/, '')}/api/v1`
  return `${base}${path}`
}

function openInApp(formId: string) {
  const path = `surveys/${encodeURIComponent(formId)}`
  const schemeUrl = `${APP_SCHEME}://${path}`
  const android = /Android/i.test(navigator.userAgent)
  const target = android
    ? `intent://${path}#Intent;scheme=${APP_SCHEME};package=org.ymcaghana.memberapp;end`
    : schemeUrl
  window.location.href = target
}

export function FillFormPage() {
  const { formId = '' } = useParams()
  const [form, setForm] = useState<PublicForm | null>(null)
  const [loading, setLoading] = useState(true)
  const [missing, setMissing] = useState(false)
  const [email, setEmail] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [gate, setGate] = useState<GateState>('email')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setMissing(false)
      try {
        const response = await fetch(formsApi(`/form/public/${encodeURIComponent(formId)}`))
        if (response.status === 404) {
          if (!cancelled) setMissing(true)
          return
        }
        if (!response.ok) {
          throw new Error('Could not load this form.')
        }
        const data = (await response.json()) as PublicForm
        if (!cancelled) {
          setForm(data)
          setGate(data.is_active ? 'email' : 'closed')
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load this form.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    if (formId) void load()
    return () => {
      cancelled = true
    }
  }, [formId])

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setPending(true)
    try {
      const response = await fetch(formsApi(`/form/public/${encodeURIComponent(formId)}/check-email`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const body = await response.json().catch(() => null)
      if (!response.ok) {
        const detail = body && typeof body === 'object' && 'detail' in body ? String(body.detail) : 'Could not check that email.'
        throw new Error(detail)
      }
      const hasAccount = Boolean(body && typeof body === 'object' && 'has_account' in body && body.has_account)
      if (hasAccount) {
        setGate('member')
        openInApp(formId)
      } else {
        setGate('download')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not check that email.')
    } finally {
      setPending(false)
    }
  }

  if (loading) {
    return (
      <article className={styles.page}>
        <p className={styles.kicker}>YMCA Ghana</p>
        <h1 className={styles.title}>Loading form…</h1>
      </article>
    )
  }

  if (missing || !form) {
    return (
      <article className={styles.page}>
        <p className={styles.kicker}>YMCA Ghana</p>
        <h1 className={styles.title}>Form not found</h1>
        <p className={styles.lead}>This link does not match a form. Ask your branch for a new link.</p>
      </article>
    )
  }

  return (
    <article className={styles.page}>
      <p className={styles.kicker}>YMCA Ghana Member App</p>
      <h1 className={styles.title}>{form.title}</h1>
      <p className={styles.lead}>
        {form.description || 'This form is filled in the YMCA Ghana app.'}
      </p>

      {gate === 'closed' && (
        <section className={styles.card}>
          <h2>This form is closed</h2>
          <p>It is no longer accepting responses. Open the YMCA app to see forms that are still available.</p>
          <StoreLinks />
        </section>
      )}

      {gate === 'email' && (
        <form className={styles.card} onSubmit={onSubmit}>
          <h2>Continue with your email</h2>
          <p>Enter the email on your YMCA app account. We use it only to send you into the app, or to the download page if you do not have an account yet.</p>
          <label className={styles.label} htmlFor="form-email">
            Email
          </label>
          <input
            id="form-email"
            className={styles.input}
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@email.com"
          />
          {error && <p className={styles.error}>{error}</p>}
          <button className={styles.primary} type="submit" disabled={pending}>
            {pending ? 'Checking…' : 'Continue'}
          </button>
        </form>
      )}

      {gate === 'member' && (
        <section className={styles.card}>
          <h2>Open the form in the app</h2>
          <p>
            This email already has a YMCA app account. The form opens inside the app so your response stays with your membership.
          </p>
          <button className={styles.primary} type="button" onClick={() => openInApp(formId)}>
            Open in the YMCA app
          </button>
          <p className={styles.note}>If the app does not open, install it, sign in with this email, then tap the button again.</p>
          <StoreLinks />
        </section>
      )}

      {gate === 'download' && (
        <section className={styles.card}>
          <h2>Download the YMCA app</h2>
          <p>
            {email} does not have a YMCA app account yet. Download the app, create an account with this email, then open this link again to fill the form.
          </p>
          <StoreLinks />
          <button className={styles.secondary} type="button" onClick={() => setGate('email')}>
            Use a different email
          </button>
        </section>
      )}
    </article>
  )
}

function StoreLinks() {
  return (
    <div className={styles.stores}>
      <a className={styles.store} href={appStoreLinks.playStore}>
        Get it on Google Play
      </a>
      <a className={styles.store} href={appStoreLinks.appStore}>
        Download on the App Store
      </a>
    </div>
  )
}
