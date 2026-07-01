import { useEffect, useState } from 'react'
import { loadAppConfig } from './core/appConfig'
import { YlearnAuthProvider } from './core/AuthContext'
import { YlearnRoutes } from './YlearnRoutes'
import './styles/ylearn-global.css'

export function YlearnApp() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    void loadAppConfig().finally(() => setReady(true))
  }, [])

  if (!ready) {
    return <div className="ylearn-app yl-loading">Loading…</div>
  }

  return (
    <div className="ylearn-app">
      <YlearnAuthProvider>
        <YlearnRoutes />
      </YlearnAuthProvider>
    </div>
  )
}
