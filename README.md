# Khedma - خدمة

Local jobbing marketplace for Morocco. Connect clients who need help with helpers who offer services.

## 🏗️ Project Structure

```
khedma/
├── apps/
│   ├── api/          # NestJS Backend API
│   ├── web/          # Next.js Web Application
│   └── mobile/       # React Native (Expo) Mobile App
├── packages/
│   └── shared/       # Shared types, utils, constants
└── docs/             # Documentation
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18
- **pnpm** >= 8 (install: `npm install -g pnpm`)
- **PostgreSQL** database (local or cloud like Supabase/Neon)

### 1. Install Dependencies

```bash
cd /Users/ayoub/Desktop/personalProject
pnpm install
```

### 2. Setup Database

Create a PostgreSQL database and update the connection string.

```bash
# Copy environment file
cp apps/api/.env.example apps/api/.env

# Edit apps/api/.env and set your DATABASE_URL:
# DATABASE_URL="postgresql://user:password@localhost:5432/khedma"
```

### 3. Generate Prisma Client & Push Schema

```bash
# Generate Prisma client
pnpm db:generate

# Push schema to database (creates tables)
pnpm db:push

# Seed initial data (categories)
pnpm db:seed
```

### 4. Run Development Servers

**Run all apps:**
```bash
pnpm dev
```

**Or run individually:**
```bash
# API only (http://localhost:3001)
pnpm dev:api

# Web only (http://localhost:3000)
pnpm dev:web

# Mobile only (Expo DevTools)
pnpm dev:mobile
```

## 📱 Testing Each App

### API (http://localhost:3001)

- Swagger docs: http://localhost:3001/docs
- Test endpoints with Postman or curl

```bash
# Health check
curl http://localhost:3001/api/v1/categories

# Register flow
curl -X POST http://localhost:3001/api/v1/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+212612345678", "purpose": "registration"}'
```

### Web (http://localhost:3000)

Open browser and navigate to:
- Home: http://localhost:3000
- Login: http://localhost:3000/login
- Register: http://localhost:3000/register

### Mobile

```bash
cd apps/mobile
pnpm dev
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your phone

## 🔧 Development Commands

```bash
# Run all apps in dev mode
pnpm dev

# Build all apps
pnpm build

# Lint all apps
pnpm lint

# Format code
pnpm format

# Database commands
pnpm db:generate    # Generate Prisma client
pnpm db:push        # Push schema to DB
pnpm db:migrate     # Run migrations
pnpm db:studio      # Open Prisma Studio (DB GUI)
pnpm db:seed        # Seed initial data
```

## 📚 Documentation

- [Tech Stack](./docs/01-TECH-STACK.md)
- [User Stories](./docs/02-USER-STORIES.md)
- [Database Schema](./docs/03-DATABASE-SCHEMA.md)
- [API Specification](./docs/04-API-SPECIFICATION.md)
- [UX Flows](./docs/05-UX-FLOWS.md)

## 🇲🇦 Morocco-Specific

- Phone format: +212XXXXXXXXX
- Currency: MAD (Dirham)
- Cities: Casablanca, Rabat, Marrakech, Fès, Tanger, Agadir...
- Languages: French (primary), Arabic

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | NestJS + Prisma + PostgreSQL |
| Web | Next.js 14 + Tailwind CSS |
| Mobile | React Native + Expo |
| State | Zustand + TanStack Query |
| Real-time | Socket.io |
| Auth | JWT + OTP via SMS |
