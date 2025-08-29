import { ProtectedRoute } from '@/components/auth/protected-route'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

interface AdminLayoutProps {
  children: React.ReactNode
  params: { locale: string }
}

export default async function AdminLayout({ children, params }: AdminLayoutProps) {
  // Get session for sidebar props
  const session = await getServerSession(authOptions)

  return (
    <ProtectedRoute
      requiredPermission="VIEW_ADMIN_DASHBOARD"
      locale={params.locale}
      fallbackPath={`/${params.locale}/dashboard`}
    >
      <div className="flex h-screen bg-gray-100">
        {/* Admin Sidebar */}
        {session && (
          <AdminSidebar userRole={session.user.role} locale={params.locale} />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto bg-white">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
