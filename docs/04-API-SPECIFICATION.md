# API Specification

## Base URL
```
Development: http://localhost:3001/api/v1
Production:  https://api.khedma.ma/v1
```

## Authentication
All protected endpoints require Bearer token in header:
```
Authorization: Bearer <jwt_token>
```

## Response Format
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

## Error Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Description du problème",
    "details": [
      { "field": "phone", "message": "Format invalide" }
    ]
  }
}
```

---

## 🔐 Auth Endpoints

### POST /auth/send-otp
Send OTP to phone number for registration/login.

**Request:**
```json
{
  "phone": "+212612345678",
  "purpose": "registration" // "registration" | "login" | "password_reset"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "message": "OTP envoyé",
    "expiresIn": 300
  }
}
```

**Errors:**
- `400` - Invalid phone format
- `409` - Phone already registered (for registration)
- `429` - Too many requests

---

### POST /auth/verify-otp
Verify OTP code.

**Request:**
```json
{
  "phone": "+212612345678",
  "code": "123456",
  "purpose": "registration"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "verified": true,
    "token": "temp_verification_token"
  }
}
```

---

### POST /auth/register
Complete registration after OTP verification.

**Request:**
```json
{
  "verificationToken": "temp_token_from_otp",
  "phone": "+212612345678",
  "password": "securepassword123",
  "firstName": "Mohammed",
  "lastName": "Alaoui",
  "role": "CLIENT", // "CLIENT" | "HELPER"
  "city": "Casablanca"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "phone": "+212612345678",
      "firstName": "Mohammed",
      "lastName": "Alaoui",
      "role": "CLIENT",
      "city": "Casablanca"
    },
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  }
}
```

---

### POST /auth/login
Login with phone and password.

**Request:**
```json
{
  "phone": "+212612345678",
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  }
}
```

---

### POST /auth/refresh
Refresh access token.

**Request:**
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "new_jwt_access_token"
  }
}
```

---

### POST /auth/logout
Invalidate refresh token.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Déconnexion réussie"
  }
}
```

---

### POST /auth/reset-password
Reset password after OTP verification.

**Request:**
```json
{
  "verificationToken": "temp_token_from_otp",
  "phone": "+212612345678",
  "newPassword": "newsecurepassword123"
}
```

---

## 👤 User Endpoints

### GET /users/me
Get current user profile.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "phone": "+212612345678",
    "email": "user@email.com",
    "firstName": "Mohammed",
    "lastName": "Alaoui",
    "avatarUrl": "https://...",
    "role": "CLIENT",
    "city": "Casablanca",
    "neighborhood": "Maarif",
    "phoneVerified": true,
    "createdAt": "2024-01-15T10:00:00Z",
    "helperProfile": null // or HelperProfile object
  }
}
```

---

### PATCH /users/me
Update current user profile.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "firstName": "Mohammed",
  "lastName": "Alaoui",
  "email": "user@email.com",
  "city": "Rabat",
  "neighborhood": "Agdal"
}
```

---

### POST /users/me/avatar
Upload profile photo.

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Request:** FormData with `file` field

**Response (200):**
```json
{
  "success": true,
  "data": {
    "avatarUrl": "https://cloudinary.com/..."
  }
}
```

---

### GET /users/:id/public
Get public profile of a user.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "firstName": "Mohammed",
    "lastName": "A.",
    "avatarUrl": "https://...",
    "city": "Casablanca",
    "role": "HELPER",
    "createdAt": "2024-01-15T10:00:00Z",
    "helperProfile": {
      "bio": "...",
      "skills": [...],
      "averageRating": 4.8,
      "totalReviews": 25,
      "totalJobsCompleted": 30,
      "isVerified": true
    }
  }
}
```

---

## 🛠️ Helper Profile Endpoints

### POST /helper-profile
Create helper profile (upgrade CLIENT to HELPER).

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "bio": "Bricoleur expérimenté avec 5 ans d'expérience...",
  "yearsExperience": 5,
  "workRadius": 15,
  "latitude": 33.5731,
  "longitude": -7.5898,
  "skills": [
    { "categoryId": "uuid-bricolage", "hourlyRate": 150 },
    { "categoryId": "uuid-montage", "hourlyRate": 120 }
  ],
  "availability": [
    { "dayOfWeek": "MONDAY", "startTime": "08:00", "endTime": "18:00", "isAvailable": true },
    { "dayOfWeek": "TUESDAY", "startTime": "08:00", "endTime": "18:00", "isAvailable": true }
  ]
}
```

---

### PATCH /helper-profile
Update helper profile.

**Headers:** `Authorization: Bearer <token>`

**Request:** Same fields as POST, all optional.

---

### PATCH /helper-profile/availability
Toggle helper availability.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "isAvailable": false
}
```

---

### POST /helper-profile/portfolio
Upload portfolio photos.

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Request:** FormData with `files` field (max 6)

---

### GET /helpers
Search/browse helpers.

