import type { ScopeFilterParams } from './branch.model'

export type VhsStatus = 'pending' | 'approved' | 'rejected'

export interface VolunteerHoursSubmission {
  id: string
  user_id: string
  member_name: string
  member_id?: string | null
  member_email?: string | null
  member_phone?: string | null
  member_avatar_url?: string | null
  member_branch?: string | null
  hours: number
  activity_name: string
  activity_description?: string | null
  branch?: string | null
  volunteer_date: string
  proof_document_url?: string | null
  status: VhsStatus
  rejection_reason?: string | null
  points_awarded?: number | null
  points_to_award?: number | null
  reviewed_by?: string | null
  reviewed_at?: string | null
  created_at: string
}

export interface VhsSubmissionListData {
  total: number
  page: number
  pages: number
  submissions: VolunteerHoursSubmission[]
}

export interface VhsSubmissionListParams extends ScopeFilterParams {
  page?: number
  limit?: number
  status?: VhsStatus
}

export interface RejectVhsRequest {
  reason: string
}
