const YOUTUBE_ID_RE = /^[\w-]{11}$/

export const DEFAULT_SIGNUP_YOUTUBE_URL = 'https://www.youtube.com/watch?v=6YM8SreJVLQ'

export function parseYoutubeVideoId(input: string): string {
  const value = input.trim()
  if (!value) return ''
  if (YOUTUBE_ID_RE.test(value)) return value

  try {
    const url = new URL(value.includes('://') ? value : `https://${value}`)
    const host = url.hostname.replace(/^www\./, '')

    if (host === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0] || ''
      return YOUTUBE_ID_RE.test(id) ? id : ''
    }

    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
      const fromQuery = url.searchParams.get('v')
      if (fromQuery && YOUTUBE_ID_RE.test(fromQuery)) return fromQuery

      const parts = url.pathname.split('/').filter(Boolean)
      const marker = parts.findIndex((part) => ['embed', 'shorts', 'live', 'v'].includes(part))
      const fromPath = marker >= 0 ? parts[marker + 1] || '' : ''
      if (YOUTUBE_ID_RE.test(fromPath)) return fromPath
    }
  } catch {
    return ''
  }

  return ''
}
