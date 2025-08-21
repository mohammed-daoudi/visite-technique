'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { hasPermission, isAdmin, type Permission } from '@/lib/rbac'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'USER' | 'ADMIN' | 'SUPER_ADMIN'
  requiredPermission?: Permission
  requiredPermissions?: Permission[]
  requireAll?: boolean // If true, user must have ALL permissions, otherwise ANY
  fallbackPath?: string
  locale?: string
  showFallback?: boolean
  fallbackComponent?: React.ReactNode
}

export function ProtectedRoute({
  children,
  requiredRole,
  requiredPermission,
  requiredPermissions = [],
  requireAll = false,
  fallbackPath,
  locale = 'fr',
  showFallback = false,
  fallbackComponent
}: ProtectedRouteProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    // Redirect to login if not authenticated
    if (!session) {
      router.push(`/${locale}/auth/signin`)
      return
    }

    const userRole = session.user.role

    // Check role requirement
    if (requiredRole && userRole !== requiredRole) {
      // Check if user has admin privileges when admin is required
      if (requiredRole === 'ADMIN' && !isAdmin(userRole)) {
        const redirectPath = fallbackPath || `/${locale}/dashboard`
        router.push(redirectPath)
        return
      }
      // Check if user has super admin privileges when super admin is required
      if (requiredRole === 'SUPER_ADMIN' && userRole !== 'SUPER_ADMIN') {
        const redirectPath = fallbackPath || `/${locale}/admin`
        router.push(redirectPath)
        return
      }
    }

    // Check specific permission
    if (requiredPermission && !hasPermission(userRole, requiredPermission)) {
      const redirectPath = fallbackPath || `/${locale}/dashboard`
      router.push(redirectPath)
      return
    }

    // Check multiple permissions
    if (requiredPermissions.length > 0) {
      const hasRequiredPermissions = requireAll
        ? requiredPermissions.every(permission => hasPermission(userRole, permission))
        : requiredPermissions.some(permission => hasPermission(userRole, permission))

      if (!hasRequiredPermissions) {
        const redirectPath = fallbackPath || `/${locale}/dashboard`
        router.push(redirectPath)
        return
      }
    }
  }, [session, status, router, requiredRole, requiredPermission, requiredPermissions, requireAll, fallbackPath, locale])

  // Show loading state
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Show fallback if user doesn't have permission and showFallback is true
  if (session && showFallback) {
    const userRole = session.user.role

    // Check permissions again for fallback display
    let hasAccess = true

    if (requiredRole) {
      if (requiredRole === 'ADMIN' && !isAdmin(userRole)) hasAccess = false
      if (requiredRole === 'SUPER_ADMIN' && userRole !== 'SUPER_ADMIN') hasAccess = false
      if (requiredRole === 'USER' && userRole !== requiredRole) hasAccess = false
    }

    if (requiredPermission && !hasPermission(userRole, requiredPermission)) {
      hasAccess = false
    }

    if (requiredPermissions.length > 0) {
      const hasRequiredPermissions = requireAll
        ? requiredPermissions.every(permission => hasPermission(userRole, permission))
        : requiredPermissions.some(permission => hasPermission(userRole, permission))

      if (!hasRequiredPermissions) hasAccess = false
    }

    if (!hasAccess) {
      return fallbackComponent || (
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900">Accès non autorisé</h3>
            <p className="text-sm text-gray-500 mt-1">
              Vous n'avez pas les permissions nécessaires pour voir ce contenu.
            </p>
          </div>
        </div>
      )
    }
  }

  return <>{children}</>
}

// Wrapper component for conditional rendering based on permissions
interface ConditionalRenderProps {
  children: React.ReactNode
  requiredRole?: 'USER' | 'ADMIN' | 'SUPER_ADMIN'
  requiredPermission?: Permission
  requiredPermissions?: Permission[]
  requireAll?: boolean
  fallback?: React.ReactNode
}

export function ConditionalRender({
  children,
  requiredRole,
  requiredPermission,
  requiredPermissions = [],
  requireAll = false,
  fallback = null
}: ConditionalRenderProps) {
  const { data: session } = useSession()

  if (!session) return <>{fallback}</>

  const userRole = session.user.role
  let hasAccess = true

  // Check role requirement
  if (requiredRole) {
    if (requiredRole === 'ADMIN' && !isAdmin(userRole)) hasAccess = false
    if (requiredRole === 'SUPER_ADMIN' && userRole !== 'SUPER_ADMIN') hasAccess = false
    if (requiredRole === 'USER' && userRole !== requiredRole) hasAccess = false
  }

  // Check specific permission
  if (requiredPermission && !hasPermission(userRole, requiredPermission)) {
    hasAccess = false
  }

  // Check multiple permissions
  if (requiredPermissions.length > 0) {
    const hasRequiredPermissions = requireAll
      ? requiredPermissions.every(permission => hasPermission(userRole, permission))
      : requiredPermissions.some(permission => hasPermission(userRole, permission))

    if (!hasRequiredPermissions) hasAccess = false
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>
}
