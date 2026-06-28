export type NewsContentType = 'NEWS' | 'EVENT'

export interface NewsMedia {
  id: string
  news_id: string
  url: string
  media_type: string
  order: number
  created_at: string
}

export interface NewsItem {
  id: string
  admin_id: string
  title: string
  content: string
  summary?: string
  content_type: NewsContentType
  is_impact_story: boolean
  event_date?: string
  event_location?: string
  is_published: boolean
  created_at: string
  updated_at: string
  published_at?: string
  media: NewsMedia[]
}

export interface NewsListData {
  total: number
  page: number
  size: number
  items: NewsItem[]
}

export interface NewsListParams {
  page?: number
  size?: number
  content_type?: NewsContentType
  published_only?: boolean
  impact_only?: boolean
}

export interface NewsMediaInput {
  url: string
  media_type: string
  metadata?: Record<string, unknown>
  order: number
}

export interface CreateNewsRequest {
  title: string
  content: string
  summary?: string
  content_type?: NewsContentType
  is_impact_story?: boolean
  event_date?: string
  event_location?: string
  is_published?: boolean
  media?: NewsMediaInput[]
}

export interface UpdateNewsRequest {
  title?: string
  content?: string
  summary?: string
  content_type?: NewsContentType
  is_impact_story?: boolean
  event_date?: string
  event_location?: string
  is_published?: boolean
  media?: NewsMediaInput[]
}
