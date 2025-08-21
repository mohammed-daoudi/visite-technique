import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { PaymentsDashboard } from '@/components/admin/payments-dashboard'

export const metadata: Metadata = {
  title: 'Suivi des Paiements | Administration',
  description: 'Tableau de bord des transactions et revenus',
}

interface PaymentsPageProps {
  params: { locale: string }
}

export default async function PaymentsPage({ params }: PaymentsPageProps) {
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
          <h2 className="text-3xl font-bold tracking-tight">Suivi des Paiements</h2>
          <p className="text-muted-foreground">
            Tableau de bord des transactions et revenus
          </p>
        </div>
      </div>

      <PaymentsDashboard />
    </div>
  )
}
