import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { ProfileManagement } from '@/components/profile/profile-management'

export const metadata: Metadata = {
  title: 'Mon profil | Visite Sri3a',
  description: 'Gérez votre profil et vos préférences',
}

interface ProfilePageProps {
  params: { locale: string }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect(`/${params.locale}/auth/signin`)
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Mon profil</h2>
          <p className="text-muted-foreground">
            Gérez vos informations personnelles et vos préférences
          </p>
        </div>
      </div>

      <ProfileManagement user={session.user} />
    </div>
  )
}
