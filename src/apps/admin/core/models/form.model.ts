export type FormAssignmentType = 'PUBLIC' | 'PROGRAM' | 'USER'

export type FormFieldType =
  | 'text'
  | 'email'
  | 'number'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'date'

export interface FormField {
  name: string
  label: string
  field_type: FormFieldType
  required: boolean
  placeholder?: string | null
  options?: string[] | null
  validation?: Record<string, unknown> | null
}

export interface Form {
  id: string
  admin_id: string
  title: string
  description?: string | null
  assignment_type: FormAssignmentType
  program_id?: string | null
  assigned_user_id?: string | null
  fields: FormField[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface FormDetail extends Form {
  response_count: number
}

export interface FormListData {
  total: number
  page: number
  size: number
  items: FormDetail[]
}

export interface FormResponseRecord {
  id: string
  form_id: string
  user_id: string
  user_name?: string | null
  user_email?: string | null
  data: Record<string, unknown>
  notes?: string | null
  is_submitted: boolean
  created_at: string
  updated_at: string
}

export interface FormResponsesListData {
  form_id: string
  form_title: string
  total_responses: number
  page: number
  size: number
  responses: FormResponseRecord[]
}

export interface FieldOptionCount {
  option: string
  count: number
}

export interface FieldAnalytics {
  name: string
  label: string
  field_type: string
  total_answered: number
  option_counts?: FieldOptionCount[] | null
}

export interface DailyResponseCount {
  date: string
  count: number
}

export interface FormAnalytics {
  form_id: string
  form_title: string
  total_responses: number
  responses_last_7_days: number
  responses_last_30_days: number
  daily_counts: DailyResponseCount[]
  field_analytics: FieldAnalytics[]
}

export interface CreateFormRequest {
  title: string
  description?: string
  assignment_type: FormAssignmentType
  program_id?: string | null
  assigned_user_id?: string | null
  fields: FormField[]
  is_active?: boolean
}

export interface UpdateFormRequest {
  title?: string
  description?: string
  assignment_type?: FormAssignmentType
  program_id?: string | null
  assigned_user_id?: string | null
  fields?: FormField[]
  is_active?: boolean
}

export interface FormListParams {
  page?: number
  size?: number
  assignment_type?: FormAssignmentType
  is_active?: boolean
}

export interface FormResponsesParams {
  page?: number
  size?: number
}
