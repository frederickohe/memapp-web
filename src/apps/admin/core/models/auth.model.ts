export interface AdminLoginRequest {
  email: string
  password: string
}

/** Response from POST /auth/admin/signin */
export interface BackendAdminSigninResponse {
  status: string
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
  user_type: string
  role?: string | null
}

/** Response from GET /auth/admin/me */
export interface BackendAdminProfileResponse {
  id: string
  fullname: string
  email: string
  phone_number?: string | null
  user_type: string
  role?: string | null
  profile_picture_url?: string | null
  enabled: boolean
  status: string
  created_at: string
}

export interface AdminRoleSummary {
  id: string
  name: string
}

export interface AdminProfile {
  id: string
  full_name: string
  email: string
  phone?: string
  reset_required: boolean
  role: AdminRoleSummary
}

export interface AdminLoginData {
  token: string
  admin: AdminProfile
}

export interface ChangePasswordRequest {
  current_password: string
  new_password: string
}
