export interface Permission {
  id: string
  name: string
  group: string
  description?: string
}

export interface PermissionsListData {
  permissions: Permission[]
}

export interface RolePermissionSummary {
  id: string
  name: string
  group: string
}

export interface Role {
  id: string
  name: string
  description: string
  is_system: boolean
  is_active: boolean
  permissions?: RolePermissionSummary[]
}

export interface RolesListData {
  roles: Role[]
}

export interface CreateRoleRequest {
  name: string
  description: string
  permission_ids: string[]
}

export interface UpdateRoleRequest {
  name?: string
  description?: string
  is_active?: boolean
}

export interface SetRolePermissionsRequest {
  permission_ids: string[]
}
