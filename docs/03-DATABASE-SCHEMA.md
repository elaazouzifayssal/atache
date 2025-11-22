# Database Schema - Prisma

## Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│     User     │───────│  HelperProfile│───────│    Skill     │
└──────────────┘       └──────────────┘       └──────────────┘
       │                      │                      │
       │                      │                      │
       ▼                      ▼                      ▼
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│   Address    │       │  HelperSkill │       │   Category   │
└──────────────┘       └──────────────┘       └──────────────┘
       │
       │
       ▼
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│     Job      │───────│ Application  │───────│   Message    │
└──────────────┘       └──────────────┘       └──────────────┘
       │                      │
       │                      │
       ▼                      ▼
┌──────────────┐       ┌──────────────┐
│    Review    │       │ Conversation │
└──────────────┘       └──────────────┘
```

---

## Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// ENUMS
// ============================================

enum UserRole {
  CLIENT
  HELPER
  ADMIN
}

enum UserStatus {
  PENDING_VERIFICATION
  ACTIVE
  SUSPENDED
  DELETED
}

enum JobStatus {
  OPEN
  ASSIGNED
  IN_PROGRESS
  PENDING_REVIEW
  COMPLETED
  CANCELLED
}

enum ApplicationStatus {
  PENDING
  ACCEPTED
  DECLINED
  WITHDRAWN
}

enum BudgetType {
  FIXED
  HOURLY
}

enum TimePreference {
  MORNING      // 8h-12h
  AFTERNOON    // 12h-17h
  EVENING      // 17h-21h
  FLEXIBLE
}

enum DayOfWeek {
  MONDAY
  TUESDAY
  WEDNESDAY
  THURSDAY
  FRIDAY
  SATURDAY
  SUNDAY
}

enum NotificationType {
  NEW_JOB
  NEW_APPLICATION
  APPLICATION_ACCEPTED
  APPLICATION_DECLINED
  NEW_MESSAGE
  JOB_REMINDER
  JOB_STARTED
  JOB_COMPLETED
  NEW_REVIEW
  JOB_CANCELLED
}

// ============================================
// CORE MODELS
// ============================================

model User {
  id                String      @id @default(uuid())
  phone             String      @unique // E.164 format: +212XXXXXXXXX
  email             String?     @unique
  passwordHash      String
  firstName         String
  lastName          String
  avatarUrl         String?
  role              UserRole    @default(CLIENT)
  status            UserStatus  @default(PENDING_VERIFICATION)

  // Location
  city              String
  neighborhood      String?

  // Verification
  phoneVerified     Boolean     @default(false)
  emailVerified     Boolean     @default(false)

  // Timestamps
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  lastLoginAt       DateTime?

  // Relations
  addresses         Address[]
  helperProfile     HelperProfile?
  jobsAsClient      Job[]           @relation("ClientJobs")
  applications      Application[]   @relation("HelperApplications")
  reviewsGiven      Review[]        @relation("ReviewsGiven")
  reviewsReceived   Review[]        @relation("ReviewsReceived")
  conversations     ConversationParticipant[]
  messages          Message[]
  notifications     Notification[]

  // Device tokens for push notifications
  deviceTokens      DeviceToken[]

  @@index([phone])
  @@index([city])
  @@index([role])
  @@map("users")
}

model HelperProfile {
  id                String      @id @default(uuid())
  userId            String      @unique
  user              User        @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Profile
  bio               String      @db.VarChar(500)
  yearsExperience   Int?

  // Work settings
  workRadius        Int         @default(10) // km
  isAvailable       Boolean     @default(true)
  isVerified        Boolean     @default(false)

  // Location (for distance calculations)
  latitude          Float?
  longitude         Float?

  // Stats (denormalized for performance)
  averageRating     Float       @default(0)
  totalReviews      Int         @default(0)
  totalJobsCompleted Int        @default(0)
  responseRate      Float       @default(0) // percentage

  // Portfolio
  portfolioPhotos   String[]    // URLs, max 6

  // Timestamps
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt

  // Relations
  skills            HelperSkill[]
  availability      HelperAvailability[]

  @@index([isAvailable, isVerified])
  @@index([latitude, longitude])
  @@map("helper_profiles")
}

model HelperSkill {
  id              String        @id @default(uuid())
  helperProfileId String
  helperProfile   HelperProfile @relation(fields: [helperProfileId], references: [id], onDelete: Cascade)
  categoryId      String
  category        Category      @relation(fields: [categoryId], references: [id])

  hourlyRate      Int           // MAD per hour

  createdAt       DateTime      @default(now())

  @@unique([helperProfileId, categoryId])
  @@map("helper_skills")
}

model HelperAvailability {
  id              String        @id @default(uuid())
  helperProfileId String
  helperProfile   HelperProfile @relation(fields: [helperProfileId], references: [id], onDelete: Cascade)

  dayOfWeek       DayOfWeek
  startTime       String        // "08:00"
  endTime         String        // "18:00"
  isAvailable     Boolean       @default(true)

  @@unique([helperProfileId, dayOfWeek])
  @@map("helper_availability")
}

// ============================================
// CATEGORY & SKILLS
// ============================================

model Category {
  id              String        @id @default(uuid())
  slug            String        @unique
  nameFr          String        // French name
  nameAr          String        // Arabic name
  icon            String        // Icon name or URL
  description     String?
  isActive        Boolean       @default(true)
  sortOrder       Int           @default(0)

  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  // Relations
  helperSkills    HelperSkill[]
  jobs            Job[]

  @@map("categories")
}

// ============================================
// ADDRESS
// ============================================

model Address {
  id              String        @id @default(uuid())
  userId          String
  user            User          @relation(fields: [userId], references: [id], onDelete: Cascade)

  label           String        // "Maison", "Bureau", etc.
  street          String
  city            String
  neighborhood    String?
  postalCode      String?

  latitude        Float
  longitude       Float

  isDefault       Boolean       @default(false)

  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  // Relations
  jobs            Job[]

  @@index([userId])
  @@map("addresses")
}

// ============================================
// JOB
// ============================================

model Job {
  id              String        @id @default(uuid())
  clientId        String
  client          User          @relation("ClientJobs", fields: [clientId], references: [id])

  // Details
  title           String        @db.VarChar(100)
  description     String        @db.VarChar(1000)
  categoryId      String
  category        Category      @relation(fields: [categoryId], references: [id])

  // Location
  addressId       String
  address         Address       @relation(fields: [addressId], references: [id])
  latitude        Float
  longitude       Float

  // Schedule
  preferredDate   DateTime      @db.Date
  timePreference  TimePreference

  // Budget
  budgetType      BudgetType
  budgetAmount    Int           // MAD

  // Media
  photos          String[]      // URLs, max 4

  // Status
  status          JobStatus     @default(OPEN)
  assignedHelperId String?

  // Timestamps
  startedAt       DateTime?
  completedAt     DateTime?
  cancelledAt     DateTime?
  cancellationReason String?

  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  // Relations
  applications    Application[]
  review          Review?
  conversation    Conversation?

  @@index([clientId])
  @@index([categoryId])
  @@index([status])
  @@index([preferredDate])
  @@index([latitude, longitude])
  @@map("jobs")
}

// ============================================
// APPLICATION
// ============================================

model Application {
  id              String            @id @default(uuid())
  jobId           String
  job             Job               @relation(fields: [jobId], references: [id], onDelete: Cascade)
  helperId        String
  helper          User              @relation("HelperApplications", fields: [helperId], references: [id])

  message         String?           @db.VarChar(300)
  proposedRate    Int?              // MAD (if different from job budget)

  status          ApplicationStatus @default(PENDING)

  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt

  @@unique([jobId, helperId])
  @@index([helperId])
  @@index([status])
  @@map("applications")
}

// ============================================
// REVIEW
// ============================================

model Review {
  id              String        @id @default(uuid())
  jobId           String        @unique
  job             Job           @relation(fields: [jobId], references: [id])

  reviewerId      String
  reviewer        User          @relation("ReviewsGiven", fields: [reviewerId], references: [id])
  revieweeId      String
  reviewee        User          @relation("ReviewsReceived", fields: [revieweeId], references: [id])

  // Ratings (1-5)
  overallRating   Int
  punctualityRating Int?
  qualityRating   Int?
  communicationRating Int?
  valueRating     Int?

  comment         String?       @db.VarChar(500)

  // For helper rating client (optional)
  isClientReview  Boolean       @default(false)

  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@index([revieweeId])
  @@index([reviewerId])
  @@map("reviews")
}

// ============================================
// MESSAGING
// ============================================

model Conversation {
  id              String        @id @default(uuid())
  jobId           String        @unique
  job             Job           @relation(fields: [jobId], references: [id])

  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  lastMessageAt   DateTime      @default(now())

  // Relations
  participants    ConversationParticipant[]
  messages        Message[]

  @@map("conversations")
}

model ConversationParticipant {
  id              String        @id @default(uuid())
  conversationId  String
  conversation    Conversation  @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  userId          String
  user            User          @relation(fields: [userId], references: [id])

  lastReadAt      DateTime      @default(now())

  @@unique([conversationId, userId])
  @@map("conversation_participants")
}

model Message {
  id              String        @id @default(uuid())
  conversationId  String
  conversation    Conversation  @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  senderId        String
  sender          User          @relation(fields: [senderId], references: [id])

  content         String        @db.VarChar(1000)
  imageUrl        String?

  isRead          Boolean       @default(false)
  readAt          DateTime?

  createdAt       DateTime      @default(now())

  @@index([conversationId])
  @@index([senderId])
  @@map("messages")
}

// ============================================
// NOTIFICATIONS
// ============================================

model Notification {
  id              String           @id @default(uuid())
  userId          String
  user            User             @relation(fields: [userId], references: [id], onDelete: Cascade)

  type            NotificationType
  title           String
  body            String
  data            Json?            // Additional data payload

  isRead          Boolean          @default(false)
  readAt          DateTime?

  createdAt       DateTime         @default(now())

  @@index([userId, isRead])
  @@index([createdAt])
  @@map("notifications")
}

model DeviceToken {
  id              String        @id @default(uuid())
  userId          String
  user            User          @relation(fields: [userId], references: [id], onDelete: Cascade)

  token           String        @unique
  platform        String        // "ios", "android", "web"

  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@index([userId])
  @@map("device_tokens")
}

// ============================================
// OTP / VERIFICATION
// ============================================

model OtpCode {
  id              String        @id @default(uuid())
  phone           String
  code            String        // 6 digits
  purpose         String        // "registration", "login", "password_reset"

  attempts        Int           @default(0)
  maxAttempts     Int           @default(3)

  expiresAt       DateTime
  usedAt          DateTime?

  createdAt       DateTime      @default(now())

  @@index([phone, purpose])
  @@map("otp_codes")
}
```

