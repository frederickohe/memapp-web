import { useEffect, useState } from 'react'
import { listProviders, createProvider } from '../../core/data/courses'
import type { Provider } from '../../core/types'
import { Button } from '../../components/ui/Button'

export function AdminProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  function refresh() {
    void listProviders().then(setProviders)
  }

  useEffect(() => {
    refresh()
  }, [])

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setPending(true)
    const data = new FormData(e.currentTarget)
    try {
      await createProvider({
        name: String(data.get('name')),
        address: String(data.get('address')),
        latitude: Number(data.get('latitude')),
        longitude: Number(data.get('longitude')),
      })
      e.currentTarget.reset()
      refresh()
    } catch {
      setError('Could not create provider.')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="yl-space-y-lg">
      <section>
        <h2 className="yl-page-title">Providers</h2>
        <ul className="yl-card yl-space-y" style={{ padding: '1rem' }}>
          {providers.map((p) => (
            <li key={p.id} style={{ fontSize: '0.875rem' }}>
              <strong>{p.name}</strong> — {p.address} ({p.latitude}, {p.longitude})
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem', fontWeight: 600 }}>Add provider</h3>
        <form onSubmit={(e) => void handleCreate(e)} className="yl-card yl-form-wide">
          <input name="name" placeholder="Provider name" required className="yl-input" style={{ marginBottom: '0.75rem' }} />
          <input name="address" placeholder="Address" required className="yl-input" style={{ marginBottom: '0.75rem' }} />
          <input name="latitude" type="number" step="any" placeholder="Latitude" required className="yl-input" style={{ marginBottom: '0.75rem' }} />
          <input name="longitude" type="number" step="any" placeholder="Longitude" required className="yl-input" style={{ marginBottom: '0.75rem' }} />
          {error && <p className="yl-error">{error}</p>}
          <Button type="submit" disabled={pending}>Create provider</Button>
        </form>
      </section>
    </div>
  )
}
