export type VehicleType = 'motorcycle' | 'bicycle'

export type KycStatus = 'pending' | 'approved' | 'rejected'
export type RiderActiveStatus = 'offline' | 'online' | 'on_delivery'

export interface AdminRiderVehicleSummary {
  id: string
  plate_no?: string | null
  type?: VehicleType
  gps_tracker_id?: string
  dashcam_id?: string | null
  battery_percent?: number
}

export interface AdminRider {
  id: string
  user_id?: string
  full_name: string
  email?: string
  phone: string
  avatar_url?: string
  ghana_card_no?: string
  ghana_card_front_url?: string
  ghana_card_back_url?: string
  drivers_license_url?: string | null
  vehicle_type: VehicleType
  vehicle?: AdminRiderVehicleSummary | null
  kyc_status: KycStatus
  kyc_rejection_reason?: string | null
  is_active: boolean
  active_status: RiderActiveStatus
  zone?: string
  rating?: number
  completion_rate?: number
  on_time_rate?: number
  total_deliveries?: number
  earnings_this_month?: number
  created_at: string
}

export interface AdminRiderListData {
  total: number
  page: number
  pages: number
  riders: AdminRider[]
  items?: AdminRider[]
}

export interface AdminRiderListParams {
  page?: number
  limit?: number
  kyc_status?: KycStatus
  is_active?: boolean
  active_status?: RiderActiveStatus
}

export interface RejectRiderRequest {
  reason: string
}
