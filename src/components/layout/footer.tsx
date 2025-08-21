'use client'

import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { Logo } from '@/components/ui/logo'

export function Footer() {
  const t = useTranslations('footer')
  const locale = useLocale()

  return (
    <footer className="bg-gray-50 border-t">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center">
              <Logo size="lg" />
            </div>
            <p className="mt-4 text-gray-600 text-sm">
              {locale === 'fr' && "Réservez votre visite technique automobile en ligne. Évitez les files d'attente et gagnez du temps."}
              {locale === 'ar' && "احجز موعد الفحص الفني لسيارتك عبر الإنترنت. تجنب الطوابير ووفر وقتك."}
              {locale === 'en' && "Book your car technical inspection online. Skip the queues and save time."}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
              {locale === 'fr' && 'Services'}
              {locale === 'ar' && 'الخدمات'}
              {locale === 'en' && 'Services'}
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href={`/${locale}/centers`} className="text-base text-gray-500 hover:text-gray-900">
                  {locale === 'fr' && 'Centres d\'inspection'}
                  {locale === 'ar' && 'مراكز الفحص'}
                  {locale === 'en' && 'Inspection Centers'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/booking`} className="text-base text-gray-500 hover:text-gray-900">
                  {locale === 'fr' && 'Réserver'}
                  {locale === 'ar' && 'احجز'}
                  {locale === 'en' && 'Book Now'}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
              {locale === 'fr' && 'Support'}
              {locale === 'ar' && 'الدعم'}
              {locale === 'en' && 'Support'}
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href={`/${locale}/contact`} className="text-base text-gray-500 hover:text-gray-900">
                  {t('contact')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/privacy`} className="text-base text-gray-500 hover:text-gray-900">
                  {t('privacy')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/terms`} className="text-base text-gray-500 hover:text-gray-900">
                  {t('terms')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-8">
          <p className="text-base text-gray-400 text-center">
            {t('copyright')}
          </p>
        </div>
      </div>
    </footer>
  )
}
