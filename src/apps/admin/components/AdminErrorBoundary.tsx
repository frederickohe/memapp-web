import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallbackTitle?: string
}

interface State {
  error: Error | null
}

export class AdminErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Admin UI crashed', error, info.componentStack)
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <div
        style={{
          margin: 24,
          padding: 20,
          borderRadius: 12,
          background: '#fff5f5',
          border: '1px solid #fecaca',
          color: '#991b1b',
          fontFamily: 'Poppins, sans-serif',
        }}
      >
        <h2 style={{ margin: '0 0 8px', fontSize: 18 }}>
          {this.props.fallbackTitle ?? 'Something went wrong'}
        </h2>
        <p style={{ margin: '0 0 12px', fontSize: 14, opacity: 0.9 }}>
          {error.message || 'An unexpected error occurred in the admin portal.'}
        </p>
        <button
          type="button"
          onClick={() => {
            this.setState({ error: null })
            window.location.reload()
          }}
          style={{
            border: 0,
            borderRadius: 8,
            padding: '10px 14px',
            background: '#ed1c24',
            color: '#fff',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Reload dashboard
        </button>
      </div>
    )
  }
}
