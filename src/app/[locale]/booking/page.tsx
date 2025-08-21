import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { BookingSystem } from '@/components/booking/booking-system'

export const metadata: Metadata = {
  title: 'Réserver un créneau | Visite Sri3a',
  description: 'Réservez votre créneau d\'inspection technique',
}

interface BookingPageProps {
  params: { locale: string }
  searchParams: { centerId?: string; carId?: string }
}

export default async function BookingPage({ params, searchParams }: BookingPageProps) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect(`/${params.locale}/auth/signin`)
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Réserver un créneau</h2>
          <p className="text-muted-foreground">
            Choisissez un centre, une date et un créneau horaire pour votre inspection
          </p>
        </div>
      </div>

      <BookingSystem
        userId={session.user.id}
        preselectedCenterId={searchParams.centerId}
        preselectedCarId={searchParams.carId}
      />
    </div>
  )
}
