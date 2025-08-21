import { notFound } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { SessionProvider } from '@/components/providers/session-provider'
import { Toaster } from '@/components/ui/sonner'
import { Navigation } from '@/components/layout/navigation'
import { Footer } from '@/components/layout/footer'

const locales = ['fr', 'ar', 'en']

type Props = {
  children: React.ReactNode
  params: { locale: string }
}

export async function generateMetadata({ params }: Props) {
  const { locale } = params

  const titles = {
    fr: 'Visite Sri3a - Réservation de visite technique au Maroc',
    ar: 'زيارة سريعة - حجز الفحص الفني في المغرب',
    en: 'Visite Sri3a - Technical Inspection Booking in Morocco'
  }

  const descriptions = {
    fr: 'Réservez votre visite technique automobile en ligne. Évitez les files d\'attente et payez à l\'avance.',
    ar: 'احجز موعد الفحص الفني لسيارتك عبر الإنترنت. تجنب الطوابير وادفع مسبقاً.',
    en: 'Book your car technical inspection online. Skip the queues and pay in advance.'
  }

  return {
    title: titles[locale as keyof typeof titles] || titles.fr,
    description: descriptions[locale as keyof typeof descriptions] || descriptions.fr,
  }
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = params

  if (!locales.includes(locale)) {
    notFound()
  }

  let messages
  try {
    messages = (await import(`@/i18n/messages/${locale}.json`)).default
  } catch (error) {
    notFound()
  }

  const session = await getServerSession(authOptions)

  return (
    <SessionProvider session={session}>
      <NextIntlClientProvider locale={locale} messages={messages}>
        <div className="min-h-screen flex flex-col">
          <Navigation />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
        <Toaster />
      </NextIntlClientProvider>
    </SessionProvider>
  )
}