**Query params:**
- `categoryId` - Filter by category
- `city` - Filter by city
- `lat` & `lng` - User location for distance calc
- `radius` - Max distance in km (default 20)
- `minRating` - Minimum rating (1-5)
- `available` - true/false
- `sortBy` - "distance" | "rating" | "price" | "reviews"
- `page` - Page number
- `limit` - Results per page (default 20)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user": {
        "id": "uuid",
        "firstName": "Youssef",
        "lastName": "B.",
        "avatarUrl": "https://..."
      },
      "bio": "...",
      "skills": [
        { "category": { "id": "uuid", "nameFr": "Bricolage" }, "hourlyRate": 150 }
      ],
      "averageRating": 4.8,
      "totalReviews": 25,
      "totalJobsCompleted": 30,
      "isVerified": true,
      "distance": 2.5 // km, if lat/lng provided
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 45
  }
}
```

---

## 📦 Category Endpoints

### GET /categories
Get all categories.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "slug": "menage",
      "nameFr": "Ménage",
      "nameAr": "نظافة",
      "icon": "cleaning"
    }
  ]
}
```

---

## 📍 Address Endpoints

### GET /addresses
Get user's saved addresses.

**Headers:** `Authorization: Bearer <token>`

---

### POST /addresses
Create new address.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "label": "Maison",
  "street": "123 Rue Mohammed V",
  "city": "Casablanca",
  "neighborhood": "Maarif",
  "postalCode": "20000",
  "latitude": 33.5731,
  "longitude": -7.5898,
  "isDefault": true
}
```

---

### PATCH /addresses/:id
Update address.

---

### DELETE /addresses/:id
Delete address.

---

## 📝 Job Endpoints

### POST /jobs
Create a new job request.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "title": "Montage armoire IKEA",
  "description": "J'ai besoin d'aide pour monter une armoire PAX...",
  "categoryId": "uuid",
  "addressId": "uuid",
  "preferredDate": "2024-02-15",
  "timePreference": "AFTERNOON",
  "budgetType": "FIXED",
  "budgetAmount": 200,
  "photos": [] // URLs from prior upload
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Montage armoire IKEA",
    "status": "OPEN",
    ...
  }
}
```

---

### GET /jobs
Search jobs (for helpers).

**Headers:** `Authorization: Bearer <token>`

**Query params:**
- `categoryId` - Filter by category
- `city` - Filter by city
- `lat` & `lng` - Helper location
- `radius` - Max distance (default 20km)
- `minBudget` & `maxBudget`
- `dateFrom` & `dateTo`
- `status` - Default "OPEN"
- `sortBy` - "date" | "distance" | "budget"
- `page` & `limit`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Montage armoire IKEA",
      "description": "...",
      "category": { "id": "uuid", "nameFr": "Montage meubles" },
      "address": { "city": "Casablanca", "neighborhood": "Maarif" },
      "preferredDate": "2024-02-15",
      "timePreference": "AFTERNOON",
      "budgetType": "FIXED",
      "budgetAmount": 200,
      "photos": [],
      "status": "OPEN",
      "client": {
        "id": "uuid",
        "firstName": "Fatima",
        "lastName": "A.",
        "avatarUrl": "..."
      },
      "distance": 3.2,
      "applicationsCount": 5,
      "createdAt": "2024-02-10T10:00:00Z"
    }
  ],
  "meta": { ... }
}
```

---

### GET /jobs/:id
Get job details.

**Headers:** `Authorization: Bearer <token>`

---

### GET /jobs/my
Get current user's jobs (as client).

**Headers:** `Authorization: Bearer <token>`

**Query params:**
- `status` - Filter by status

---

### PATCH /jobs/:id
Update job (only if OPEN).

**Headers:** `Authorization: Bearer <token>`

---

### DELETE /jobs/:id
Cancel/delete job (only if OPEN).

**Headers:** `Authorization: Bearer <token>`

---

### POST /jobs/:id/photos
Upload job photos.

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

---

## 📋 Application Endpoints

### POST /jobs/:jobId/applications
Apply for a job (helper).

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "message": "Bonjour, je suis disponible et expérimenté...",
  "proposedRate": 180
}
```

---

### GET /jobs/:jobId/applications
Get applications for a job (client only).

**Headers:** `Authorization: Bearer <token>`

---

### GET /applications/my
Get helper's applications.

**Headers:** `Authorization: Bearer <token>`

**Query params:**
- `status` - Filter by status

---

### POST /applications/:id/accept
Accept application (client).

**Headers:** `Authorization: Bearer <token>`

**Side effects:**
- Job status → ASSIGNED
- Other applications → DECLINED
- Conversation created
- Notifications sent

---

### POST /applications/:id/decline
Decline application (client).

**Headers:** `Authorization: Bearer <token>`

---

### POST /applications/:id/withdraw
Withdraw application (helper).

**Headers:** `Authorization: Bearer <token>`

---

## 🔄 Job Status Endpoints

### POST /jobs/:id/start
Start job (helper).

**Headers:** `Authorization: Bearer <token>`

**Side effects:**
- Job status → IN_PROGRESS
- startedAt set
- Client notified

---

