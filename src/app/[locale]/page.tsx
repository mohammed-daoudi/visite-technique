import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Clock, CreditCard, MapPin, Calendar, Shield } from 'lucide-react'

export default function HomePage({ params }: { params: { locale: string } }) {
  const { locale } = params

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {locale === 'fr' && 'Visite Technique Sans Attente'}
              {locale === 'ar' && 'الفحص الفني بدون انتظار'}
              {locale === 'en' && 'Technical Inspection Without Waiting'}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              {locale === 'fr' && 'Réservez votre créneau, payez en ligne et évitez les files d\'attente'}
              {locale === 'ar' && 'احجز موعدك، ادفع عبر الإنترنت وتجنب الطوابير'}
              {locale === 'en' && 'Book your slot, pay online and skip the queues'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                <Link href={`/${locale}/booking`}>
                  {locale === 'fr' && 'Réserver Maintenant'}
                  {locale === 'ar' && 'احجز الآن'}
                  {locale === 'en' && 'Book Now'}
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                <Link href={`/${locale}/centers`}>
                  {locale === 'fr' && 'Voir les Centres'}
                  {locale === 'ar' && 'عرض المراكز'}
                  {locale === 'en' && 'View Centers'}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {locale === 'fr' && 'Pourquoi Choisir Visite Sri3a ?'}
              {locale === 'ar' && 'لماذا تختار زيارة سريعة؟'}
              {locale === 'en' && 'Why Choose Visite Sri3a?'}
            </h2>
            <p className="text-xl text-gray-600">
              {locale === 'fr' && 'Une solution moderne pour votre visite technique automobile'}
              {locale === 'ar' && 'حل حديث للفحص الفني لسيارتك'}
              {locale === 'en' && 'A modern solution for your car technical inspection'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Clock className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>
                  {locale === 'fr' && 'Gain de Temps'}
                  {locale === 'ar' && 'توفير الوقت'}
                  {locale === 'en' && 'Time Saving'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {locale === 'fr' && 'Évitez les longues files d\'attente en réservant votre créneau à l\'avance'}
                  {locale === 'ar' && 'تجنب الطوابير الطويلة عبر حجز موعدك مسبقاً'}
                  {locale === 'en' && 'Avoid long queues by booking your slot in advance'}
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <CreditCard className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>
                  {locale === 'fr' && 'Paiement Sécurisé'}
                  {locale === 'ar' && 'دفع آمن'}
                  {locale === 'en' && 'Secure Payment'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {locale === 'fr' && 'Payez en ligne de manière sécurisée via CMI avant votre visite'}
                  {locale === 'ar' && 'ادفع عبر الإنترنت بأمان عبر CMI قبل زيارتك'}
                  {locale === 'en' && 'Pay online securely via CMI before your visit'}
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <MapPin className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>
                  {locale === 'fr' && 'Centres Proches'}
                  {locale === 'ar' && 'مراكز قريبة'}
                  {locale === 'en' && 'Nearby Centers'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {locale === 'fr' && 'Trouvez facilement le centre d\'inspection le plus proche de vous'}
                  {locale === 'ar' && 'اعثر بسهولة على أقرب مركز فحص إليك'}
                  {locale === 'en' && 'Easily find the inspection center closest to you'}
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Calendar className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>
                  {locale === 'fr' && 'Réservation Flexible'}
                  {locale === 'ar' && 'حجز مرن'}
                  {locale === 'en' && 'Flexible Booking'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {locale === 'fr' && 'Choisissez le jour et l\'heure qui vous conviennent le mieux'}
                  {locale === 'ar' && 'اختر اليوم والوقت الذي يناسبك أكثر'}
                  {locale === 'en' && 'Choose the day and time that suits you best'}
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>
                  {locale === 'fr' && 'Service Fiable'}
                  {locale === 'ar' && 'خدمة موثوقة'}
                  {locale === 'en' && 'Reliable Service'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {locale === 'fr' && 'Service professionnel avec des centres agréés par les autorités'}
                  {locale === 'ar' && 'خدمة احترافية مع مراكز معتمدة من قبل السلطات'}
                  {locale === 'en' && 'Professional service with centers approved by authorities'}
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <CheckCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>
                  {locale === 'fr' && 'Confirmation Instantanée'}
                  {locale === 'ar' && 'تأكيد فوري'}
                  {locale === 'en' && 'Instant Confirmation'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {locale === 'fr' && 'Recevez votre confirmation de réservation immédiatement par email'}
                  {locale === 'ar' && 'احصل على تأكيد حجزك فوراً عبر البريد الإلكتروني'}
                  {locale === 'en' && 'Receive your booking confirmation immediately by email'}
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {locale === 'fr' && 'Comment Ça Marche ?'}
              {locale === 'ar' && 'كيف يعمل؟'}
              {locale === 'en' && 'How It Works?'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {locale === 'fr' && 'Ajoutez votre véhicule'}
                {locale === 'ar' && 'أضف مركبتك'}
                {locale === 'en' && 'Add your vehicle'}
              </h3>
              <p className="text-gray-600">
                {locale === 'fr' && 'Renseignez les informations de votre véhicule'}
                {locale === 'ar' && 'أدخل معلومات مركبتك'}
                {locale === 'en' && 'Enter your vehicle information'}
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {locale === 'fr' && 'Choisissez un centre'}
                {locale === 'ar' && 'اختر مركزاً'}
                {locale === 'en' && 'Choose a center'}
              </h3>
              <p className="text-gray-600">
                {locale === 'fr' && 'Sélectionnez le centre le plus proche'}
                {locale === 'ar' && 'اختر أقرب مركز'}
                {locale === 'en' && 'Select the nearest center'}
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {locale === 'fr' && 'Réservez et payez'}
                {locale === 'ar' && 'احجز وادفع'}
                {locale === 'en' && 'Book and pay'}
              </h3>
              <p className="text-gray-600">
                {locale === 'fr' && 'Choisissez votre créneau et payez en ligne'}
                {locale === 'ar' && 'اختر موعدك وادفع عبر الإنترنت'}
                {locale === 'en' && 'Choose your slot and pay online'}
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {locale === 'fr' && 'Présentez-vous'}
                {locale === 'ar' && 'احضر'}
                {locale === 'en' && 'Show up'}
              </h3>
              <p className="text-gray-600">
                {locale === 'fr' && 'Rendez-vous directement au centre à l\'heure prévue'}
                {locale === 'ar' && 'اذهب مباشرة إلى المركز في الوقت المحدد'}
                {locale === 'en' && 'Go directly to the center at the scheduled time'}
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg">
              <Link href={`/${locale}/booking`}>
                {locale === 'fr' && 'Commencer Maintenant'}
                {locale === 'ar' && 'ابدأ الآن'}
                {locale === 'en' && 'Get Started Now'}
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
