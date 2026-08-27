export type ProminentCategory = 'GHANA' | 'WORLD'

export interface ProminentProfile {
  id: string
  full_name: string
  profile_picture_url?: string | null
  occupation?: string | null
  prominent_headline?: string | null
  bio?: string | null
  country?: string | null
  era?: string | null
  category?: ProminentCategory | null
  sort_order: number
  is_published: boolean
}

export interface ProminentProfileListData {
  total: number
  page: number
  size: number
  items: ProminentProfile[]
}

export interface ProminentProfileListParams {
  page?: number
  size?: number
  category?: ProminentCategory
  published_only?: boolean
}

export interface CreateProminentProfileRequest {
  full_name: string
  headline?: string
  bio: string
  photo_url?: string
  country?: string
  occupation?: string
  era?: string
  category: ProminentCategory
  sort_order?: number
  is_published?: boolean
}

export type UpdateProminentProfileRequest = Partial<CreateProminentProfileRequest>
