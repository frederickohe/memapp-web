import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AuthProvider } from './core/AuthContext'
import { loadAppConfig } from './core/appConfig'
import './styles/admin-global.css'

export function AdminApp() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    void loadAppConfig().finally(() => setReady(true))
  }, [])

  if (!ready) {
    return (
      <div
        className="admin-app"
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f5f6fa',
          fontFamily: 'Poppins, sans-serif',
          color: '#888',
        }}
      >
        <i className="ri-loader-4-line spin" style={{ fontSize: 28 }} />
      </div>
    )
  }

  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  )
}
