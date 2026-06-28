import type { AdminLoginData, AdminProfile, BackendAdminProfileResponse } from './models'

function normalizeRoleName(role: string): string {
  return role.toLowerCase().replace(/_/g, '_')
}

export function mapBackendAdminToProfile(admin: BackendAdminProfileResponse): AdminProfile {
  const roleName = admin.role ?? 'ADMIN'

  return {
    id: admin.id,
    full_name: admin.fullname,
    email: admin.email,
    phone: admin.phone_number ?? undefined,
    reset_required: false,
    role: {
      id: roleName,
      name: normalizeRoleName(roleName),
    },
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
