import { API_BASE_URL } from '../../../config/env'

export interface RuntimeConfig {
  apiBaseUrl: string
  googleMapsApiKey: string
  geoapifyApiKey: string
}

const defaultApiBase = API_BASE_URL.endsWith('/api/v1')
  ? API_BASE_URL
  : `${API_BASE_URL.replace(/\/$/, '')}/api/v1`

let config: RuntimeConfig = {
  apiBaseUrl: defaultApiBase,
  googleMapsApiKey: '',
  geoapifyApiKey: import.meta.env.VITE_GEOAPIFY_API_KEY ?? '',
}

export function getAppConfig(): RuntimeConfig {
  return config
}

export async function loadAppConfig(): Promise<void> {
  try {
    const response = await fetch('/config.json', { cache: 'no-store' })
    if (response.ok) {
      const json = (await response.json()) as Partial<RuntimeConfig>
      // In dev, keep the env/proxy API URL — config.json targets production and
      // would bypass the Vite proxy if it overwrote apiBaseUrl.
      if (import.meta.env.DEV) {
        const { apiBaseUrl: _ignored, ...runtimeOnly } = json
        config = { ...config, ...runtimeOnly }
      } else {
        config = { ...config, ...json }
      }
    }
  } catch {
    // optional runtime config
  }
}
