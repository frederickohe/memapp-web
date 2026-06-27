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
