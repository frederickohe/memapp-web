import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ylearnBasePath } from '../../../../config/hosts'
import { finalizeEnrolment, withdrawEnrolment } from '../../core/data/enrolments'
import type { Course, Enrolment } from '../../core/types'
import { Button } from '../ui/Button'

export function CheckoutForm({
  enrolment,
  course,
}: {
  enrolment: Enrolment
  course: Course
}) {
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const navigate = useNavigate()
  const base = ylearnBasePath()

  async function handlePay(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setPending(true)
    const data = new FormData(e.currentTarget)
    const paymentMethod = String(data.get('paymentMethod') ?? 'Card')
    const simulateFailure = data.get('simulateFailure') === 'on'

    try {
      await finalizeEnrolment(enrolment.id, paymentMethod, simulateFailure)
      navigate(`${base}/enrolments?success=1`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      if (msg === 'COURSE_FULL') {
        setError('This course is now full. Please try another course.')
      } else if (msg === 'PAYMENT_FAILED') {
        setError('Simulated payment failed. You can retry.')
      } else {
        setError('Checkout could not be completed.')
      }
    } finally {
      setPending(false)
    }
  }

  async function handleWithdraw() {
    setPending(true)
    try {
      await withdrawEnrolment(enrolment.id)
      navigate(`${base}/courses`)
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="yl-grid-2" style={{ gap: '1.5rem' }}>
      <section className="yl-card">
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Checkout summary</h3>
        <p style={{ marginTop: '0.5rem', fontWeight: 500 }}>{course.name}</p>
        <p className="text-muted" style={{ fontSize: '0.875rem' }}>{course.providerName}</p>
        <p className="yl-stat-value">£{course.fees.toFixed(2)}</p>
        <p className="text-muted" style={{ fontSize: '0.875rem' }}>
          Seats remaining: {course.seatsRemaining} / {course.maxCapacity}
        </p>
      </section>

      <section className="yl-card">
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Simulated payment</h3>
        <form onSubmit={(e) => void handlePay(e)} style={{ marginTop: '1rem' }}>
          <fieldset style={{ border: 'none', padding: 0, marginBottom: '1rem' }}>
            {['Card', 'Bank Transfer', 'Voucher'].map((method) => (
              <label key={method} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                <input type="radio" name="paymentMethod" value={method} defaultChecked={method === 'Card'} />
                {method}
              </label>
            ))}
          </fieldset>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--yl-muted)', marginBottom: '1rem' }}>
            <input type="checkbox" name="simulateFailure" />
            Simulate payment failure (for testing)
          </label>
          {error && <p className="yl-error">{error}</p>}
          <Button type="submit" disabled={pending}>
            {pending ? 'Processing…' : 'Confirm payment'}
          </Button>
        </form>
        <div style={{ marginTop: '1rem' }}>
          <Button type="button" variant="secondary" disabled={pending} onClick={() => void handleWithdraw()}>
            Withdraw before checkout
          </Button>
        </div>
      </section>
    </div>
  )
}
