import { z } from 'zod'

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),

  // NextAuth
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(1),

  // OAuth Providers (optional)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  FACEBOOK_CLIENT_ID: z.string().optional(),
  FACEBOOK_CLIENT_SECRET: z.string().optional(),

  // Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),

  // Google Maps
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().optional(),

  // CMI Payment Gateway
  CMI_MERCHANT_ID: z.string().optional(),
  CMI_ACCESS_KEY: z.string().optional(),
  CMI_SECRET_KEY: z.string().optional(),
  CMI_GATEWAY_URL: z.string().url().optional(),

  // Application
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_APP_NAME: z.string().default('Visite Sri3a'),

  // SMS (optional)
  SMS_API_KEY: z.string().optional(),
  SMS_SENDER_ID: z.string().optional(),

  // File Upload
  NEXT_PUBLIC_MAX_FILE_SIZE: z.string().default('5242880'),
  UPLOAD_DIR: z.string().default('./public/uploads'),

  // Timezone
  TZ: z.string().default('Africa/Casablanca'),

  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

function getEnvVars() {
  const env = {
    DATABASE_URL: process.env.DATABASE_URL,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    FACEBOOK_CLIENT_ID: process.env.FACEBOOK_CLIENT_ID,
    FACEBOOK_CLIENT_SECRET: process.env.FACEBOOK_CLIENT_SECRET,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    EMAIL_FROM: process.env.EMAIL_FROM,
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    CMI_MERCHANT_ID: process.env.CMI_MERCHANT_ID,
    CMI_ACCESS_KEY: process.env.CMI_ACCESS_KEY,
    CMI_SECRET_KEY: process.env.CMI_SECRET_KEY,
    CMI_GATEWAY_URL: process.env.CMI_GATEWAY_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    SMS_API_KEY: process.env.SMS_API_KEY,
    SMS_SENDER_ID: process.env.SMS_SENDER_ID,
    NEXT_PUBLIC_MAX_FILE_SIZE: process.env.NEXT_PUBLIC_MAX_FILE_SIZE,
    UPLOAD_DIR: process.env.UPLOAD_DIR,
    TZ: process.env.TZ,
    NODE_ENV: process.env.NODE_ENV,
  }

  return envSchema.parse(env)
}

// Export validated environment variables
export const env = getEnvVars()

// Helper functions
export const isProduction = env.NODE_ENV === 'production'
export const isDevelopment = env.NODE_ENV === 'development'
export const isTest = env.NODE_ENV === 'test'

// Feature flags based on environment variables
export const features = {
  googleAuth: !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
  facebookAuth: !!(env.FACEBOOK_CLIENT_ID && env.FACEBOOK_CLIENT_SECRET),
  emailNotifications: !!(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS),
  smsNotifications: !!env.SMS_API_KEY,
  googleMaps: !!env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  payments: !!(env.CMI_MERCHANT_ID && env.CMI_ACCESS_KEY && env.CMI_SECRET_KEY),
} as const

export default env
