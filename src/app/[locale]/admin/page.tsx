import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { AdminHeader } from '@/components/admin/admin-header'
import { AdminStats } from '@/components/admin/admin-stats'
import { AdminQuickActions } from '@/components/admin/admin-quick-actions'
import { RecentActivity } from '@/components/admin/recent-activity'

export const metadata: Metadata = {
  title: 'Administration | Visite Sri3a',
  description: 'Panneau d\'administration pour gérer le système',
}

interface AdminPageProps {
  params: { locale: string }
}

export default async function AdminPage({ params }: AdminPageProps) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect(`/${params.locale}/auth/signin`)
  }

  // Check if user has admin privileges
  if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
    redirect(`/${params.locale}/dashboard`)
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <AdminHeader user={session.user} />

      {/* Admin Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AdminStats />
      </div>

      {/* Main Content Area */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <RecentActivity />
        </div>
        <div className="col-span-3">
          <AdminQuickActions />
        </div>
      </div>
    </div>
  )
}
