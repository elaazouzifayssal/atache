# UX Flows & Screen Descriptions

## 📱 App Navigation Structure

```
┌─────────────────────────────────────────────────────────────┐
│                        KHEDMA APP                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  AUTH FLOW: Splash → Onboarding → Login/Register → OTP     │
│                           │                                 │
│                           ▼                                 │
│  MAIN APP (Tab Navigation)                                  │
│                                                             │
│  CLIENT: [🏠 Accueil] [📝 Mes Jobs] [💬 Messages] [👤 Profil]│
│  HELPER: [🔍 Jobs] [📋 Candidatures] [💬 Messages] [👤 Profil]│
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Flow 1: Registration

1. **Splash** → 2s loading
2. **Onboarding** → 3 slides explaining app value
3. **Role Selection** → Client or Helper
4. **Phone Input** → +212 format
5. **OTP Verification** → 6 digits
6. **Password Creation** → Min 8 chars
7. **Profile Setup** → Name, city, photo (+ skills/rates for helpers)

---

## 🏠 Flow 2: Client Job Posting

1. **Home** → Category grid + popular helpers
2. **Select Category** → Tap to choose
3. **Job Details** → Title, description, photos
4. **Location & Time** → Address, date, time slot
5. **Budget** → Fixed or hourly, amount
6. **Confirmation** → Review & publish

---

## 🔍 Flow 3: Helper Job Search

1. **Job Feed** → Cards sorted by distance
2. **Filters** → Category, distance, date, budget
3. **Job Details** → Full info + client profile
4. **Apply** → Message + optional rate proposal

---

## 📋 Flow 4: Booking Management

**Client:**
- My Jobs → View applications → Accept/decline
- Track status: Open → Assigned → In Progress → Completed

**Helper:**
- My Applications → Track status
- Accepted jobs → Start → Complete

---

## 💬 Flow 5: Chat

- Conversation list with unread badges
- Real-time messaging after job assigned
- Text + image support

---

## ⭐ Flow 6: Rating

After job completion:
- Overall rating (1-5 stars)
- Aspect ratings: punctuality, quality, communication
- Optional comment

---

## 🎨 Design System

### Colors (Morocco-inspired)
| Role | Color | Hex |
|------|-------|-----|
| Primary | Rouge | #E63946 |
| Secondary | Bleu nuit | #1D3557 |
| Accent | Orange sable | #F4A261 |
| Success | Vert menthe | #2A9D8F |
| Background | Gris clair | #F8F9FA |

### Typography
- Headings: Inter Bold
- Body: Inter Regular
- Arabic: Noto Sans Arabic
