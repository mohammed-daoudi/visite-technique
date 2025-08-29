import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { CentersManagement } from '@/components/admin/centers-management'

export const metadata: Metadata = {
  title: 'Gestion des centres | Administration',
  description: 'Gérer les centres d\'inspection technique',
}

interface CentersPageProps {
  params: { locale: string }
}

export default async function CentersPage({ params }: CentersPageProps) {
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
          <h2 className="text-3xl font-bold tracking-tight">Centres d'inspection</h2>
          <p className="text-muted-foreground">
            Gérez les centres d'inspection technique
          </p>
        </div>
      </div>

      <CentersManagement />
    </div>
  )
}
