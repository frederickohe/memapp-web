import { YLEARN_API } from './api.constants'
import { apiData, apiRequest } from './apiClient'
import {
  mapAdminProfile,
  mapContentItem,
  mapCourse,
  mapEnrolment,
  mapMemberProfile,
  mapProvider,
  mapProviderWithCourses,
  type ApiAdminProfile,
  type ApiContentItem,
  type ApiCourse,
  type ApiEnrolment,
  type ApiMemberProfile,
  type ApiProvider,
} from './mappers'
import type { Course, ContentItem, Enrolment, Provider, UserProfile } from './types'
import { storage } from './utils/storage'

interface SigninResponse {
  access_token: string
  refresh_token?: string
  user_type: string
}

export interface LoginPayload {
  email: string
  password: string
}

export const ylearnAuthApi = {
  async login(payload: LoginPayload): Promise<UserProfile> {
    const signin = await apiRequest<SigninResponse>(YLEARN_API.auth.signin, {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    storage.setItem('token', signin.access_token)
    if (signin.refresh_token) {
      storage.setItem('refresh_token', signin.refresh_token)
    }

    if (signin.user_type === 'ADMIN') {
      const admin = await apiRequest<ApiAdminProfile>(YLEARN_API.auth.adminMe)
      const profile = mapAdminProfile(admin)
      storage.setJson('user', profile)
      return profile
    }

    const member = await apiRequest<ApiMemberProfile>(YLEARN_API.auth.me)
    const profile = mapMemberProfile(member)
    storage.setJson('user', profile)
    return profile
  },

  async me(): Promise<UserProfile> {
    const cached = storage.getJson<UserProfile>('user')
    if (cached?.role === 'admin') {
      const admin = await apiRequest<ApiAdminProfile>(YLEARN_API.auth.adminMe)
      return mapAdminProfile(admin)
    }
    const member = await apiRequest<ApiMemberProfile>(YLEARN_API.auth.me)
    return mapMemberProfile(member)
  },

  async logout(): Promise<void> {
    const user = storage.getJson<UserProfile>('user')
    const path = user?.role === 'admin' ? YLEARN_API.auth.adminSignout : YLEARN_API.auth.signout
    try {
      await apiRequest(path, { method: 'POST', body: JSON.stringify({}) })
    } catch {
      // ignore when backend unavailable
    }
    storage.removeItem('token')
    storage.removeItem('refresh_token')
    storage.removeItem('user')
  },
}

export const ylearnCourseApi = {
  async searchCourses(filters: { subject?: string; level?: string; location?: string }): Promise<Course[]> {
    const data = await apiData<ApiCourse[]>(YLEARN_API.courses.browse, { params: filters })
    return data.map(mapCourse)
  },

  async getCourseById(id: string): Promise<Course | null> {
    try {
      const data = await apiData<ApiCourse>(YLEARN_API.courses.detail(id))
      return mapCourse(data)
    } catch {
      return null
    }
  },

  async listProviders(): Promise<Provider[]> {
    const data = await apiData<ApiProvider[]>(YLEARN_API.admin.providers)
    return data.map(mapProvider)
  },

  async listProvidersWithCourses(): Promise<(Provider & { courses: Course[] })[]> {
    const data = await apiData<ApiProvider[]>(YLEARN_API.courses.providersMap)
    return data.map(mapProviderWithCourses)
  },

  async listAllCourses(): Promise<Course[]> {
    const data = await apiData<ApiCourse[]>(YLEARN_API.admin.courses)
    return data.map(mapCourse)
  },

  async createCourse(input: Record<string, unknown>): Promise<void> {
    await apiData(YLEARN_API.admin.courses, {
      method: 'POST',
      body: JSON.stringify(input),
    })
  },

  async updateCourse(id: string, input: Record<string, unknown>): Promise<void> {
    await apiData(YLEARN_API.admin.course(id), {
      method: 'PUT',
      body: JSON.stringify(input),
    })
  },

  async archiveCourse(id: string): Promise<void> {
    await apiData(YLEARN_API.admin.archive(id), { method: 'POST', body: JSON.stringify({}) })
  },

  async createProvider(input: Omit<Provider, 'id'>): Promise<void> {
    await apiData(YLEARN_API.admin.providers, {
      method: 'POST',
      body: JSON.stringify({
        name: input.name,
        address: input.address,
        latitude: input.latitude,
        longitude: input.longitude,
      }),
    })
  },
}

export const ylearnEnrolmentApi = {
  async getUserEnrolments(): Promise<Enrolment[]> {
    const data = await apiData<ApiEnrolment[]>(YLEARN_API.courses.myEnrolments)
    return data.map(mapEnrolment)
  },

  async getEnrolment(id: string): Promise<Enrolment | null> {
    try {
      const data = await apiData<ApiEnrolment>(YLEARN_API.courses.enrolment(id))
      return mapEnrolment(data)
    } catch {
      return null
    }
  },

  async getCourseEnrolments(courseId: string): Promise<Enrolment[]> {
    const data = await apiData<ApiEnrolment[]>(YLEARN_API.admin.courseEnrolments(courseId))
    return data.map(mapEnrolment)
  },

  async startEnrolment(courseId: string): Promise<string> {
    const data = await apiData<ApiEnrolment>(YLEARN_API.courses.enrol(courseId), {
      method: 'POST',
      body: JSON.stringify({}),
    })
    return data.id
  },

  async finalizeEnrolment(
    enrolmentId: string,
    paymentMethod: string,
    simulateFailure = false,
  ): Promise<void> {
    await apiData(YLEARN_API.courses.checkout(enrolmentId), {
      method: 'POST',
      body: JSON.stringify({ payment_method: paymentMethod, simulate_failure: simulateFailure }),
    })
  },

  async withdrawEnrolment(enrolmentId: string): Promise<void> {
    await apiData(YLEARN_API.courses.withdraw(enrolmentId), {
      method: 'POST',
      body: JSON.stringify({}),
    })
  },

  async removeLearner(enrolmentId: string, reason: string, note?: string): Promise<void> {
    await apiData(YLEARN_API.admin.removeLearner(enrolmentId), {
      method: 'POST',
      body: JSON.stringify({ reason, note }),
    })
  },

  async userCanAccessContent(courseId: string): Promise<boolean> {
    try {
      await apiData<ApiContentItem[]>(YLEARN_API.courses.content(courseId))
      return true
    } catch {
      return false
    }
  },

  async getCourseContent(courseId: string): Promise<ContentItem[]> {
    const data = await apiData<ApiContentItem[]>(YLEARN_API.courses.content(courseId))
    return data.map(mapContentItem)
  },
}

export const ylearnAdminApi = {
  async getAdminStats() {
    const data = await apiData<{
      total_learners: number
      active_courses: number
      current_enrolments: number
      total_enrolments: number
    }>(YLEARN_API.admin.stats)
    return {
      totalUsers: data.total_learners,
      learners: data.total_learners,
      admins: 0,
      activeCourses: data.active_courses,
      currentEnrolments: data.current_enrolments,
    }
  },

  async listUsers() {
    const data = await apiData<
      {
        id: string
        fullname: string
        email: string
        phone_number?: string
        address?: string
        enrolment_count: number
      }[]
    >(YLEARN_API.admin.learners)
    return data.map((u) => ({
      uid: u.id,
      email: u.email,
      username: u.fullname,
      role: 'learner' as const,
      phone: u.phone_number,
      address: u.address,
      createdAt: '',
    }))
  },

  async getLearnerDashboard() {
    const data = await apiData<{
      courses_in_progress: number
      active_enrolments: number
      recent_enrolments: ApiEnrolment[]
    }>(YLEARN_API.courses.dashboard)
    return {
      coursesInProgress: data.courses_in_progress,
      activeEnrolments: data.active_enrolments,
      recentEnrolments: data.recent_enrolments.map(mapEnrolment),
    }
  },
}
