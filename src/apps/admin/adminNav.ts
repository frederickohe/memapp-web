export const ADMIN_NAV = [
  { path: 'dashboard', label: 'Dashboard', icon: 'ri-dashboard-fill' },
  { path: 'analytics', label: 'Analytics', icon: 'ri-bar-chart-line' },
  { path: 'finance', label: 'Finance', icon: 'ri-bank-card-line' },
  { path: 'kyc', label: 'KYC Submissions', icon: 'ri-file-shield-2-line' },
  { path: 'customers', label: 'Customers', icon: 'ri-group-line' },
  { path: 'messages', label: 'Messages', icon: 'ri-chat-1-line' },
  { path: 'user-roles', label: 'User Roles', icon: 'ri-shield-user-line' },
  { path: 'settings', label: 'Settings', icon: 'ri-settings-3-line' },
] as const

export const ADMIN_PAGE_TITLES: Record<string, string> = Object.fromEntries(
  ADMIN_NAV.map((item) => [item.path, item.label]),
)
