import { UserRole } from '@prisma/client'

// Define permissions for each role
export const PERMISSIONS = {
  // User permissions
  VIEW_OWN_DASHBOARD: ['USER', 'ADMIN', 'SUPER_ADMIN'],
  MANAGE_OWN_CARS: ['USER', 'ADMIN', 'SUPER_ADMIN'],
  CREATE_BOOKINGS: ['USER', 'ADMIN', 'SUPER_ADMIN'],
  VIEW_OWN_BOOKINGS: ['USER', 'ADMIN', 'SUPER_ADMIN'],
  MANAGE_OWN_PROFILE: ['USER', 'ADMIN', 'SUPER_ADMIN'],

  // Admin permissions
  VIEW_ADMIN_DASHBOARD: ['ADMIN', 'SUPER_ADMIN'],
  MANAGE_INSPECTION_CENTERS: ['ADMIN', 'SUPER_ADMIN'],
  MANAGE_TIME_SLOTS: ['ADMIN', 'SUPER_ADMIN'],
  VIEW_ALL_BOOKINGS: ['ADMIN', 'SUPER_ADMIN'],
  MANAGE_BOOKINGS: ['ADMIN', 'SUPER_ADMIN'],
  VIEW_ALL_USERS: ['ADMIN', 'SUPER_ADMIN'],
  MANAGE_USERS: ['ADMIN', 'SUPER_ADMIN'],
  VIEW_PAYMENTS: ['ADMIN', 'SUPER_ADMIN'],
  VIEW_ANALYTICS: ['ADMIN', 'SUPER_ADMIN'],

  // Super Admin permissions
  MANAGE_SYSTEM_SETTINGS: ['SUPER_ADMIN'],
  MANAGE_ADMIN_USERS: ['SUPER_ADMIN'],
  VIEW_SYSTEM_LOGS: ['SUPER_ADMIN'],
  MANAGE_ROLES: ['SUPER_ADMIN'],
  BACKUP_DATABASE: ['SUPER_ADMIN'],
} as const

export type Permission = keyof typeof PERMISSIONS

/**
 * Check if a user role has a specific permission
 */
export function hasPermission(userRole: string, permission: Permission): boolean {
  const allowedRoles = PERMISSIONS[permission]
  return allowedRoles.some(role => role === userRole)
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(userRole: string, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(userRole, permission))
}

/**
 * Check if user has all of the specified permissions
 */
export function hasAllPermissions(userRole: string, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(userRole, permission))
}

/**
 * Get all permissions for a user role
 */
export function getUserPermissions(userRole: string): Permission[] {
  return Object.keys(PERMISSIONS).filter(permission =>
    hasPermission(userRole, permission as Permission)
  ) as Permission[]
}

/**
 * Check if user is admin (ADMIN or SUPER_ADMIN)
 */
export function isAdmin(userRole: string): boolean {
  return userRole === 'ADMIN' || userRole === 'SUPER_ADMIN'
}

/**
 * Check if user is super admin
 */
export function isSuperAdmin(userRole: string): boolean {
  return userRole === 'SUPER_ADMIN'
}

/**
 * Check if user can access admin features
 */
export function canAccessAdmin(userRole: string): boolean {
  return hasPermission(userRole, 'VIEW_ADMIN_DASHBOARD')
}

/**
 * Get redirect path based on user role
 */
export function getDefaultRedirectPath(userRole: string, locale: string = 'fr'): string {
  if (isAdmin(userRole)) {
    return `/${locale}/admin`
  }
  return `/${locale}/dashboard`
}

/**
 * Role hierarchy for comparison
 */
export const ROLE_HIERARCHY = {
  'USER': 1,
  'ADMIN': 2,
  'SUPER_ADMIN': 3
} as const

/**
 * Check if a role has higher or equal privileges than another role
 */
export function hasHigherOrEqualRole(userRole: string, requiredRole: string): boolean {
  const userLevel = ROLE_HIERARCHY[userRole as keyof typeof ROLE_HIERARCHY] || 0
  const requiredLevel = ROLE_HIERARCHY[requiredRole as keyof typeof ROLE_HIERARCHY] || 0
  return userLevel >= requiredLevel
}

/**
 * Get user role display name
 */
export function getRoleDisplayName(role: string, locale: string = 'fr'): string {
  const roleNames = {
    fr: {
      'USER': 'Utilisateur',
      'ADMIN': 'Administrateur',
      'SUPER_ADMIN': 'Super Administrateur'
    },
    en: {
      'USER': 'User',
      'ADMIN': 'Administrator',
      'SUPER_ADMIN': 'Super Administrator'
    },
    ar: {
      'USER': 'مستخدم',
      'ADMIN': 'مدير',
      'SUPER_ADMIN': 'مدير أعلى'
    }
  }

  return roleNames[locale as keyof typeof roleNames]?.[role as keyof typeof roleNames['fr']] || role
}
