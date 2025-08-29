import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { UsersManagement } from '@/components/admin/users-management'

export const metadata: Metadata = {
  title: 'Gestion des Utilisateurs | Administration',
  description: 'Gérer les comptes utilisateurs et leurs permissions',
}

interface UsersPageProps {
  params: { locale: string }
}

export default async function UsersPage({ params }: UsersPageProps) {
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
          <h2 className="text-3xl font-bold tracking-tight">Gestion des Utilisateurs</h2>
          <p className="text-muted-foreground">
            Gérer les comptes utilisateurs et leurs permissions
          </p>
        </div>
      </div>

      <UsersManagement />
    </div>
  )
}
