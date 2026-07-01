import { useState } from 'react'
import { removeLearner } from '../../core/data/enrolments'
import { useYlearnAuth } from '../../core/AuthContext'
import { REMOVAL_REASONS } from '../../core/types'
import { Button } from '../ui/Button'

export function RemoveLearnerForm({
  enrolmentId,
  username,
}: {
  enrolmentId: string
  username?: string
}) {
  const { user } = useYlearnAuth()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!user) return
    setError('')
    setSuccess(false)
    setPending(true)
    const data = new FormData(e.currentTarget)
    const reason = String(data.get('reason') ?? '')
    const note = String(data.get('note') ?? '')

    try {
      await removeLearner(enrolmentId, user.uid, reason, note)
      setSuccess(true)
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      if (msg === 'ALREADY_INACTIVE') {
        setError('Learner is already inactive on this course.')
      } else {
        setError('Could not remove learner.')
      }
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="yl-remove-form">
      <span style={{ width: '100%', fontSize: '0.875rem', fontWeight: 500, color: '#7f1d1d' }}>{username}</span>
      <select name="reason" required className="yl-select" style={{ width: 'auto' }}>
        {REMOVAL_REASONS.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
      <input name="note" placeholder="Optional note" className="yl-input" style={{ flex: 1, minWidth: '160px' }} />
      <Button type="submit" variant="danger" disabled={pending} style={{ fontSize: '0.75rem' }}>
        Remove
      </Button>
      {error && <p className="yl-error" style={{ width: '100%', fontSize: '0.75rem' }}>{error}</p>}
      {success && <p className="yl-success" style={{ width: '100%', fontSize: '0.75rem' }}>Removed.</p>}
    </form>
  )
}
