import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { BookingsManagement } from '@/components/admin/bookings-management'

export const metadata: Metadata = {
  title: 'Gestion des réservations | Administration',
  description: 'Gérer toutes les réservations du système',
}

interface BookingsPageProps {
  params: { locale: string }
}

export default async function BookingsPage({ params }: BookingsPageProps) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect(`/${params.locale}/auth/signin`)
  }

  if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
    redirect(`/${params.locale}/dashboard`)
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestion des réservations</h2>
          <p className="text-muted-foreground">
            Gérez toutes les réservations du système
          </p>
        </div>
      </div>

      <BookingsManagement />
    </div>
  )
}
