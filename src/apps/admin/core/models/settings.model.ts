export type SettingKey =
  | 'bundle_overlap_behaviour'
  | 'bundle_carryover_expiry'
  | 'bundle_expiry_enabled'

export interface SystemSetting {
  key: SettingKey
  value: string
  description?: string
  allowed_values: string[] | null
  updated_at?: string
}

export interface UpdateSettingRequest {
  value: string
}

export interface UpdateSettingResponseData {
  key: SettingKey
  value: string
}
