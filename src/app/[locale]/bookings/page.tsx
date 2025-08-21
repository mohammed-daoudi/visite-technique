import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { BookingHistory } from '@/components/bookings/booking-history'

export const metadata: Metadata = {
  title: 'Mes réservations | Visite Sri3a',
  description: 'Consultez l\'historique de vos réservations d\'inspection technique',
}

interface BookingsPageProps {
  params: { locale: string }
}

export default async function BookingsPage({ params }: BookingsPageProps) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect(`/${params.locale}/auth/signin`)
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Mes réservations</h2>
          <p className="text-muted-foreground">
            Consultez l'historique de vos réservations et leur statut
          </p>
        </div>
      </div>

      <BookingHistory userId={session.user.id} />
    </div>
  )
}