---

## Seed Data - Categories

```typescript
// prisma/seed.ts

const categories = [
  {
    slug: 'menage',
    nameFr: 'Ménage',
    nameAr: 'نظافة',
    icon: 'cleaning',
  },
  {
    slug: 'bricolage',
    nameFr: 'Bricolage',
    nameAr: 'إصلاحات',
    icon: 'tools',
  },
  {
    slug: 'montage-meubles',
    nameFr: 'Montage meubles',
    nameAr: 'تركيب الأثاث',
    icon: 'furniture',
  },
  {
    slug: 'jardinage',
    nameFr: 'Jardinage',
    nameAr: 'البستنة',
    icon: 'plant',
  },
  {
    slug: 'demenagement',
    nameFr: 'Déménagement',
    nameAr: 'نقل الأثاث',
    icon: 'truck',
  },
  {
    slug: 'informatique',
    nameFr: 'Informatique',
    nameAr: 'معلوميات',
    icon: 'computer',
  },
  {
    slug: 'garde-enfants',
    nameFr: 'Garde d\'enfants',
    nameAr: 'رعاية الأطفال',
    icon: 'baby',
  },
  {
    slug: 'cours-particuliers',
    nameFr: 'Cours particuliers',
    nameAr: 'دروس خصوصية',
    icon: 'book',
  },
  {
    slug: 'plomberie',
    nameFr: 'Plomberie',
    nameAr: 'سباكة',
    icon: 'wrench',
  },
  {
    slug: 'electricite',
    nameFr: 'Électricité',
    nameAr: 'كهرباء',
    icon: 'lightning',
  },
  {
    slug: 'peinture',
    nameFr: 'Peinture',
    nameAr: 'طلاء',
    icon: 'paint',
  },
  {
    slug: 'climatisation',
    nameFr: 'Climatisation',
    nameAr: 'تكييف',
    icon: 'snowflake',
  },
  {
    slug: 'nettoyage-auto',
    nameFr: 'Nettoyage auto',
    nameAr: 'غسيل السيارات',
    icon: 'car',
  },
  {
    slug: 'livraison',
    nameFr: 'Livraison',
    nameAr: 'توصيل',
    icon: 'delivery',
  },
  {
    slug: 'cuisine',
    nameFr: 'Cuisine',
    nameAr: 'طبخ',
    icon: 'chef',
  },
];
```

