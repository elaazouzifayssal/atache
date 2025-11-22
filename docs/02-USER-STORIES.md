# User Stories - MVP

## 👤 User Personas

### Persona 1: Client (Demandeur)
**Fatima, 35 ans, Casablanca**
- Working professional, busy schedule
- Needs help with ménage, bricolage
- Wants reliable, vetted helpers
- Prefers communication in French/Darija

### Persona 2: Helper (Prestataire)
**Youssef, 28 ans, Casablanca**
- Skilled handyman, flexible schedule
- Looking for extra income
- Has smartphone, uses WhatsApp daily
- Wants steady flow of jobs nearby

---

## 📱 EPIC 1: User Accounts

### US-1.1: User Registration
**As a** new user
**I want to** register with my phone number
**So that** I can access the platform securely

**Acceptance Criteria:**
- [ ] User enters phone number (+212 format)
- [ ] System sends OTP via SMS
- [ ] User verifies OTP (6 digits, 5 min expiry)
- [ ] User chooses account type: Client or Helper
- [ ] User sets password (min 8 chars)
- [ ] Account is created and user is logged in

**Technical Notes:**
- Phone number must be unique
- Store phone in E.164 format (+212XXXXXXXXX)
- OTP retry limit: 3 attempts, then 15 min cooldown

---

### US-1.2: Client Profile Setup
**As a** client
**I want to** complete my profile
**So that** helpers can trust me

**Acceptance Criteria:**
- [ ] User enters: first name, last name
- [ ] User selects city from dropdown
- [ ] User can optionally add profile photo
- [ ] User can add address(es) for jobs
- [ ] Profile completion percentage shown

**Fields:**
```
- firstName: string (required)
- lastName: string (required)
- phone: string (from registration)
- email: string (optional)
- city: enum (required)
- neighborhood: string (optional)
- addresses: Address[] (optional)
- avatarUrl: string (optional)
```

---

### US-1.3: Helper Profile Setup
**As a** helper
**I want to** create a detailed profile
**So that** clients can find and trust me

**Acceptance Criteria:**
- [ ] All client profile fields +
- [ ] User selects skills/categories (multi-select)
- [ ] User sets hourly rate (MAD/hour) per category
- [ ] User writes bio/description (max 500 chars)
- [ ] User uploads profile photo (required for helpers)
- [ ] User can add portfolio photos (max 6)
- [ ] User sets availability (days/hours)
- [ ] User specifies work radius (km from location)

**Fields:**
```
- ...clientFields
- bio: string (required, 50-500 chars)
- skills: Skill[] (required, min 1)
- hourlyRates: { skillId: number, rate: number }[]
- yearsExperience: number (optional)
- portfolioPhotos: string[] (max 6)
- availability: {
    monday: { start: time, end: time, available: boolean }
    ...
  }
- workRadius: number (km, 1-50)
- isVerified: boolean (admin sets)
- isAvailable: boolean (helper toggles)
```

---

### US-1.4: User Login
**As a** registered user
**I want to** log in with phone + password
**So that** I can access my account

**Acceptance Criteria:**
- [ ] User enters phone number
- [ ] User enters password
- [ ] System validates credentials
- [ ] On success: JWT token issued, redirect to home
- [ ] On failure: error message, retry allowed
- [ ] "Forgot password" link available

---

### US-1.5: Password Reset
**As a** user who forgot my password
**I want to** reset it via SMS
**So that** I can regain access

**Acceptance Criteria:**
- [ ] User enters phone number
- [ ] System sends OTP
- [ ] User enters OTP + new password
- [ ] Password is updated
- [ ] User is logged in

---

## 📝 EPIC 2: Job Posting & Search

### US-2.1: Create Job Request
**As a** client
**I want to** post a job request
**So that** helpers can apply

**Acceptance Criteria:**
- [ ] User selects category from list
- [ ] User writes title (5-100 chars)
- [ ] User writes description (20-1000 chars)
- [ ] User selects date (today or future)
- [ ] User selects time preference (morning/afternoon/evening/flexible)
- [ ] User enters or selects address
- [ ] User can add photos (max 4)
- [ ] User sets budget type: fixed or hourly
- [ ] User sets budget amount (MAD)
- [ ] User submits → job status = "open"

