import { Metadata } from 'next'
import { SignUpForm } from '@/components/auth/signup-form'
import { Logo } from '@/components/ui/logo'

export const metadata: Metadata = {
  title: 'Créer un compte | Visite Sri3a',
  description: 'Créez votre compte Visite Sri3a pour réserver votre visite technique',
}

export default function SignUpPage() {
  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <span className="text-2xl font-bold">Visite Sri3a</span>
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              "Rejoignez des milliers d'utilisateurs qui ont simplifié leur visite technique."
            </p>
            <footer className="text-sm">Inscription gratuite et rapide</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Créer un compte
            </h1>
            <p className="text-sm text-muted-foreground">
              Commencez à réserver vos visites techniques en ligne
            </p>
          </div>
          <SignUpForm />
        </div>
      </div>
    </div>
  )
}
