import type { AdminRoleSummary } from './auth.model'

export interface AdminUserListItem {
  id: string
  full_name: string
  email: string
  phone: string
  is_active: boolean
  reset_required: boolean
  last_login_at: string | null
  role: AdminRoleSummary
}

export interface AdminUserListData {
  total: number
  page: number
  pages: number
  users: AdminUserListItem[]
}

export interface CreateAdminUserRequest {
  full_name: string
  email: string
  phone: string
  password: string
  role_id: string
  reset_required: boolean
}

export interface UpdateAdminUserRequest {
  full_name?: string
  phone?: string
  role_id?: string
  is_active?: boolean
  reset_required?: boolean
}

export interface ResetAdminUserPasswordRequest {
  new_password: string
}
