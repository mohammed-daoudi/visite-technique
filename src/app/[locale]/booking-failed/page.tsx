import { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { XCircle, RefreshCw, Home, HelpCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Échec du Paiement | Visite Sri3a',
  description: 'Le paiement a échoué',
}

interface BookingFailedPageProps {
  params: { locale: string }
  searchParams: {
    booking?: string
    error?: string
    message?: string
    oid?: string
  }
}

function BookingFailedContent({ params, searchParams }: BookingFailedPageProps) {
  const bookingNumber = searchParams.booking
  const errorCode = searchParams.error
  const errorMessage = searchParams.message ? decodeURIComponent(searchParams.message) : undefined
  const orderId = searchParams.oid

  // Get user-friendly error messages
  const getErrorMessage = (code: string) => {
    const errorMessages: Record<string, string> = {
      'no-order-id': 'Identifiant de commande manquant',
      'payment-not-found': 'Paiement introuvable',
      'invalid-hash': 'Erreur de sécurité',
      'callback-error': 'Erreur lors du traitement',
      '01': 'Carte refusée par votre banque',
      '05': 'Transaction refusée',
      '51': 'Fonds insuffisants',
      '54': 'Carte expirée',
      '57': 'Transaction non autorisée',
      '82': 'Code de sécurité incorrect',
      '91': 'Système bancaire indisponible'
    }
    return errorMessages[code] || 'Erreur de paiement inconnue'
  }

  const displayMessage = errorMessage || (errorCode ? getErrorMessage(errorCode) : 'Le paiement a échoué')

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-600">
            Paiement Échoué
          </CardTitle>
          <CardDescription>
            Votre paiement n'a pas pu être traité
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {bookingNumber && (
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Numéro de réservation</p>
              <p className="text-lg font-bold text-gray-900">{bookingNumber}</p>
            </div>
          )}

          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm text-red-800 font-medium mb-2">Raison de l'échec :</p>
            <p className="text-sm text-red-700">{displayMessage}</p>
            {errorCode && (
              <p className="text-xs text-red-600 mt-2">Code d'erreur : {errorCode}</p>
            )}
            {orderId && (
              <p className="text-xs text-red-600 mt-1">ID commande : {orderId}</p>
            )}
          </div>

          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start space-x-3">
              <HelpCircle className="h-4 w-4 mt-0.5 text-gray-400" />
              <div>
                <p className="font-medium">Que faire maintenant ?</p>
                <ul className="mt-1 space-y-1 text-xs">
                  <li>• Vérifiez vos informations bancaires</li>
                  <li>• Assurez-vous d'avoir suffisamment de fonds</li>
                  <li>• Contactez votre banque si nécessaire</li>
                  <li>• Réessayez le paiement</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex flex-col space-y-2">
              {bookingNumber && (
                <Link href={`/${params.locale}/booking?retry=${bookingNumber}`}>
                  <Button className="w-full">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Réessayer le paiement
                  </Button>
                </Link>
              )}

              <Link href={`/${params.locale}/booking`}>
                <Button variant="outline" className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Nouvelle réservation
                </Button>
              </Link>

              <Link href={`/${params.locale}`}>
                <Button variant="ghost" className="w-full">
                  <Home className="h-4 w-4 mr-2" />
                  Retour à l'accueil
                </Button>
              </Link>
            </div>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                Besoin d'aide ? Contactez notre support client
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function BookingFailedPage(props: BookingFailedPageProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Chargement...</p>
        </div>
      </div>
    }>
      <BookingFailedContent {...props} />
    </Suspense>
  )
}
