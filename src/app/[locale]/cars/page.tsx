import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { CarManagement } from '@/components/cars/car-management'

export const metadata: Metadata = {
  title: 'Mes véhicules | Visite Sri3a',
  description: 'Gérez vos véhicules pour les inspections techniques',
}

interface CarsPageProps {
  params: { locale: string }
}

export default async function CarsPage({ params }: CarsPageProps) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect(`/${params.locale}/auth/signin`)
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Mes véhicules</h2>
          <p className="text-muted-foreground">
            Gérez vos véhicules pour les inspections techniques
          </p>
        </div>
      </div>

      <CarManagement userId={session.user.id} />
    </div>
  )
}
