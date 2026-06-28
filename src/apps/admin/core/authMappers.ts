import type { AdminLoginData, AdminProfile, BackendAdminProfileResponse } from './models'

function resolveRole(admin: BackendAdminProfileResponse): { id: string; name: string } {
  if (admin.role && typeof admin.role === 'object') {
    return { id: admin.role.id, name: admin.role.name }
  }

  const legacyRole = typeof admin.role === 'string' ? admin.role : 'super_admin'
  const normalized = legacyRole.toLowerCase()
  return {
    id: admin.role_id ?? normalized,
    name: normalized,
  }
}

export function mapBackendAdminToProfile(admin: BackendAdminProfileResponse): AdminProfile {
  return {
    id: admin.id,
    full_name: admin.fullname,
    email: admin.email,
    phone: admin.phone_number ?? undefined,
    reset_required: admin.reset_required ?? false,
    role: resolveRole(admin),
  }
}

export function toAdminLoginData(
  accessToken: string,
  admin: BackendAdminProfileResponse,
): AdminLoginData {
  return {
    token: accessToken,
    admin: mapBackendAdminToProfile(admin),
  }
}
