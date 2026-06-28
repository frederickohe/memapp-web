export interface ApiSuccessEnvelope<T> {
  status: number
  message: string
  data: T
}

export interface ApiErrorEnvelope {
  success: false
  message: string
}

export interface ApiSimpleSuccess {
  success?: boolean
  status?: number
  message: string
}

export interface PaginationMeta {
  total: number
  page: number
  pages: number
}

export interface PaginationParams {
  page?: number
  limit?: number
}
