import { API_ENDPOINTS } from './api.constants'
import { mapBackendAdminToProfile, toAdminLoginData } from './authMappers'
import { apiData, apiRequest } from './apiClient'
import { getAppConfig } from './appConfig'
import { ApiError, extractErrorMessage } from './utils/apiError'
import type {
  ActivatePaymentRequest,
  AdminLoginData,
  AdminLoginRequest,
  AdminPaymentListData,
  AdminPaymentListParams,
  AdminProfile,
  AdminUserListData,
  AdminUserListItem,
  ApiSimpleSuccess,
  BackendAdminProfileResponse,
  BackendAdminSigninResponse,
  ChangePasswordRequest,
  CreateAdminUserRequest,
  CreateRoleRequest,
  PaginationParams,
  PaymentOverview,
  PaymentConfig,
  Permission,
  RejectVhsRequest,
  ResetAdminUserPasswordRequest,
  Role,
  SetRolePermissionsRequest,
  SettingKey,
  SystemSetting,
  UpdateAdminUserRequest,
  UpdateRoleRequest,
  UpdateSettingRequest,
  UpdateSettingResponseData,
  MemberUser,
  MemberUserListData,
  MemberUserListParams,
  MemberUserOverview,
  UpdateMemberUserRequest,
  VolunteerHoursSubmission,
  VhsSubmissionListData,
  VhsSubmissionListParams,
  Form,
  FormDetail,
  FormListData,
  FormListParams,
  FormResponsesListData,
  FormResponsesParams,
  FormAnalytics,
  CreateFormRequest,
  UpdateFormRequest,
  ProgramDetail,
  ProgramListData,
  ProgramListParams,
  CreateProgramRequest,
  UpdateProgramRequest,
  FileUploadResponse,
  NewsItem,
  NewsListData,
  NewsListParams,
  CreateNewsRequest,
  UpdateNewsRequest,
  CreateProminentProfileRequest,
  ProminentProfile,
  ProminentProfileListData,
  ProminentProfileListParams,
  UpdateProminentProfileRequest,
  Branch,
  Region,
  CreateBranchRequest,
  UpdateBranchRequest,
  AssignPresidentRequest,
  ScopeFilterParams,
  ProgressOverview,
  BroadcastMessageRequest,
  BroadcastMessageResponse,
} from './models'
import { storage } from './utils/storage'

