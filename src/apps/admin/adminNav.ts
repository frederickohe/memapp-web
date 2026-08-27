export const ADMIN_NAV = [
  { path: 'dashboard', label: 'Dashboard', icon: 'ri-dashboard-fill' },
  { path: 'analytics', label: 'Progress', icon: 'ri-bar-chart-line' },
  { path: 'finance', label: 'Finance', icon: 'ri-bank-card-line' },
  { path: 'vhs', label: 'VHS Submissions', icon: 'ri-time-line' },
  { path: 'forms', label: 'Forms', icon: 'ri-survey-line' },
  { path: 'programs', label: 'Programs', icon: 'ri-calendar-event-line' },
  { path: 'news', label: 'News & Updates', icon: 'ri-newspaper-line' },
  { path: 'profiles', label: 'Prominent Profiles', icon: 'ri-user-star-line' },
  { path: 'users', label: 'Users', icon: 'ri-group-line' },
  { path: 'branches', label: 'Branches', icon: 'ri-building-line' },
  { path: 'messages', label: 'Messages', icon: 'ri-chat-1-line' },
  { path: 'user-roles', label: 'User Roles', icon: 'ri-shield-user-line' },
  { path: 'settings', label: 'Settings', icon: 'ri-settings-3-line' },
] as const

export const ADMIN_PAGE_TITLES: Record<string, string> = Object.fromEntries(
  ADMIN_NAV.map((item) => [item.path, item.label]),
)
