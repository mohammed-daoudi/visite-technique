import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { DashboardStats } from '@/components/dashboard/dashboard-stats'
import { RecentBookings } from '@/components/dashboard/recent-bookings'

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
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <DashboardHeader user={session.user} />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardStats userId={session.user.id} />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <RecentBookings userId={session.user.id} />
        </div>
        <div className="col-span-3">
          {/* Quick actions or notifications could go here */}
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold">Actions rapides</h3>
            <div className="mt-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                Ajoutez votre premier véhicule pour commencer
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
