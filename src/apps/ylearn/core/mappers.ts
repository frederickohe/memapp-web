import type { Course, ContentItem, Enrolment, Provider, UserProfile } from './types'

interface ApiCourse {
  id: string
  provider_id: string
  name: string
  instructor: string
  level: string
  subject: string
  credit_hours: number
  start_time: string
  number_of_weeks: number
  fees: number
  max_capacity: number
  status: string
  provider_name?: string
  provider_address?: string
  enrolled_count?: number
  seats_remaining?: number
}

interface ApiEnrolment {
  id: string
  user_id: string
  course_id: string
  status: string
  payment_status: string
  payment_method?: string
  removal_reason?: string
  removal_note?: string
  removed_by_admin_id?: string
  created_at: string
  updated_at: string
  course?: ApiCourse
  username?: string
}

interface ApiProvider {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
  courses?: ApiCourse[]
}

interface ApiContentItem {
  id: string
  course_id: string
  type: string
  title: string
  body?: string
  url?: string
  order: number
}

interface ApiMemberProfile {
  id: string
  fullname: string
  email: string
  phone_number?: string
  address?: string
  created_at: string
}

interface ApiAdminProfile {
  id: string
  fullname: string
  email: string
  phone_number?: string
  user_type: string
  created_at: string
}

export function mapCourse(c: ApiCourse): Course {
  return {
    id: c.id,
    providerId: c.provider_id,
    name: c.name,
    instructor: c.instructor,
    level: c.level,
    subject: c.subject,
    creditHours: c.credit_hours,
    startTime: c.start_time,
    numberOfWeeks: c.number_of_weeks,
    fees: c.fees,
    maxCapacity: c.max_capacity,
    status: c.status as Course['status'],
    providerName: c.provider_name,
    providerAddress: c.provider_address,
    enrolledCount: c.enrolled_count,
    seatsRemaining: c.seats_remaining,
  }
}

export function mapEnrolment(e: ApiEnrolment): Enrolment {
  return {
    id: e.id,
    userId: e.user_id,
    courseId: e.course_id,
    status: e.status as Enrolment['status'],
    paymentStatus: e.payment_status as Enrolment['paymentStatus'],
    paymentMethod: e.payment_method,
    removalReason: e.removal_reason,
    removalNote: e.removal_note,
    removedByAdminId: e.removed_by_admin_id,
    createdAt: e.created_at,
    updatedAt: e.updated_at,
    course: e.course ? mapCourse(e.course) : undefined,
    username: e.username,
  }
}

export function mapProvider(p: ApiProvider): Provider {
  return {
    id: p.id,
    name: p.name,
    address: p.address,
    latitude: p.latitude,
    longitude: p.longitude,
  }
}

export function mapProviderWithCourses(p: ApiProvider): Provider & { courses: Course[] } {
  return {
    ...mapProvider(p),
    courses: (p.courses ?? []).map(mapCourse),
  }
}

export function mapContentItem(item: ApiContentItem): ContentItem {
  return {
    id: item.id,
    courseId: item.course_id,
    type: item.type as ContentItem['type'],
    title: item.title,
    body: item.body,
    url: item.url,
    order: item.order,
  }
}

export function mapMemberProfile(p: ApiMemberProfile): UserProfile {
  return {
    uid: p.id,
    email: p.email,
    username: p.fullname,
    role: 'learner',
    phone: p.phone_number,
    address: p.address,
    createdAt: p.created_at,
  }
}

export function mapAdminProfile(p: ApiAdminProfile): UserProfile {
  return {
    uid: p.id,
    email: p.email,
    username: p.fullname,
    role: 'admin',
    phone: p.phone_number,
    createdAt: p.created_at,
  }
}

export type {
  ApiCourse,
  ApiEnrolment,
  ApiProvider,
  ApiContentItem,
  ApiMemberProfile,
  ApiAdminProfile,
}