export const authApi = {
  async login(payload: AdminLoginRequest): Promise<AdminLoginData> {
    const signin = await apiRequest<BackendAdminSigninResponse>(API_ENDPOINTS.adminAuth.login, {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    storage.setItem('token', signin.access_token)
    if (signin.refresh_token) {
      storage.setItem('refresh_token', signin.refresh_token)
    }

    try {
      const profile = await apiRequest<BackendAdminProfileResponse>(API_ENDPOINTS.adminAuth.me)
      return toAdminLoginData(signin.access_token, profile)
    } catch (error) {
      storage.removeItem('token')
      storage.removeItem('refresh_token')
      throw error
    }
  },
  async me(): Promise<AdminProfile> {
    const profile = await apiRequest<BackendAdminProfileResponse>(API_ENDPOINTS.adminAuth.me)
    return mapBackendAdminToProfile(profile)
  },
  logout() {
    return apiRequest<ApiSimpleSuccess>(API_ENDPOINTS.adminAuth.logout, {
      method: 'POST',
      body: JSON.stringify({}),
    })
  },
  changePassword(payload: ChangePasswordRequest) {
    return apiRequest<ApiSimpleSuccess>(API_ENDPOINTS.adminAuth.changePassword, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
}

export const vhsApi = {
  async list(params: VhsSubmissionListParams = {}) {
    const data = await apiData<VhsSubmissionListData>(API_ENDPOINTS.adminVhs.list, {
      params: params as Record<string, string | number | boolean | undefined>,
    })
    return {
      total: data.total,
      page: data.page,
      pages: data.pages,
      submissions: data.submissions ?? [],
    }
  },
  getById(id: string) {
    return apiData<VolunteerHoursSubmission>(API_ENDPOINTS.adminVhs.detail(id))
  },
  approve(id: string) {
    return apiData<VolunteerHoursSubmission>(API_ENDPOINTS.adminVhs.approve(id), {
      method: 'POST',
      body: '{}',
    })
  },
  reject(id: string, payload: RejectVhsRequest) {
    return apiData<VolunteerHoursSubmission>(API_ENDPOINTS.adminVhs.reject(id), {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
}

export const paymentApi = {
  async list(params: AdminPaymentListParams = {}) {
    const res = await apiRequest<{ data: Record<string, unknown> }>(API_ENDPOINTS.adminPayments.list, {
      params: params as Record<string, string | number | boolean | undefined>,
    })
    const d = res.data
    const rawItems = (d.payments ?? d.items ?? []) as Array<Record<string, unknown>>
    return {
      total: d.total as number,
      page: d.page as number,
      pages: d.pages as number,
      payments: rawItems.map((p) => ({
        id: p.id as string,
        reference: (p.paystack_ref ?? p.reference ?? '—') as string,
        user: (p.user ?? p.customer) as AdminPaymentListData['payments'][0]['user'],
        type: p.type,
        method: (p.method ?? null) as string | undefined,
        amount: parseFloat(String(p.amount_ghs ?? p.amount ?? '0')),
        status: p.status,
        created_at: p.created_at as string,
      })),
    } as AdminPaymentListData
  },
  overview() {
    return apiData<PaymentOverview>(API_ENDPOINTS.adminPayments.overview)
  },
  activate(payload: ActivatePaymentRequest) {
    return apiData<unknown>(API_ENDPOINTS.adminPayments.activate, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  config() {
    return apiData<PaymentConfig>(API_ENDPOINTS.payments.config)
  },
}

export const roleApi = {
  async listPermissions() {
    const res = await apiRequest<{ data: Permission[] | { permissions?: Permission[]; items?: Permission[] } }>(
      API_ENDPOINTS.adminRoles.permissions,
    )
    const d = res.data
    return Array.isArray(d) ? d : (d.permissions ?? d.items ?? [])
  },
  async listRoles(includePermissions = true) {
    const res = await apiRequest<{ data: Role[] | { roles?: Role[]; items?: Role[] } }>(
      API_ENDPOINTS.adminRoles.list,
      { params: { include_permissions: includePermissions } },
    )
    const d = res.data
    return Array.isArray(d) ? d : (d.roles ?? d.items ?? [])
  },
  getRole(id: string, includePermissions = true) {
    return apiData<Role>(API_ENDPOINTS.adminRoles.detail(id), {
      params: { include_permissions: includePermissions },
    })
  },
  createRole(payload: CreateRoleRequest) {
    return apiData<Role>(API_ENDPOINTS.adminRoles.create, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  updateRole(id: string, payload: UpdateRoleRequest) {
    return apiData<Role>(API_ENDPOINTS.adminRoles.update(id), {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  },
  deleteRole(id: string) {
    return apiRequest<ApiSimpleSuccess>(API_ENDPOINTS.adminRoles.delete(id), { method: 'DELETE' })
  },
  setRolePermissions(id: string, payload: SetRolePermissionsRequest) {
    return apiData<Role>(API_ENDPOINTS.adminRoles.setPermissions(id), {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  },
}

export const adminUserApi = {
  async list(params: PaginationParams = {}) {
    const res = await apiRequest<{ data: AdminUserListData & { items?: AdminUserListItem[] } }>(
      API_ENDPOINTS.adminUsers.list,
      { params: params as Record<string, string | number | boolean | undefined> },
    )
    const d = res.data
    return {
      total: d.total,
      page: d.page,
      pages: d.pages,
      users: d.users ?? d.items ?? [],
    }
  },
  getById(id: string) {
    return apiData<AdminUserListItem>(API_ENDPOINTS.adminUsers.detail(id))
  },
  create(payload: CreateAdminUserRequest) {
    return apiData<AdminUserListItem>(API_ENDPOINTS.adminUsers.create, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  update(id: string, payload: UpdateAdminUserRequest) {
    return apiData<AdminUserListItem>(API_ENDPOINTS.adminUsers.update(id), {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  },
  deactivate(id: string) {
    return apiRequest<ApiSimpleSuccess>(API_ENDPOINTS.adminUsers.deactivate(id), {
      method: 'POST',
      body: '{}',
    })
  },
  resetPassword(id: string, payload: ResetAdminUserPasswordRequest) {
    return apiRequest<ApiSimpleSuccess>(API_ENDPOINTS.adminUsers.resetPassword(id), {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
}

export const memberUserApi = {
  overview(params: ScopeFilterParams = {}) {
    return apiData<MemberUserOverview>(API_ENDPOINTS.adminMembers.overview, {
      params: params as Record<string, string | number | boolean | undefined>,
    })
  },
  async list(params: MemberUserListParams = {}) {
    const res = await apiRequest<{ data: MemberUserListData }>(API_ENDPOINTS.adminMembers.list, {
      params: params as Record<string, string | number | boolean | undefined>,
    })
    const d = res.data
    return {
      total: d.total,
      page: d.page,
      pages: d.pages,
      users: d.users ?? [],
    }
  },
  getById(id: string) {
    return apiData<MemberUser>(API_ENDPOINTS.adminMembers.detail(id))
  },
  update(id: string, payload: UpdateMemberUserRequest) {
    return apiData<MemberUser>(API_ENDPOINTS.adminMembers.update(id), {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  },
  deactivate(id: string) {
    return apiRequest<ApiSimpleSuccess>(API_ENDPOINTS.adminMembers.deactivate(id), {
      method: 'POST',
      body: '{}',
    })
  },
}

export const settingsApi = {
  list() {
    return apiData<SystemSetting[]>(API_ENDPOINTS.adminSettings.list)
  },
  update(key: SettingKey, payload: UpdateSettingRequest) {
    return apiData<UpdateSettingResponseData>(API_ENDPOINTS.adminSettings.update(key), {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  },
}

export const formApi = {
  async list(params: FormListParams = {}) {
    return apiRequest<FormListData>(API_ENDPOINTS.forms.list, {
      params: params as Record<string, string | number | boolean | undefined>,
    })
  },
  getById(id: string) {
    return apiRequest<Form>(API_ENDPOINTS.forms.detail(id))
  },
  getDetail(id: string) {
    return apiRequest<FormDetail>(API_ENDPOINTS.forms.detailWithCount(id))
  },
  create(payload: CreateFormRequest) {
    return apiRequest<Form>(API_ENDPOINTS.forms.create, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  update(id: string, payload: UpdateFormRequest) {
    return apiRequest<Form>(API_ENDPOINTS.forms.update(id), {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  },
  delete(id: string) {
    return apiRequest<{ message: string }>(API_ENDPOINTS.forms.delete(id), {
      method: 'DELETE',
    })
  },
  async listResponses(formId: string, params: FormResponsesParams = {}) {
    return apiRequest<FormResponsesListData>(API_ENDPOINTS.forms.responses(formId), {
      params: params as Record<string, string | number | boolean | undefined>,
    })
  },
  getAnalytics(formId: string) {
    return apiRequest<FormAnalytics>(API_ENDPOINTS.forms.analytics(formId))
  },
  async exportResponses(formId: string, filename: string) {
    const baseUrl = getAppConfig().apiBaseUrl
    const token = storage.getItem('token')
    const response = await fetch(`${baseUrl}${API_ENDPOINTS.forms.export(formId)}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (!response.ok) {
      const text = await response.text()
      let body: unknown = text
      try {
        body = JSON.parse(text)
      } catch {
        /* keep text */
      }
      throw new ApiError(
        extractErrorMessage(response.status, body, response.statusText),
        response.status,
        body,
      )
    }
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  },
}

export const programApi = {
  async list(params: ProgramListParams = {}) {
    return apiRequest<ProgramListData>(API_ENDPOINTS.programs.list, {
      params: params as Record<string, string | number | boolean | undefined>,
    })
  },
  getById(id: string) {
    return apiRequest<ProgramDetail>(API_ENDPOINTS.programs.detail(id))
  },
  create(payload: CreateProgramRequest) {
    return apiRequest<ProgramDetail>(API_ENDPOINTS.programs.create, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  update(id: string, payload: UpdateProgramRequest) {
    return apiRequest<ProgramDetail>(API_ENDPOINTS.programs.update(id), {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  },
  delete(id: string) {
    return apiRequest<{ message: string }>(API_ENDPOINTS.programs.delete(id), {
      method: 'DELETE',
    })
  },
}

export const newsApi = {
  async list(params: NewsListParams = {}) {
    return apiRequest<NewsListData>(API_ENDPOINTS.news.list, {
      params: params as Record<string, string | number | boolean | undefined>,
    })
  },
  getById(id: string) {
    return apiRequest<NewsItem>(API_ENDPOINTS.news.detail(id))
  },
  create(payload: CreateNewsRequest) {
    return apiRequest<NewsItem>(API_ENDPOINTS.news.create, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  update(id: string, payload: UpdateNewsRequest) {
    return apiRequest<NewsItem>(API_ENDPOINTS.news.update(id), {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  },
  publish(id: string) {
    return apiRequest<NewsItem>(API_ENDPOINTS.news.publish(id), { method: 'POST' })
  },
  unpublish(id: string) {
    return apiRequest<NewsItem>(API_ENDPOINTS.news.unpublish(id), { method: 'POST' })
  },
  delete(id: string) {
    return apiRequest<{ message: string }>(API_ENDPOINTS.news.delete(id), {
      method: 'DELETE',
    })
  },
}

export const profileApi = {
  async list(params: ProminentProfileListParams = {}) {
    return apiRequest<ProminentProfileListData>(API_ENDPOINTS.profiles.list, {
      params: params as Record<string, string | number | boolean | undefined>,
    })
  },
  create(payload: CreateProminentProfileRequest) {
    return apiRequest<ProminentProfile>(API_ENDPOINTS.profiles.create, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  update(id: string, payload: UpdateProminentProfileRequest) {
    return apiRequest<ProminentProfile>(API_ENDPOINTS.profiles.update(id), {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  },
  delete(id: string) {
    return apiRequest<{ message: string }>(API_ENDPOINTS.profiles.delete(id), {
      method: 'DELETE',
    })
  },
}

export const storageApi = {
  async upload(file: File): Promise<FileUploadResponse> {
    const baseUrl = getAppConfig().apiBaseUrl
    const token = storage.getItem('token')
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${baseUrl}${API_ENDPOINTS.storage.upload}`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    })

    const text = await response.text()
    let body: unknown = text
    try {
      body = JSON.parse(text)
    } catch {
      /* keep text */
    }

    if (!response.ok) {
      throw new ApiError(
        extractErrorMessage(response.status, body, response.statusText),
        response.status,
        body,
      )
    }

    return body as FileUploadResponse
  },
}

export const branchApi = {
  async listRegions(activeOnly = true) {
    const data = await apiData<{ regions: Region[] }>(API_ENDPOINTS.adminBranches.regions, {
      params: { active_only: activeOnly },
    })
    return data.regions ?? []
  },
  createRegion(payload: { name: string }) {
    return apiData<Region>(API_ENDPOINTS.adminBranches.regions, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  updateRegion(id: string, payload: { name?: string; is_active?: boolean }) {
    return apiData<Region>(API_ENDPOINTS.adminBranches.region(id), {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  },
  async listBranches(regionId?: string, activeOnly = true) {
    const data = await apiData<{ branches: Branch[] }>(API_ENDPOINTS.adminBranches.branches, {
      params: {
        region_id: regionId,
        active_only: activeOnly,
      },
    })
    return data.branches ?? []
  },
  getBranch(id: string) {
    return apiData<Branch>(API_ENDPOINTS.adminBranches.branch(id))
  },
  createBranch(payload: CreateBranchRequest) {
    return apiData<Branch>(API_ENDPOINTS.adminBranches.branches, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  updateBranch(id: string, payload: UpdateBranchRequest) {
    return apiData<Branch>(API_ENDPOINTS.adminBranches.branch(id), {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  },
  assignPresident(id: string, payload: AssignPresidentRequest) {
    return apiData<Branch>(API_ENDPOINTS.adminBranches.assignPresident(id), {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  progressOverview(params: ScopeFilterParams = {}) {
    return apiData<ProgressOverview>(API_ENDPOINTS.adminBranches.progress, {
      params: params as Record<string, string | number | boolean | undefined>,
    })
  },
  broadcast(payload: BroadcastMessageRequest) {
    return apiData<BroadcastMessageResponse>(API_ENDPOINTS.adminBranches.broadcast, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
}
