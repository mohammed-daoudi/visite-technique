'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { CalendarPlus, Car, Settings } from 'lucide-react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { ConditionalRender } from '@/components/auth/protected-route'

interface DashboardHeaderProps {
  user: {
    name?: string | null
    email?: string | null
    role?: string
  }
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const t = useTranslations('dashboard')
  const locale = useLocale()

  return (
    <div className="flex items-center justify-between space-y-2">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {t('welcome')}{user.name ? `, ${user.name}` : ''}
        </h2>
        <p className="text-muted-foreground">
          Voici un aperçu de vos réservations et véhicules
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <ConditionalRender requiredPermission="VIEW_ADMIN_DASHBOARD">
          <Button variant="outline" asChild>
            <Link href={`/${locale}/admin`}>
              <Settings className="mr-2 h-4 w-4" />
              Administration
            </Link>
          </Button>
        </ConditionalRender>
        <Button asChild>
          <Link href={`/${locale}/booking`}>
            <CalendarPlus className="mr-2 h-4 w-4" />
            Nouvelle réservation
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href={`/${locale}/cars`}>
            <Car className="mr-2 h-4 w-4" />
            Mes véhicules
          </Link>
        </Button>
      </div>
    </div>
  )
}
