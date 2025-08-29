import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { CentersMap } from '@/components/centers/centers-map'

export const metadata: Metadata = {
  title: 'Centres d\'inspection | Visite Sri3a',
  description: 'Trouvez un centre d\'inspection technique près de chez vous',
}

interface CentersPageProps {
  params: { locale: string }
}

export default async function CentersPage({ params }: CentersPageProps) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect(`/${params.locale}/auth/signin`)
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Centres d'inspection</h2>
          <p className="text-muted-foreground">
            Trouvez un centre d'inspection technique près de chez vous
          </p>
        </div>
      </div>

      <CentersMap />
    </div>
  )
}
