import type { ScopeFilterParams } from './branch.model'

export type MemberUserStatus = 'ACTIVE' | 'INACTIVE' | 'DELETED'

export interface MemberUser {
  id: string
  full_name: string
  email: string
  phone?: string
  member_id?: string
  membership_type?: string
  date_joined_organization?: string
  past_positions?: string[]
  current_branch?: string
  branch_id?: string
  branch_name?: string
  region_name?: string
  month_dues_paid_status?: string
  year_affiliation_paid_status?: string
  volunteer_points: number
  profile_picture_url?: string
  is_prominent: boolean
  prominent_order: number
  prominent_headline?: string
  user_type?: string
  role_id?: string
  role_name?: string
  position?: string
  assigned_region?: string
  assigned_branch?: string
  is_active: boolean
  status: MemberUserStatus
  created_at: string
}

export interface MemberUserListData {
  total: number
  page: number
  pages: number
  users: MemberUser[]
}

export interface MemberUserListParams extends ScopeFilterParams {
  page?: number
  limit?: number
  search?: string
  status?: MemberUserStatus
  branch?: string
  membership_type?: string
  prominent_only?: boolean
}

export interface MemberUserOverview {
  total_users: number
  active_users: number
  inactive_users: number
  dues_pending: number
  affiliation_pending: number
}

export interface UpdateMemberUserRequest {
  full_name?: string
  email?: string
  phone?: string
  member_id?: string
  membership_type?: string
  date_joined_organization?: string
  past_positions?: string[]
  current_branch?: string
  branch_id?: string
  month_dues_paid_status?: string
  year_affiliation_paid_status?: string
  is_prominent?: boolean
  prominent_order?: number
  prominent_headline?: string
}

export interface AssignMemberRoleRequest {
  role_id?: string | null
  assigned_region?: string
  assigned_branch?: string
}
