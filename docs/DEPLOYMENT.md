# Production Deployment Guide

## Quick Deploy to Netlify

### 1. Prerequisites
- Neon PostgreSQL database set up
- Environment variables configured
- Repository pushed to GitHub

### 2. Netlify Deployment
1. Connect your GitHub repository to Netlify
2. Configure build settings:
   - **Build command**: `bun run build`
   - **Publish directory**: `.next`
   - **Node version**: `18` or higher

3. Add environment variables in Netlify dashboard:
```env
DATABASE_URL=your_neon_database_url
DIRECT_URL=your_neon_direct_url
NEXTAUTH_URL=https://your-netlify-domain.netlify.app
NEXTAUTH_SECRET=your_secret_key
NEXT_PUBLIC_APP_URL=https://your-netlify-domain.netlify.app
NODE_ENV=production
```

### 3. Database Setup
```bash
# After first deployment, run these commands locally with production env:
npx prisma db push
npx tsx prisma/seed-centers.ts
npx tsx prisma/seed-timeslots.ts
```

### 4. Post-Deployment Verification
- ✅ Check `/api/centers` endpoint
- ✅ Check `/api/time-slots` endpoint
- ✅ Verify authentication flow
- ✅ Test booking creation
- ✅ Verify protected routes redirect when logged out

## Configuration Files

### netlify.toml
```toml
[build]
  command = "bun run build"
  publish = ".next"

[build.environment]
  NETLIFY_NEXT_PLUGIN_SKIP = "true"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[functions]
  external_node_modules = ["@prisma/client"]
```

### package.json Scripts
```json
{
  "scripts": {
    "build": "next build",
    "postinstall": "prisma generate"
  }
}
```

## Database Configuration (Neon)

### Connection Strings
- **DATABASE_URL**: Use pooled connection for application
- **DIRECT_URL**: Use direct connection for migrations

### Binary Targets (Prisma)
```prisma
generator client {
  provider = "prisma-client-js"
  binaryTargets = ["native", "debian-openssl-3.0.x"]
}
```

## Environment Variables

### Required
```env
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
DIRECT_URL=postgresql://user:pass@host/db?sslmode=require
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secret
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production
TZ=Africa/Casablanca
```

### Optional (Enable Features)
```env
# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@your-domain.com

# Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-maps-api-key

# Payments
CMI_MERCHANT_ID=your-merchant-id
CMI_ACCESS_KEY=your-access-key
CMI_SECRET_KEY=your-secret-key
CMI_GATEWAY_URL=https://payment-gateway-url.com
```

## Production Checklist

### Pre-Deployment
- [ ] Environment variables configured
- [ ] Database schema deployed
- [ ] Seed data populated
- [ ] DNS/Domain configured
- [ ] SSL certificate enabled

### Post-Deployment
- [ ] API endpoints responding
- [ ] Authentication working
- [ ] Database connections stable
- [ ] Error monitoring active
- [ ] Performance optimized

## Security Considerations
- Use strong, unique secrets
- Enable HTTPS only
- Configure CORS properly
- Set up rate limiting
- Monitor for suspicious activity

## Monitoring & Maintenance
- Monitor database performance
- Check error logs regularly
- Update dependencies
- Backup database regularly
- Monitor API response times

## Troubleshooting

### Common Issues
1. **Prisma Client Generation**: Ensure `postinstall` script runs
2. **Database Connection**: Verify connection strings and SSL settings
3. **Environment Variables**: Check all required vars are set
4. **Build Failures**: Check Node.js version compatibility

### Debug Commands
```bash
# Check Prisma client
npx prisma generate

# Test database connection
npx prisma db pull

# Verify environment
node -e "console.log(process.env.DATABASE_URL ? 'DB OK' : 'DB Missing')"
```

## Performance Optimization
- Enable Next.js compression
- Use connection pooling
- Optimize database queries
- Enable CDN for static assets
- Monitor Core Web Vitals

## Backup & Recovery
- Neon provides automatic backups
- Export critical data regularly
- Test restore procedures
- Document recovery processes

## Support
For deployment issues:
1. Check Netlify build logs
2. Verify environment configuration
3. Test API endpoints
4. Contact support if needed
