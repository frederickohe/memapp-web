export type ProgramStatus = 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED'

export type ProgramActionType = 'external_link' | 'form'

export interface ProgramAction {
  label: string
  type: ProgramActionType
  url?: string
  form_id?: string
}

export interface ProgramFormSummary {
  id: string
  title: string
  description?: string | null
}

export interface Program {
  id: string
  title: string
  description?: string | null
  starting_date: string
  end_date: string
  register_url?: string | null
  youtube_url?: string | null
  thumbnail_url?: string | null
  category?: string | null
  location?: string | null
  capacity?: number | null
  status: ProgramStatus
  is_published: boolean
  allow_registration: boolean
  created_by: string
  metadata?: ProgramMetadata | null
  created_at: string
  updated_at: string
}

export interface ProgramMetadata {
  actions?: ProgramAction[]
}

export interface ProgramDetail extends Program {
  forms: ProgramFormSummary[]
  participant_count: number
}

export interface ProgramListData {
  total: number
  page: number
  size: number
  items: ProgramDetail[]
}

export interface ProgramListParams {
  page?: number
  size?: number
  status?: ProgramStatus
  category?: string
  is_published?: boolean
  branch_id?: string
}

export interface CreateProgramRequest {
  title: string
  description?: string
  starting_date: string
  end_date: string
  register_url?: string
  youtube_url?: string
  thumbnail_url?: string
  category?: string
  location?: string
  capacity?: number
  form_ids?: string[]
  is_published?: boolean
  allow_registration?: boolean
  metadata?: ProgramMetadata
}

export type UpdateProgramRequest = Partial<CreateProgramRequest>

export interface FileUploadResponse {
  file_name: string
  file_url: string
  folder?: string | null
}
