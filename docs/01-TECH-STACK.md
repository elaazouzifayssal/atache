# Tech Stack & Architecture

## Project Name: **Khedma** (خدمة - "Service" in Moroccan Arabic)

---

## 🏗️ Architecture Overview

```
khedma/
├── apps/
│   ├── api/          # NestJS Backend
│   ├── web/          # Next.js Web App
│   └── mobile/       # React Native (Expo)
├── packages/
│   ├── shared/       # Shared types, utils, constants
│   ├── ui/           # Shared UI components
│   └── config/       # Shared configs (ESLint, TS, etc.)
├── docs/             # Documentation
├── docker/           # Docker configs
└── scripts/          # Build & deploy scripts
```

---

## 🛠️ Tech Stack

### Backend (apps/api)
| Layer | Technology |
|-------|------------|
| Framework | NestJS (Node.js + TypeScript) |
| Database | PostgreSQL |
| ORM | Prisma |
| Authentication | JWT + Passport.js |
| Validation | class-validator + class-transformer |
| API Documentation | Swagger/OpenAPI |
| Real-time | Socket.io (via @nestjs/websockets) |
| File Upload | Cloudinary or AWS S3 |
| SMS | Twilio or Infobip (Morocco support) |
| Email | Resend or SendGrid |

### Web Frontend (apps/web)
| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| State Management | Zustand |
| Forms | React Hook Form + Zod |
| API Client | TanStack Query (React Query) |
| Maps | Mapbox or Google Maps |
| i18n | next-intl (French, Arabic, English) |

### Mobile (apps/mobile)
| Layer | Technology |
|-------|------------|
| Framework | React Native + Expo |
| Navigation | Expo Router |
| Styling | NativeWind (Tailwind for RN) |
| State | Zustand |
| Push Notifications | Expo Notifications |

### Infrastructure
| Service | Provider |
|---------|----------|
| Web Hosting | Vercel |
| API Hosting | Vercel Serverless or Railway |
| Database | Supabase (PostgreSQL) or Neon |
| File Storage | Cloudinary |
| SMS Gateway | Infobip (good Morocco coverage) |

---

## 🇲🇦 Morocco-Specific Configuration

### Regions (Régions)
```
- Casablanca-Settat
- Rabat-Salé-Kénitra
- Marrakech-Safi
- Fès-Meknès
- Tanger-Tétouan-Al Hoceïma
- Souss-Massa
- Oriental
- Béni Mellal-Khénifra
- Drâa-Tafilalet
- Laâyoune-Sakia El Hamra
- Dakhla-Oued Ed-Dahab
- Guelmim-Oued Noun
```

### Major Cities
```
Casablanca, Rabat, Marrakech, Fès, Tanger, Agadir,
Meknès, Oujda, Kénitra, Tétouan, Salé, Nador,
Mohammedia, El Jadida, Béni Mellal, Khouribga
```

### Currency & Locale
- Currency: MAD (Moroccan Dirham) - د.م.
- Phone: +212
- Languages: French (primary UI), Arabic, Darija support

### Service Categories (Catégories)
```
- Ménage (نظافة) - House cleaning
- Bricolage (إصلاحات) - Handyman/repairs
- Montage meubles (تركيب الأثاث) - Furniture assembly
- Jardinage (البستنة) - Gardening
- Déménagement (نقل الأثاث) - Moving
- Informatique (معلوميات) - IT help
- Garde d'enfants (رعاية الأطفال) - Babysitting
- Cours particuliers (دروس خصوصية) - Tutoring
- Plomberie (سباكة) - Plumbing
- Électricité (كهرباء) - Electrical
- Peinture (طلاء) - Painting
- Climatisation (تكييف) - AC services
- Nettoyage auto (غسيل السيارات) - Car cleaning
- Livraison (توصيل) - Delivery
- Cuisine (طبخ) - Cooking services
```

---

## 📦 Monorepo Setup

### Package Manager: pnpm (fast, efficient)

### Turborepo Configuration
- Parallel builds
- Shared caching
- Dependency optimization

### Shared Packages
- `@khedma/shared` - Types, interfaces, constants
- `@khedma/ui` - Reusable React components
- `@khedma/config` - ESLint, TypeScript, Prettier configs

---

## 🔐 Security Considerations

1. **Authentication**: JWT with refresh tokens
2. **Phone verification**: OTP via SMS (required for Morocco)
3. **Rate limiting**: Protect against abuse
4. **Input validation**: Server-side validation on all endpoints
5. **CORS**: Strict origin policies
6. **Helmet.js**: Security headers
7. **Data encryption**: Passwords hashed with bcrypt

---

## 🚀 Deployment Strategy

### Development
```bash
pnpm dev          # Run all apps in dev mode
pnpm dev:api      # Run only API
pnpm dev:web      # Run only web
pnpm dev:mobile   # Run Expo dev server
```

### Production
- **Web**: Vercel (automatic from main branch)
- **API**: Vercel Serverless Functions or Railway
- **Database**: Supabase/Neon (managed PostgreSQL)
- **Mobile**: Expo EAS Build → App Store / Play Store
