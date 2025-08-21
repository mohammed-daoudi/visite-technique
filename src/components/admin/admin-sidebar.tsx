'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { hasPermission } from '@/lib/rbac'
import {
  LayoutDashboard,
  Building2,
  Calendar,
  Users,
  Car,
  CreditCard,
  Settings,
  BarChart3,
  Clock,
  MapPin,
  Mail,
} from 'lucide-react'

interface AdminSidebarProps {
  userRole: string
  locale: string
}

const adminNavItems = [
  {
    title: 'Tableau de bord',
    href: '/admin',
    icon: LayoutDashboard,
    permission: 'VIEW_ADMIN_DASHBOARD' as const
  },
  {
    title: 'Centres d\'inspection',
    href: '/admin/centers',
    icon: Building2,
    permission: 'MANAGE_INSPECTION_CENTERS' as const
  },
  {
    title: 'Créneaux horaires',
    href: '/admin/time-slots',
    icon: Clock,
    permission: 'MANAGE_TIME_SLOTS' as const
  },
  {
    title: 'Réservations',
    href: '/admin/bookings',
    icon: Calendar,
    permission: 'VIEW_ALL_BOOKINGS' as const
  },
  {
    title: 'Utilisateurs',
    href: '/admin/users',
    icon: Users,
    permission: 'VIEW_ALL_USERS' as const
  },
  {
    title: 'Véhicules',
    href: '/admin/vehicles',
    icon: Car,
    permission: 'VIEW_ALL_USERS' as const // Using this permission for vehicle management
  },
  {
    title: 'Paiements',
    href: '/admin/payments',
    icon: CreditCard,
    permission: 'VIEW_PAYMENTS' as const
  },
  {
    title: 'Statistiques',
    href: '/admin/analytics',
    icon: BarChart3,
    permission: 'VIEW_ANALYTICS' as const
  },
  {
    title: 'Configuration Email',
    href: '/admin/email',
    icon: Mail,
    permission: 'MANAGE_SYSTEM_SETTINGS' as const
  },
  {
    title: 'Paramètres système',
    href: '/admin/settings',
    icon: Settings,
    permission: 'MANAGE_SYSTEM_SETTINGS' as const
  },
]

export function AdminSidebar({ userRole, locale }: AdminSidebarProps) {
  const pathname = usePathname()

  // Filter nav items based on user permissions
  const filteredNavItems = adminNavItems.filter(item =>
    hasPermission(userRole, item.permission)
  )

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <Link href={`/${locale}/admin`} className="flex items-center space-x-2">
          <MapPin className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">Visite Sri3a</h1>
            <p className="text-xs text-gray-500">Administration</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1">
        {filteredNavItems.map((item) => {
          const isActive = pathname === `/${locale}${item.href}`
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={`/${locale}${item.href}`}
              className={cn(
                'flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.title}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          <p>Version 1.0.0</p>
          <p>© 2024 Visite Sri3a</p>
        </div>
      </div>
    </div>
  )
}
