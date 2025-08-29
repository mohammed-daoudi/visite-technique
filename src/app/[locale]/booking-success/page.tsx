import { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Calendar, Download, Home } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Réservation Confirmée | Visite Sri3a',
  description: 'Votre réservation a été confirmée avec succès',
}

interface BookingSuccessPageProps {
  params: { locale: string }
  searchParams: { booking?: string }
}

function BookingSuccessContent({ params, searchParams }: BookingSuccessPageProps) {
  const bookingNumber = searchParams.booking

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">
            Réservation Confirmée !
          </CardTitle>
          <CardDescription>
            Votre paiement a été effectué avec succès
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {bookingNumber && (
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Numéro de réservation</p>
              <p className="text-lg font-bold text-gray-900">{bookingNumber}</p>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm text-gray-600">Paiement confirmé</span>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-green-600" />
              <span className="text-sm text-gray-600">Rendez-vous programmé</span>
            </div>
            <div className="flex items-center space-x-3">
              <Download className="h-5 w-5 text-green-600" />
              <span className="text-sm text-gray-600">Confirmation envoyée par email</span>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-gray-600 text-center mb-4">
              Vous recevrez un email de confirmation avec tous les détails de votre rendez-vous.
            </p>

            <div className="flex flex-col space-y-2">
              <Link href={`/${params.locale}/bookings`}>
                <Button className="w-full">
                  <Calendar className="h-4 w-4 mr-2" />
                  Voir mes réservations
                </Button>
              </Link>

              <Link href={`/${params.locale}`}>
                <Button variant="outline" className="w-full">
                  <Home className="h-4 w-4 mr-2" />
                  Retour à l'accueil
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function BookingSuccessPage(props: BookingSuccessPageProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Chargement...</p>
        </div>
      </div>
    }>
      <BookingSuccessContent {...props} />
    </Suspense>
  )
}
