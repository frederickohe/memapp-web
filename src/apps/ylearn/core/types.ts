export type UserRole = 'learner' | 'admin'

export type CourseStatus = 'active' | 'archived'

export type EnrolmentStatus =
  | 'draft'
  | 'checkedOut'
  | 'enrolled'
  | 'withdrawn'
  | 'removed'
  | 'completed'

export type PaymentStatus = 'pending' | 'paid' | 'failed'

export interface UserProfile {
  uid: string
  email: string
  username: string
  role: UserRole
  age?: number
  address?: string
  phone?: string
  createdAt: string
}

export interface Provider {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
}

export interface Course {
  id: string
  providerId: string
  name: string
  instructor: string
  level: string
  subject: string
  creditHours: number
  startTime: string
  numberOfWeeks: number
  fees: number
  maxCapacity: number
  status: CourseStatus
  providerName?: string
  providerAddress?: string
  enrolledCount?: number
  seatsRemaining?: number
}

export interface ContentItem {
  id: string
  courseId: string
  type: 'text' | 'video' | 'resource'
  title: string
  body?: string
  url?: string
  order: number
}

export interface Enrolment {
  id: string
  userId: string
  courseId: string
  status: EnrolmentStatus
  paymentStatus: PaymentStatus
  paymentMethod?: string
  removalReason?: string
  removalNote?: string
  removedByAdminId?: string
  createdAt: string
  updatedAt: string
  course?: Course
  username?: string
}

export type ActionResult = { ok: true } | { ok: false; error: string }

export const REMOVAL_REASONS = [
  'Non-Payment',
  'Absent',
  'Academic Misconduct',
  'Other',
] as const

export const OCCUPYING_STATUSES: EnrolmentStatus[] = ['enrolled']

export const CURRENT_ENROLMENT_STATUSES: EnrolmentStatus[] = [
  'draft',
  'checkedOut',
  'enrolled',
]

export const PAST_ENROLMENT_STATUSES: EnrolmentStatus[] = [
  'withdrawn',
  'removed',
  'completed',
]
