import { getRequestConfig } from 'next-intl/server'

export default getRequestConfig(async ({ locale }) => {
  // Ensure locale is valid
  const validLocale = locale && ['fr', 'ar', 'en'].includes(locale) ? locale : 'fr'

  const messages = (await import(`./i18n/messages/${validLocale}.json`)).default as Record<string, unknown>

  return {
    locale: validLocale,
    messages
  }
})
