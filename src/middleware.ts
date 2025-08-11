import createMiddleware from 'next-intl/middleware'

export default createMiddleware({
  locales: ['fr', 'ar', 'en'],
  defaultLocale: 'fr'
})

export const config = {
  matcher: ['/', '/(fr|ar|en)/:path*']
}
