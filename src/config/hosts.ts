const ADMIN_HOST_PREFIX = 'admin.'
const YLEARN_HOST_PREFIX = 'ylearn.'

export function isAdminHost(hostname: string = window.location.hostname): boolean {
  if (hostname.startsWith(ADMIN_HOST_PREFIX)) {
    return true
  }

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return window.location.pathname.startsWith('/admin')
  }

  return false
}

export function isYlearnHost(hostname: string = window.location.hostname): boolean {
  if (hostname.startsWith(YLEARN_HOST_PREFIX)) {
    return true
  }

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return window.location.pathname.startsWith('/ylearn')
  }

  return false
}

export function ylearnBasePath(hostname: string = window.location.hostname): string {
  if (hostname.startsWith(YLEARN_HOST_PREFIX)) {
    return ''
  }

  return '/ylearn'
}

export function ylearnPortalUrl(hostname: string = window.location.hostname): string {
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return '/ylearn'
  }

  const baseHost = hostname.replace(/^www\./, '')
  if (baseHost.startsWith(YLEARN_HOST_PREFIX)) {
    return `https://${baseHost}`
  }

  if (baseHost.startsWith(ADMIN_HOST_PREFIX)) {
    return `https://${baseHost.slice(ADMIN_HOST_PREFIX.length)}/ylearn`
  }

  return `https://${baseHost}/ylearn`
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
