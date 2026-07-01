import { ylearnCourseApi } from '../services'
import type { Course } from '../types'

export interface SearchFilters {
  subject?: string
  level?: string
  location?: string
}

export type CourseInput = Omit<
  Course,
  'id' | 'enrolledCount' | 'seatsRemaining' | 'providerName' | 'providerAddress'
>

export const searchCourses = (filters: SearchFilters) => ylearnCourseApi.searchCourses(filters)
export const getCourseById = (id: string) => ylearnCourseApi.getCourseById(id)
export const listAllCourses = () => ylearnCourseApi.listAllCourses()
export const listProviders = () => ylearnCourseApi.listProviders()
export const getCoursesByProvider = async (providerId: string) => {
  const providers = await ylearnCourseApi.listProvidersWithCourses()
  return providers.find((p) => p.id === providerId)?.courses ?? []
}
export const createCourse = (input: CourseInput) =>
  ylearnCourseApi.createCourse({
    provider_id: input.providerId,
    name: input.name,
    instructor: input.instructor,
    level: input.level,
    subject: input.subject,
    credit_hours: input.creditHours,
    start_time: input.startTime,
    number_of_weeks: input.numberOfWeeks,
    fees: input.fees,
    max_capacity: input.maxCapacity,
  })
export const updateCourse = (courseId: string, input: Partial<CourseInput>) =>
  ylearnCourseApi.updateCourse(courseId, {
    provider_id: input.providerId,
    name: input.name,
    instructor: input.instructor,
    level: input.level,
    subject: input.subject,
    credit_hours: input.creditHours,
    start_time: input.startTime,
    number_of_weeks: input.numberOfWeeks,
    fees: input.fees,
    max_capacity: input.maxCapacity,
  })
export const archiveCourse = (id: string) => ylearnCourseApi.archiveCourse(id)
export const listProvidersWithCourses = () => ylearnCourseApi.listProvidersWithCourses()
export const createProvider = ylearnCourseApi.createProvider