**Job Fields:**
```
- id: uuid
- clientId: uuid
- title: string
- description: string
- categoryId: number
- address: Address
- location: Point (lat, lng)
- preferredDate: date
- timePreference: enum (morning, afternoon, evening, flexible)
- budgetType: enum (fixed, hourly)
- budgetAmount: number (MAD)
- photos: string[] (max 4)
- status: enum (open, assigned, in_progress, completed, cancelled)
- createdAt: timestamp
- updatedAt: timestamp
```

---

### US-2.2: Browse Available Jobs (Helper)
**As a** helper
**I want to** see jobs matching my skills
**So that** I can find work

**Acceptance Criteria:**
- [ ] Jobs filtered by helper's selected skills
- [ ] Jobs sorted by distance (nearest first)
- [ ] Each job card shows: title, category, location, date, budget
- [ ] User can filter by: category, distance, date, budget range
- [ ] User can sort by: distance, date, budget
- [ ] Pagination or infinite scroll

---

### US-2.3: View Job Details (Helper)
**As a** helper
**I want to** see full job details
**So that** I can decide to apply

**Acceptance Criteria:**
- [ ] Full description visible
- [ ] Photos displayed in gallery
- [ ] Client info: name, rating, jobs completed
- [ ] Distance from helper's location
- [ ] "Postuler" (Apply) button prominent
- [ ] Similar jobs suggestions

---

### US-2.4: Apply for Job (Helper)
**As a** helper
**I want to** apply for a job
**So that** the client can consider me

**Acceptance Criteria:**
- [ ] Helper clicks "Postuler"
- [ ] Helper can write a message (optional, max 300 chars)
- [ ] Helper can propose different rate (optional)
- [ ] Application submitted → status = "pending"
- [ ] Client notified of new application
- [ ] Helper sees "Candidature envoyée" confirmation

---

### US-2.5: View My Jobs (Client)
**As a** client
**I want to** see all my posted jobs
**So that** I can manage them

**Acceptance Criteria:**
- [ ] Tabs: Open, In Progress, Completed, Cancelled
- [ ] Each job shows: title, date, status, # applications
- [ ] Click to view details + applications

---

### US-2.6: View Applications (Client)
**As a** client
**I want to** see who applied to my job
**So that** I can choose a helper

**Acceptance Criteria:**
- [ ] List of applicants with:
  - Profile photo
  - Name
  - Rating (stars + count)
  - Proposed rate
  - Message
  - "View Profile" link
- [ ] "Accepter" and "Refuser" buttons
- [ ] Can only accept one helper per job

---

### US-2.7: Helper Matching/Recommendations
**As a** client
**I want to** see recommended helpers
**So that** I can find the best match quickly

**Acceptance Criteria:**
- [ ] System suggests top 5 helpers based on:
  - Matching skills
  - Proximity to job location
  - Rating score
  - Availability on job date
  - Response rate
- [ ] "Inviter" button to directly invite helper
- [ ] Invited helpers get notification

---

## 💬 EPIC 3: Bookings & Chat

### US-3.1: Accept/Decline Application (Client)
**As a** client
**I want to** accept or decline applications
**So that** I can hire a helper

**Acceptance Criteria:**
- [ ] Client clicks "Accepter" on an application
- [ ] Job status changes to "assigned"
- [ ] Other applicants auto-declined with notification
- [ ] Selected helper notified
- [ ] Chat channel opened between client & helper

---

### US-3.2: In-App Messaging
**As a** client or helper
**I want to** chat with the other party
**So that** we can coordinate the job

**Acceptance Criteria:**
- [ ] Real-time messaging (WebSocket)
- [ ] Message types: text, image
- [ ] Typing indicator
- [ ] Read receipts
- [ ] Push notification for new messages
- [ ] Chat history preserved
- [ ] Only enabled after job assigned

---

### US-3.3: Start Job (Helper)
**As a** helper
**I want to** mark a job as started
**So that** the client knows I've begun

**Acceptance Criteria:**
- [ ] "Commencer" button visible on assigned job
- [ ] Job status → "in_progress"
- [ ] Client notified
- [ ] Start time recorded

---

### US-3.4: Complete Job (Helper)
**As a** helper
**I want to** mark a job as completed
**So that** I can get rated and paid

