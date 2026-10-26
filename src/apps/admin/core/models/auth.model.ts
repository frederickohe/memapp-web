export interface AdminLoginRequest {
  email: string
  password: string
}

/** Response from POST /auth/admin/signin */
export interface BackendAdminSigninResponse {
  status?: string
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
  user_type: string
  role?: string | null
  two_factor_required?: boolean
}

export interface TwoFactorChallengeResponse {
  two_factor_required: true
  challenge_token: string
  channel?: string
  destination?: string
  message?: string
}

/** Response from GET /auth/admin/me */
export interface BackendAdminProfileResponse {
  id: string
  fullname: string
  email: string
  phone_number?: string | null
  user_type: string
  role?: { id: string; name: string } | string | null
  role_id?: string | null
  profile_picture_url?: string | null
  enabled: boolean
  reset_required?: boolean
  status: string
  created_at: string
  assigned_region?: string | null
  assigned_branch?: string | null
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

export interface ForgotPasswordRequest {
  phone: string
}

export interface ForgotPasswordVerifyRequest {
  phone: string
  otp: string
}

export interface ForgotPasswordResetRequest {
  reset_token: string
  new_password: string
}

export interface ForgotPasswordResponse {
  success: boolean
  message: string
  destination?: string
  channel?: string
}

export interface ForgotPasswordVerifyResponse {
  success: boolean
  message: string
  reset_token: string
}
