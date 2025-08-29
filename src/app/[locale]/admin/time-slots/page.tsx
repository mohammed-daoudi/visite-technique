import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { TimeSlotManagement } from '@/components/admin/time-slot-management'

export const metadata: Metadata = {
  title: 'Gestion des créneaux | Administration',
  description: 'Gérer les créneaux horaires des centres d\'inspection',
}

interface TimeSlotsPageProps {
  params: { locale: string }
}

export default async function TimeSlotsPage({ params }: TimeSlotsPageProps) {
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
          <h2 className="text-3xl font-bold tracking-tight">Créneaux horaires</h2>
          <p className="text-muted-foreground">
            Gérez les créneaux horaires des centres d'inspection
          </p>
        </div>
      </div>

      <TimeSlotManagement />
    </div>
  )
}
