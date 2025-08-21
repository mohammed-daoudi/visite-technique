'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useTranslations, useLocale } from 'next-intl'
import { Menu, X, Car, Calendar, User, Settings, LogOut, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Logo } from '@/components/ui/logo'

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const { data: session } = useSession()
  const t = useTranslations('navigation')
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()

  const navigation = [
    { name: t('home'), href: `/${locale}` },
    { name: t('centers'), href: `/${locale}/centers` },
  ]

  const userNavigation = session ? [
    { name: t('dashboard'), href: `/${locale}/dashboard`, icon: Calendar },
    { name: t('cars'), href: `/${locale}/cars`, icon: Car },
    { name: 'Réserver', href: `/${locale}/booking`, icon: Calendar },
    { name: t('bookings'), href: `/${locale}/bookings`, icon: Calendar },
    { name: t('profile'), href: `/${locale}/profile`, icon: User },
  ] : []

  const languages = [
    { code: 'fr', name: 'Français' },
    { code: 'ar', name: 'العربية' },
    { code: 'en', name: 'English' },
  ]

  const handleLanguageChange = (newLocale: string) => {
    const currentPath = pathname.replace(`/${locale}`, '')
    router.push(`/${newLocale}${currentPath}`)
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: `/${locale}` })
  }

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="mobile-container">
        <div className="flex justify-between h-14 sm:h-16">
          <div className="flex items-center">
            <Link href={`/${locale}`} className="flex-shrink-0 touch-target">
              <Logo size="sm" className="sm:hidden" />
              <Logo size="md" className="hidden sm:block" />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                    pathname === item.href
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-4">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Globe className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={locale === lang.code ? 'bg-gray-100' : ''}
                  >
                    {lang.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {session ? (
              <>
                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={session.user.image || ''} alt={session.user.name || ''} />
                        <AvatarFallback>
                          {session.user.name?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        {session.user.name && (
                          <p className="font-medium">{session.user.name}</p>
                        )}
                        {session.user.email && (
                          <p className="text-xs text-muted-foreground">
                            {session.user.email}
                          </p>
                        )}
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    {userNavigation.map((item) => (
                      <DropdownMenuItem key={item.name} asChild>
                        <Link href={item.href}>
                          <item.icon className="mr-2 h-4 w-4" />
                          {item.name}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                    {(session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN') && (
                      <DropdownMenuItem asChild>
                        <Link href={`/${locale}/admin`}>
                          <Settings className="mr-2 h-4 w-4" />
                          {t('admin')}
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      {t('logout')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex space-x-2">
                <Button variant="ghost" asChild>
                  <Link href={`/${locale}/auth/signin`}>{t('login')}</Link>
                </Button>
                <Button asChild>
                  <Link href={`/${locale}/auth/signup`}>{t('register')}</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Language Selector Mobile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="touch-target">
                  <Globe className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={locale === lang.code ? 'bg-gray-100' : ''}
                  >
                    {lang.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="touch-target">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-80 p-0">
                <div className="flex flex-col h-full">
                  <div className="p-6 border-b">
                    <Logo size="md" />
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="space-y-1">
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        Navigation
                      </h3>
                      {navigation.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="mobile-nav-item text-gray-600 hover:text-gray-900 hover:bg-gray-50 block w-full text-left"
                          onClick={() => setIsOpen(false)}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>

                    {session ? (
                      <div className="space-y-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={session.user.image || ''} alt={session.user.name || ''} />
                              <AvatarFallback>
                                {session.user.name?.charAt(0).toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {session.user.name}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {session.user.email}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                            Mon Compte
                          </h3>
                          {userNavigation.map((item) => (
                            <Link
                              key={item.name}
                              href={item.href}
                              className="mobile-nav-item text-gray-600 hover:text-gray-900 hover:bg-gray-50 flex items-center w-full"
                              onClick={() => setIsOpen(false)}
                            >
                              <item.icon className="mr-3 h-5 w-5" />
                              {item.name}
                            </Link>
                          ))}
                          {(session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN') && (
                            <Link
                              href={`/${locale}/admin`}
                              className="mobile-nav-item text-gray-600 hover:text-gray-900 hover:bg-gray-50 flex items-center w-full"
                              onClick={() => setIsOpen(false)}
                            >
                              <Settings className="mr-3 h-5 w-5" />
                              {t('admin')}
                            </Link>
                          )}
                          <Button
                            variant="ghost"
                            className="mobile-nav-item text-gray-600 hover:text-gray-900 hover:bg-gray-50 w-full justify-start"
                            onClick={handleSignOut}
                          >
                            <LogOut className="mr-3 h-5 w-5" />
                            {t('logout')}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Connexion
                        </h3>
                        <Button variant="outline" asChild className="mobile-button">
                          <Link href={`/${locale}/auth/signin`} onClick={() => setIsOpen(false)}>
                            {t('login')}
                          </Link>
                        </Button>
                        <Button asChild className="mobile-button">
                          <Link href={`/${locale}/auth/signup`} onClick={() => setIsOpen(false)}>
                            {t('register')}
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
