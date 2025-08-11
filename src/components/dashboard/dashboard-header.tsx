'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { CalendarPlus, Car } from 'lucide-react'
import Link from 'next/link'
import { useLocale } from 'next-intl'

interface DashboardHeaderProps {
  user: {
    name?: string | null
    email?: string | null
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
