import { getRequestConfig } from 'next-intl/server'

export default getRequestConfig(async ({ locale }) => {
  const messages = (await import(`./i18n/messages/${locale}.json`)).default as Record<string, unknown>

  return {
    locale: locale as string,
    messages
  }
})
