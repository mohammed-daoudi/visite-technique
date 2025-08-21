import { useSession } from 'next-auth/react'
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  isAdmin,
  isSuperAdmin,
  canAccessAdmin,
  getUserPermissions,
  type Permission
} from '@/lib/rbac'

export function usePermissions() {
  const { data: session } = useSession()
  const userRole = session?.user?.role || ''

  return {
    // Role checks
    isAdmin: isAdmin(userRole),
    isSuperAdmin: isSuperAdmin(userRole),
    canAccessAdmin: canAccessAdmin(userRole),

    // Permission checks
    hasPermission: (permission: Permission) => hasPermission(userRole, permission),
    hasAnyPermission: (permissions: Permission[]) => hasAnyPermission(userRole, permissions),
    hasAllPermissions: (permissions: Permission[]) => hasAllPermissions(userRole, permissions),

    // User info
    userRole,
    userId: session?.user?.id,
    userPermissions: getUserPermissions(userRole),

    // Session info
    isAuthenticated: !!session,
    session
  }
}

// Specific permission hooks for common use cases
export function useCanManageCenters() {
  const { hasPermission } = usePermissions()
  return hasPermission('MANAGE_INSPECTION_CENTERS')
}

export function useCanManageUsers() {
  const { hasPermission } = usePermissions()
  return hasPermission('MANAGE_USERS')
}

export function useCanViewAnalytics() {
  const { hasPermission } = usePermissions()
  return hasPermission('VIEW_ANALYTICS')
}

export function useCanManageBookings() {
  const { hasPermission } = usePermissions()
  return hasPermission('MANAGE_BOOKINGS')
}

export function useCanViewAllBookings() {
  const { hasPermission } = usePermissions()
  return hasPermission('VIEW_ALL_BOOKINGS')
}
