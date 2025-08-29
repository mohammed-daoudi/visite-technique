import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'full' | 'icon' | 'text'
}

export function Logo({ className, size = 'md', variant = 'full' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-6 w-auto',
    md: 'h-8 w-auto',
    lg: 'h-12 w-auto'
  }

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl'
  }

  // Car inspection icon SVG
  const IconSVG = () => (
    <svg
      viewBox="0 0 40 40"
      className={cn(sizeClasses[size], className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="carGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(215, 84%, 55%)" />
          <stop offset="100%" stopColor="hsl(355, 75%, 42%)" />
        </linearGradient>
        <linearGradient id="checkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(142, 76%, 45%)" />
          <stop offset="100%" stopColor="hsl(142, 76%, 55%)" />
        </linearGradient>
      </defs>

      {/* Car body */}
      <path
        d="M8 24h24c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2z"
        fill="url(#carGradient)"
      />

      {/* Car roof */}
      <path
        d="M12 12h16c.6 0 1-.4 1-1v-2c0-.6-.4-1-1-1H12c-.6 0-1 .4-1 1v2c0 .6.4 1 1 1z"
        fill="url(#carGradient)"
      />

      {/* Wheels */}
      <circle cx="14" cy="27" r="3" fill="#374151" />
      <circle cx="26" cy="27" r="3" fill="#374151" />
      <circle cx="14" cy="27" r="1.5" fill="#9CA3AF" />
      <circle cx="26" cy="27" r="1.5" fill="#9CA3AF" />

      {/* Checkmark overlay */}
      <circle cx="32" cy="8" r="6" fill="url(#checkGradient)" />
      <path
        d="M29 8l2 2 4-4"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Morocco flag colors accent */}
      <rect x="6" y="20" width="2" height="4" fill="#C1272D" />
      <rect x="32" y="20" width="2" height="4" fill="#C1272D" />
    </svg>
  )

  if (variant === 'icon') {
    return <IconSVG />
  }

  if (variant === 'text') {
    return (
      <span className={cn(
        'font-bold visite-text-gradient',
        textSizeClasses[size],
        className
      )}>
        Visite Sri3a
      </span>
    )
  }

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <IconSVG />
      <span className={cn(
        'font-bold visite-text-gradient',
        textSizeClasses[size]
      )}>
        Visite Sri3a
      </span>
    </div>
  )
}
