import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { EmailTesting } from '@/components/admin/email-testing'

export const metadata: Metadata = {
  title: 'Configuration Email | Administration',
  description: 'Gestion et test des notifications par email',
}

interface EmailPageProps {
  params: { locale: string }
}

export default async function EmailPage({ params }: EmailPageProps) {
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
          <h2 className="text-3xl font-bold tracking-tight">Configuration Email</h2>
          <p className="text-muted-foreground">
            Gestion et test des notifications par email
          </p>
        </div>
      </div>

      <EmailTesting />
    </div>
  )
}
