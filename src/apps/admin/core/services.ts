import { API_ENDPOINTS } from './api.constants'
import { mapBackendAdminToProfile, toAdminLoginData } from './authMappers'
import { apiData, apiRequest } from './apiClient'
import type {
  ActivatePaymentRequest,
  AdminLoginData,
  AdminLoginRequest,
  AdminPaymentListData,
  AdminPaymentListParams,
  AdminProfile,
  AdminRider,
  AdminRiderListData,
  AdminRiderListParams,
  AdminUserListData,
  AdminUserListItem,
  ApiSimpleSuccess,
  BackendAdminProfileResponse,
  BackendAdminSigninResponse,
  ChangePasswordRequest,
  CreateAdminUserRequest,
  CreateRoleRequest,
  PaginationParams,
  Permission,
  RejectRiderRequest,
  ResetAdminUserPasswordRequest,
  Role,
  SetRolePermissionsRequest,
  SettingKey,
  SystemSetting,
  UpdateAdminUserRequest,
  UpdateRoleRequest,
  UpdateSettingRequest,
  UpdateSettingResponseData,
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

export const riderApi = {
  async list(params: AdminRiderListParams = {}) {
    const data = await apiData<AdminRiderListData>(API_ENDPOINTS.adminRiders.list, {
      params: params as Record<string, string | number | boolean | undefined>,
    })
    return {
      total: data.total,
      page: data.page,
      pages: data.pages,
      riders: data.riders ?? data.items ?? [],
    }
  },
  getById(id: string) {
    return apiData<AdminRider>(API_ENDPOINTS.adminRiders.detail(id))
  },
  approve(id: string) {
    return apiData<AdminRider>(API_ENDPOINTS.adminRiders.approve(id), { method: 'POST', body: '{}' })
  },
  reject(id: string, payload: RejectRiderRequest) {
    return apiData<AdminRider>(API_ENDPOINTS.adminRiders.reject(id), {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  activate(id: string) {
    return apiData<AdminRider>(API_ENDPOINTS.adminRiders.activate(id), { method: 'POST', body: '{}' })
  },
  suspend(id: string) {
    return apiData<AdminRider>(API_ENDPOINTS.adminRiders.suspend(id), { method: 'POST', body: '{}' })
  },
  deactivate(id: string) {
    return apiData<AdminRider>(API_ENDPOINTS.adminRiders.deactivate(id), { method: 'POST', body: '{}' })
  },
  resetStatus(id: string) {
    return apiData<AdminRider>(API_ENDPOINTS.adminRiders.resetStatus(id), { method: 'PUT', body: '{}' })
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
        customer: p.customer,
        type: p.type,
        method: (p.method ?? null) as string | undefined,
        amount: parseFloat(String(p.amount_ghs ?? p.amount ?? '0')),
        status: p.status,
        created_at: p.created_at as string,
      })),
    } as AdminPaymentListData
  },
  activate(payload: ActivatePaymentRequest) {
    return apiData<unknown>(API_ENDPOINTS.adminPayments.activate, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
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