---

## Morocco Cities Enum (for validation)

```typescript
// packages/shared/src/constants/cities.ts

export const MOROCCO_CITIES = [
  'Casablanca',
  'Rabat',
  'Marrakech',
  'Fès',
  'Tanger',
  'Agadir',
  'Meknès',
  'Oujda',
  'Kénitra',
  'Tétouan',
  'Salé',
  'Nador',
  'Mohammedia',
  'El Jadida',
  'Béni Mellal',
  'Khouribga',
  'Safi',
  'Khémisset',
  'Settat',
  'Larache',
  'Taza',
  'Berrechid',
  'Errachidia',
  'Guelmim',
  'Essaouira',
] as const;

export type MoroccoCity = typeof MOROCCO_CITIES[number];
```

---

## Indexes Strategy

### High-priority indexes (included in schema):
1. `users.phone` - Login lookups
2. `users.city` - Filtering by city
3. `jobs.status` - Job listings
4. `jobs.categoryId` - Category filtering
5. `jobs.preferredDate` - Date filtering
6. `jobs.latitude, jobs.longitude` - Geo queries
7. `helper_profiles.latitude, longitude` - Nearby helpers
8. `applications.helperId` - Helper's applications
9. `messages.conversationId` - Chat messages
10. `notifications.userId, isRead` - Notification feed

### PostGIS Extension (for production)
For proper geospatial queries, consider using PostGIS:

```sql
-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Add geography column to helper_profiles
ALTER TABLE helper_profiles
ADD COLUMN location geography(Point, 4326);

-- Create spatial index
CREATE INDEX helper_profiles_location_idx
ON helper_profiles USING GIST(location);

-- Query helpers within radius
SELECT * FROM helper_profiles
WHERE ST_DWithin(
  location,
  ST_MakePoint(-7.5898, 33.5731)::geography, -- Casablanca
  10000 -- 10km radius
);
```
