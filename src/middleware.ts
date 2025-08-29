import createMiddleware from 'next-intl/middleware'
import { withAuth } from 'next-auth/middleware'
import { NextRequest } from 'next/server'
import { hasPermission } from '@/lib/rbac'

// Create the internationalization middleware
const intlMiddleware = createMiddleware({
  locales: ['fr', 'ar', 'en'],
  defaultLocale: 'fr'
})

// Protected routes configuration
const protectedRoutes = {
  '/admin': 'VIEW_ADMIN_DASHBOARD',
  '/admin/centers': 'MANAGE_INSPECTION_CENTERS',
  '/admin/bookings': 'VIEW_ALL_BOOKINGS',
  '/admin/users': 'VIEW_ALL_USERS',
  '/admin/payments': 'VIEW_PAYMENTS',
  '/admin/analytics': 'VIEW_ANALYTICS',
  '/admin/settings': 'MANAGE_SYSTEM_SETTINGS',
  '/admin/time-slots': 'MANAGE_TIME_SLOTS',
} as const

export default withAuth(
  function middleware(req: NextRequest) {
    // Apply internationalization middleware
    return intlMiddleware(req)
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        // Extract the route without locale prefix
        const localePattern = /^\/(fr|ar|en)/
        const routeWithoutLocale = pathname.replace(localePattern, '') || '/'

        // Check if this is a protected admin route
        const protectedRoute = Object.keys(protectedRoutes).find(route =>
          routeWithoutLocale.startsWith(route)
        )

        if (protectedRoute) {
          const requiredPermission = protectedRoutes[protectedRoute as keyof typeof protectedRoutes]
          const userRole = token?.role as string

          // Check if user has the required permission
          if (!userRole || !hasPermission(userRole, requiredPermission)) {
            return false
          }
        }

        // For dashboard routes, require authentication
        if (routeWithoutLocale.startsWith('/dashboard') ||
            routeWithoutLocale.startsWith('/profile') ||
            routeWithoutLocale.startsWith('/cars') ||
            routeWithoutLocale.startsWith('/bookings')) {
          return !!token
        }

        return true
      },
    },
  }
)

export const config = {
  matcher: ['/', '/(fr|ar|en)/:path*']
}