### POST /jobs/:id/complete
Mark job as complete (helper).

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "notes": "Travail terminé, armoire montée avec succès."
}
```

**Side effects:**
- Job status → PENDING_REVIEW
- Client notified to confirm

---

### POST /jobs/:id/confirm
Confirm job completion (client).

**Headers:** `Authorization: Bearer <token>`

**Side effects:**
- Job status → COMPLETED
- completedAt set
- Helper stats updated
- Review prompt triggered

---

### POST /jobs/:id/cancel
Cancel job.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "reason": "Je ne suis plus disponible"
}
```

---

## ⭐ Review Endpoints

### POST /jobs/:jobId/reviews
Create review for completed job.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "overallRating": 5,
  "punctualityRating": 5,
  "qualityRating": 5,
  "communicationRating": 4,
  "valueRating": 5,
  "comment": "Excellent travail, très professionnel!"
}
```

---

### GET /users/:userId/reviews
Get reviews for a user.

**Query params:**
- `page` & `limit`

---

## 💬 Chat Endpoints

### GET /conversations
Get user's conversations.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "job": {
        "id": "uuid",
        "title": "Montage armoire"
      },
      "otherParticipant": {
        "id": "uuid",
        "firstName": "Youssef",
        "avatarUrl": "..."
      },
      "lastMessage": {
        "content": "D'accord, à demain!",
        "createdAt": "2024-02-10T15:30:00Z",
        "isRead": false
      },
      "unreadCount": 2
    }
  ]
}
```

---

### GET /conversations/:id/messages
Get messages in a conversation.

**Headers:** `Authorization: Bearer <token>`

**Query params:**
- `before` - Cursor for pagination
- `limit` - Default 50

---

### POST /conversations/:id/messages
Send a message.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "content": "Bonjour, est-ce que vous êtes disponible demain?"
}
```

---

### POST /conversations/:id/messages/image
Send an image message.

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

---

### POST /conversations/:id/read
Mark conversation as read.

**Headers:** `Authorization: Bearer <token>`

---

## 🔔 Notification Endpoints

### GET /notifications
Get user's notifications.

**Headers:** `Authorization: Bearer <token>`

**Query params:**
- `unreadOnly` - true/false
- `page` & `limit`

---

### POST /notifications/read
Mark notifications as read.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "notificationIds": ["uuid1", "uuid2"]
}
```

---

### POST /notifications/read-all
Mark all notifications as read.

**Headers:** `Authorization: Bearer <token>`

---

### DELETE /notifications/:id
Delete a notification.

---

## 📱 Device Token Endpoints

### POST /device-tokens
Register device for push notifications.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "token": "expo_push_token_or_fcm_token",
  "platform": "ios" // "ios" | "android" | "web"
}
```

---

### DELETE /device-tokens/:token
Unregister device token.

---

## 🔍 Matching Endpoint

### GET /jobs/:jobId/recommended-helpers
Get recommended helpers for a job.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "helper": { ... },
      "matchScore": 95,
      "matchReasons": [
        "Compétences correspondantes",
        "Disponible le jour demandé",
        "À 2km du lieu",
        "Note moyenne: 4.9"
      ]
    }
  ]
}
```

---

## WebSocket Events (Socket.io)

### Connection
```javascript
// Client
const socket = io('wss://api.khedma.ma', {
  auth: { token: 'jwt_token' }
});
```

### Events: Client → Server
```javascript
// Join conversation room
socket.emit('join_conversation', { conversationId: 'uuid' });

// Leave conversation room
socket.emit('leave_conversation', { conversationId: 'uuid' });

// Send message
socket.emit('send_message', {
  conversationId: 'uuid',
  content: 'Hello!'
});

// Typing indicator
socket.emit('typing', { conversationId: 'uuid' });
socket.emit('stop_typing', { conversationId: 'uuid' });

// Mark as read
socket.emit('mark_read', { conversationId: 'uuid' });
```

### Events: Server → Client
```javascript
// New message
socket.on('new_message', (message) => {
  // { id, conversationId, senderId, content, createdAt }
});

// Typing indicator
socket.on('user_typing', ({ conversationId, userId }) => {});
socket.on('user_stop_typing', ({ conversationId, userId }) => {});

// Message read
socket.on('messages_read', ({ conversationId, userId, readAt }) => {});

// Notifications
socket.on('notification', (notification) => {
  // { id, type, title, body, data }
});
```

---

## Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Invalid input data |
| `UNAUTHORIZED` | Missing or invalid token |
| `FORBIDDEN` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `CONFLICT` | Resource already exists |
| `RATE_LIMITED` | Too many requests |
| `OTP_EXPIRED` | OTP code expired |
| `OTP_INVALID` | Invalid OTP code |
| `OTP_MAX_ATTEMPTS` | Max OTP attempts reached |
| `JOB_NOT_OPEN` | Job is not accepting applications |
| `ALREADY_APPLIED` | Already applied to this job |
| `NOT_JOB_OWNER` | Not the owner of this job |
| `NOT_ASSIGNED_HELPER` | Not the assigned helper |
