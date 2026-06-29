const ADMIN_HOST_PREFIX = 'admin.'

export function isAdminHost(hostname: string = window.location.hostname): boolean {
  if (hostname.startsWith(ADMIN_HOST_PREFIX)) {
    return true
  }

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return window.location.pathname.startsWith('/admin')
  }

  return false
}

export function adminBasePath(hostname: string = window.location.hostname): string {
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return '/admin'
  }

  return ''
}

export function adminPortalUrl(hostname: string = window.location.hostname): string {
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return '/admin'
  }

  const baseHost = hostname.replace(/^www\./, '')
  if (baseHost.startsWith(ADMIN_HOST_PREFIX)) {
    return `https://${baseHost}`
  }

  return `https://${ADMIN_HOST_PREFIX}${baseHost}`
}

export const appStoreLinks = {
  playStore:
    import.meta.env.VITE_PLAY_STORE_URL ??
    'https://play.google.com/store/search?q=YMCA+Ghana+Member+App',
  appStore:
    import.meta.env.VITE_APP_STORE_URL ??
    'https://apps.apple.com/us/search?term=YMCA%20Ghana%20Member%20App',
} as const