**Acceptance Criteria:**
- [ ] "Terminer" button visible on in-progress job
- [ ] Helper can add completion notes
- [ ] Job status → "pending_review"
- [ ] Client notified to confirm & rate

---

### US-3.5: Confirm Completion (Client)
**As a** client
**I want to** confirm the job is done
**So that** it can be finalized

**Acceptance Criteria:**
- [ ] Client reviews completion
- [ ] Client clicks "Confirmer"
- [ ] Job status → "completed"
- [ ] Rating prompt appears

---

### US-3.6: Cancel Job
**As a** client or helper
**I want to** cancel a job
**So that** I can handle changes in plans

**Acceptance Criteria:**
- [ ] Cancel button available before "in_progress"
- [ ] User selects cancellation reason
- [ ] Other party notified
- [ ] Job status → "cancelled"
- [ ] Cancellation recorded for analytics

---

## ⭐ EPIC 4: Ratings

### US-4.1: Rate Helper (Client)
**As a** client
**I want to** rate and review the helper
**So that** others can benefit from my experience

**Acceptance Criteria:**
- [ ] Prompt after job completion
- [ ] 1-5 star rating (required)
- [ ] Written review (optional, max 500 chars)
- [ ] Rate specific aspects:
  - Ponctualité (punctuality)
  - Qualité du travail (quality)
  - Communication
  - Rapport qualité/prix (value)
- [ ] Submit → review visible on helper profile

---

### US-4.2: Rate Client (Helper) - Optional
**As a** helper
**I want to** rate the client
**So that** other helpers know what to expect

**Acceptance Criteria:**
- [ ] Optional prompt after job completion
- [ ] 1-5 star rating
- [ ] Brief review (optional)
- [ ] Visible only to other helpers

---

### US-4.3: View Reviews on Profile
**As a** user
**I want to** see reviews on profiles
**So that** I can make informed decisions

**Acceptance Criteria:**
- [ ] Average rating displayed prominently
- [ ] Total review count shown
- [ ] Recent reviews listed (paginated)
- [ ] Each review shows: rating, text, date, reviewer name

---

## 🔔 EPIC 5: Notifications

### US-5.1: Push Notifications
**As a** user
**I want to** receive push notifications
**So that** I don't miss important updates

**Notification Triggers:**
- [ ] New job matching helper's skills (helper)
- [ ] New application on job (client)
- [ ] Application accepted/declined (helper)
- [ ] New message in chat (both)
- [ ] Job starting reminder - 1h before (both)
- [ ] Job status changes (both)
- [ ] New review received (helper)

---

### US-5.2: SMS Notifications (Fallback)
**As a** user without the app open
**I want to** receive SMS for critical updates
**So that** I stay informed

**SMS Triggers (critical only):**
- [ ] Application accepted
- [ ] Job cancelled
- [ ] Job reminder (1h before)

---

## 📊 Job Status Flow

```
                    ┌─────────────┐
                    │    OPEN     │ ← Job created
                    └──────┬──────┘
                           │ Client accepts application
                           ▼
                    ┌─────────────┐
                    │  ASSIGNED   │ ← Helper selected
                    └──────┬──────┘
                           │ Helper starts job
                           ▼
                    ┌─────────────┐
                    │ IN_PROGRESS │ ← Work ongoing
                    └──────┬──────┘
                           │ Helper marks complete
                           ▼
                    ┌─────────────┐
                    │PENDING_REVIEW│ ← Awaiting client
                    └──────┬──────┘
                           │ Client confirms
                           ▼
                    ┌─────────────┐
                    │  COMPLETED  │ ← Done ✓
                    └─────────────┘

        At any point before IN_PROGRESS:
                    ┌─────────────┐
                    │  CANCELLED  │
                    └─────────────┘
```

---

## 🎯 MVP Priority Matrix

| Priority | Feature | Complexity |
|----------|---------|------------|
| P0 | Phone registration + OTP | Medium |
| P0 | Helper profile | Medium |
| P0 | Job posting | Medium |
| P0 | Job search + filters | Medium |
| P0 | Apply for job | Low |
| P0 | Accept application | Low |
| P0 | Job status flow | Medium |
| P1 | In-app chat | High |
| P1 | Ratings & reviews | Medium |
| P1 | Push notifications | Medium |
| P2 | Helper recommendations | High |
| P2 | SMS notifications | Low |
| P2 | Portfolio photos | Low |
