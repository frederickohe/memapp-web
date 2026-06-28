export type ScopeLevel = 'national' | 'region' | 'branch' | 'users'

export type MessageAudienceMode = 'broadcast' | 'users'

export interface Region {
  id: string
  name: string
  is_active: boolean
  branch_count: number
  created_at: string
}

export interface BranchPresident {
  id: string
  full_name: string
  email: string
  phone?: string | null
}

export interface Branch {
  id: string
  region_id: string
  region_name: string
  name: string
  address?: string | null
  lat?: number | null
  lng?: number | null
  president?: BranchPresident | null
  is_active: boolean
  created_at: string
}

export interface CreateRegionRequest {
  name: string
}

export interface UpdateRegionRequest {
  name?: string
  is_active?: boolean
}

export interface CreateBranchRequest {
  region_id: string
  name: string
  address?: string
  lat?: number
  lng?: number
  president_id?: string
}

export interface UpdateBranchRequest {
  region_id?: string
  name?: string
  address?: string
  lat?: number
  lng?: number
  president_id?: string | null
  is_active?: boolean
}

export interface AssignPresidentRequest {
  president_id?: string | null
}

export interface ScopeFilterParams {
  scope?: ScopeLevel
  region_id?: string
  branch_id?: string
}

export interface TopBranchStat {
  branch_id: string
  branch_name: string
  region_name: string
  member_count: number
  member_target: number
  member_progress_pct: number
}

export interface RecentRegistration {
  id: string
  name: string
  branch_name?: string | null
  member_id?: string | null
  status: string
  created_at: string
}

export interface ProgressOverview {
  scope: ScopeLevel
  region_id?: string | null
  region_name?: string | null
  branch_id?: string | null
  branch_name?: string | null
  total_members: number
  active_members: number
  inactive_members: number
  member_target: number
  members_remaining: number
  member_progress_pct: number
  active_member_pct: number
  avg_members_per_branch: number
  branches_at_goal: number
  pending_vhs: number
  approved_vhs: number
  branch_count: number
  top_branches: TopBranchStat[]
  recent_registrations: RecentRegistration[]
}

export type MessageChannel = 'sms' | 'email'

export interface BroadcastMessageRequest {
  channel: MessageChannel
  scope: ScopeLevel
  region_id?: string
  branch_id?: string
  user_ids?: string[]
  subject?: string
  message: string
}

export interface BroadcastMessageResponse {
  channel: string
  scope: string
  recipients_total: number
  sent_count: number
  failed_count: number
  message: string
}
