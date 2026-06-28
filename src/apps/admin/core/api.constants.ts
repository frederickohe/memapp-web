export const API_ENDPOINTS = {
  adminAuth: {
    login: '/auth/admin/signin',
    me: '/auth/admin/me',
    logout: '/auth/admin/signout',
    refresh: '/auth/admin/refresh',
    changePassword: '/auth/reset-password',
  },
  adminUsers: {
    list: '/admin/users',
    create: '/admin/users',
    detail: (id: string) => `/admin/users/${id}`,
    update: (id: string) => `/admin/users/${id}`,
    deactivate: (id: string) => `/admin/users/${id}/deactivate`,
    resetPassword: (id: string) => `/admin/users/${id}/reset-password`,
  },
  adminRoles: {
    permissions: '/admin/permissions',
    list: '/admin/roles',
    create: '/admin/roles',
    detail: (id: string) => `/admin/roles/${id}`,
    update: (id: string) => `/admin/roles/${id}`,
    delete: (id: string) => `/admin/roles/${id}`,
    setPermissions: (id: string) => `/admin/roles/${id}/permissions`,
  },
  adminVhs: {
    list: '/admin/vhs-submissions',
    detail: (id: string) => `/admin/vhs-submissions/${id}`,
    approve: (id: string) => `/admin/vhs-submissions/${id}/approve`,
    reject: (id: string) => `/admin/vhs-submissions/${id}/reject`,
  },
  adminSettings: {
    list: '/admin/settings',
    update: (key: string) => `/admin/settings/${key}`,
  },
  adminPayments: {
    list: '/payments/admin/list',
    activate: '/payments/admin/activate',
  },
} as const
