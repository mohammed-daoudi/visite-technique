# Visite Sri3a - Setup Guide

## Overview
Visite Sri3a is a fullstack Next.js application for managing vehicle inspection appointments in Morocco. It features multi-language support (Arabic, French, English), role-based access control, payment integration, and real-time notifications.

## Prerequisites
- Node.js 18+ or Bun runtime
- PostgreSQL database (Neon recommended)
- Git

## Local Development Setup

### 1. Clone the Repository
```bash
git clone https://github.com/mohammed-daoudi/visite-technique.git
cd visite-technique
```

### 2. Install Dependencies
```bash
bun install
# or
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory (see [ENV.md](./ENV.md) for details):
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 4. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed with sample data
npx tsx prisma/seed-centers.ts
npx tsx prisma/seed-timeslots.ts
```

### 5. Start Development Server
```bash
bun run dev
# or
npm run dev
```

The application will be available at `http://localhost:3000`

## Project Structure
```
src/
├── app/                    # Next.js app router
│   ├── [locale]/          # Internationalized routes
│   └── api/               # API routes
├── components/            # React components
│   ├── admin/             # Admin dashboard components
│   ├── auth/              # Authentication components
│   ├── booking/           # Booking system components
│   └── ui/                # Reusable UI components
├── lib/                   # Utility libraries
├── hooks/                 # Custom React hooks
├── i18n/                  # Internationalization
└── types/                 # TypeScript type definitions

prisma/
├── schema.prisma          # Database schema
├── seed-centers.ts        # Inspection centers seed data
└── seed-timeslots.ts      # Time slots seed data
```

## Key Features
- **Multi-language Support**: Arabic, French, English
- **Authentication**: NextAuth.js with email/password and OAuth
- **Role-based Access**: User, Admin, Super Admin roles
- **Booking System**: Time slot management and reservations
- **Payment Integration**: CMI payment gateway
- **Notifications**: Email and SMS notifications
- **Maps Integration**: Google Maps for center locations
- **Responsive Design**: Mobile-first approach with Tailwind CSS

## Development Commands
```bash
# Start development server
bun run dev

# Build for production
bun run build

# Start production server
bun run start

# Run linting
bun run lint

# Format code
bun run format

# Generate Prisma client
npx prisma generate

# View database in Prisma Studio
npx prisma studio
```

## Testing
The application includes:
- Prisma database seeding for test data
- API endpoint testing capabilities
- Admin email/SMS testing interfaces

## Deployment
See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment instructions.

## Support
For issues or questions, contact the development team or create an issue in the repository.
