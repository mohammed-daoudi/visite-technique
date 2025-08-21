import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { DashboardStats } from '@/components/dashboard/dashboard-stats'
import { RecentBookings } from '@/components/dashboard/recent-bookings'
import { Button } from '@/components/ui/button'
import { Car, CalendarCheck } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Tableau de bord | Visite Sri3a',
  description: 'Gérez vos réservations et véhicules',
}

interface DashboardPageProps {
  params: { locale: string }
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect(`/${params.locale}/auth/signin`)
  }

  return (
    <div className="flex-1 mobile-container py-4 sm:py-6 lg:py-8">
      <div className="space-y-6 sm:space-y-8">
        <DashboardHeader user={session.user} />

        {/* Stats Grid - Mobile First */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <DashboardStats userId={session.user.id} />
        </div>

        {/* Main Content Grid - Mobile First */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 sm:gap-8">
          <div className="lg:col-span-4 space-y-6">
            <RecentBookings userId={session.user.id} />
          </div>
          <div className="lg:col-span-3 space-y-6">
            {/* Quick Actions Card - Mobile Optimized */}
            <div className="mobile-card">
              <h3 className="mobile-subheading">Actions rapides</h3>
              <div className="space-y-3">
                <p className="mobile-body-text text-muted-foreground">
                  Gérez facilement vos véhicules et réservations
                </p>
                <div className="grid grid-cols-1 gap-3">
                  <Button
                    asChild
                    className="mobile-button justify-start"
                    variant="outline"
                  >
                    <Link href={`/${params.locale}/cars`}>
                      <Car className="mr-2 h-4 w-4" />
                      Ajouter un véhicule
                    </Link>
                  </Button>
                  <Button
                    asChild
                    className="mobile-button justify-start"
                  >
                    <Link href={`/${params.locale}/booking`}>
                      <CalendarCheck className="mr-2 h-4 w-4" />
                      Nouvelle réservation
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
