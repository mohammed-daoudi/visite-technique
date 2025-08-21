import { Metadata } from 'next'
import { SignInForm } from '@/components/auth/signin-form'
import { Logo } from '@/components/ui/logo'

export const metadata: Metadata = {
  title: 'Se connecter | Visite Sri3a',
  description: 'Connectez-vous à votre compte Visite Sri3a',
}

export default function SignInPage() {
  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Logo size="lg" variant="text" className="text-white" />
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              "Réservez votre visite technique en quelques clics et évitez les files d'attente."
            </p>
            <footer className="text-sm">Service rapide et efficace</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <div className="flex justify-center lg:hidden mb-4">
              <Logo size="md" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Se connecter
            </h1>
            <p className="text-sm text-muted-foreground">
              Entrez vos identifiants pour accéder à votre compte
            </p>
          </div>
          <SignInForm />
        </div>
      </div>
    </div>
  )
}
