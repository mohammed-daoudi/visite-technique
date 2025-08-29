# Environment Variables Configuration

## Required Variables

### Database
```env
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"
DIRECT_URL="postgresql://user:password@host:port/database?sslmode=require"
```
- **DATABASE_URL**: Connection string for Prisma ORM (with connection pooling)
- **DIRECT_URL**: Direct database connection (required for migrations)

### NextAuth Configuration
```env
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-super-secret-key"
```
- **NEXTAUTH_URL**: Base URL of your application
- **NEXTAUTH_SECRET**: Secret key for JWT token encryption (generate with `openssl rand -base64 32`)

### Application Settings
```env
NEXT_PUBLIC_APP_URL="https://your-domain.com"
NEXT_PUBLIC_APP_NAME="Visite Sri3a"
NODE_ENV="production"
TZ="Africa/Casablanca"
```

## Optional Variables

### OAuth Providers
```env
# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Facebook OAuth
FACEBOOK_CLIENT_ID="your-facebook-app-id"
FACEBOOK_CLIENT_SECRET="your-facebook-app-secret"
```

### Email Configuration (SMTP)
```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
EMAIL_FROM="noreply@visite-sri3a.com"
```

### Google Maps Integration
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-google-maps-api-key"
```
Required for displaying inspection center locations on maps.

### CMI Payment Gateway
```env
CMI_MERCHANT_ID="your-merchant-id"
CMI_ACCESS_KEY="your-access-key"
CMI_SECRET_KEY="your-secret-key"
CMI_GATEWAY_URL="https://payment-gateway-url.com"
```

### SMS Notifications
```env
SMS_API_KEY="your-sms-api-key"
SMS_SENDER_ID="VisiteSri3a"
```

### File Upload Settings
```env
NEXT_PUBLIC_MAX_FILE_SIZE="5242880"  # 5MB in bytes
UPLOAD_DIR="./public/uploads"
```

## Feature Flags
The application automatically enables/disables features based on available environment variables:

- **Google OAuth**: Enabled if `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set
- **Facebook OAuth**: Enabled if `FACEBOOK_CLIENT_ID` and `FACEBOOK_CLIENT_SECRET` are set
- **Email Notifications**: Enabled if SMTP variables are configured
- **SMS Notifications**: Enabled if `SMS_API_KEY` is set
- **Google Maps**: Enabled if `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set
- **Payments**: Enabled if CMI gateway variables are configured

## Security Notes
- Never commit `.env` files to version control
- Use strong, unique secrets for production
- Rotate secrets regularly
- Use environment-specific URLs and keys
- Enable SSL/TLS for all external services

## Development vs Production
```env
# Development
NODE_ENV="development"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Production
NODE_ENV="production"
NEXTAUTH_URL="https://your-domain.com"
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

## Validation
The application uses Zod schema validation for environment variables. Missing required variables will cause startup errors with clear error messages.

## Setup OAuth Providers

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs: `{NEXTAUTH_URL}/api/auth/callback/google`

### Facebook OAuth Setup
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product
4. Configure Valid OAuth Redirect URIs: `{NEXTAUTH_URL}/api/auth/callback/facebook`

## SMTP Configuration Examples

### Gmail
```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"  # Generate app password in Gmail settings
```

### Outlook/Hotmail
```env
SMTP_HOST="smtp.live.com"
SMTP_PORT="587"
SMTP_USER="your-email@outlook.com"
SMTP_PASS="your-password"
```
