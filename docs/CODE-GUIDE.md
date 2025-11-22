# 📖 Guide du Code - Comprendre et Modifier Khedma

Ce document explique comment le code est organisé, quelles technologies sont utilisées et pourquoi.

---

## 🏗️ Architecture du Projet

```
khedma/
├── apps/                    # Les 3 applications
│   ├── api/                 # Backend (serveur)
│   ├── web/                 # Site web
│   └── mobile/              # App mobile
├── packages/                # Code partagé
│   └── shared/              # Types, constantes, utils
├── docs/                    # Documentation
├── package.json             # Config racine
├── pnpm-workspace.yaml      # Config monorepo
└── turbo.json               # Config Turborepo
```

### Pourquoi cette structure ?

**Monorepo** = Tout le code dans un seul dépôt Git. Avantages :
- Code partagé facilement entre les apps
- Une seule commande pour tout installer
- Cohérence des versions

---

## 🛠️ Technologies Utilisées

### Backend (apps/api/)

| Technologie | Rôle | Pourquoi ce choix |
|-------------|------|-------------------|
| **NestJS** | Framework backend | Structure claire, TypeScript natif, modulaire |
| **Prisma** | ORM (accès base de données) | Simple, type-safe, migrations faciles |
| **PostgreSQL** | Base de données | Robuste, gratuit, supporte les requêtes géo |
| **JWT** | Authentification | Standard, stateless, sécurisé |
| **Socket.io** | Temps réel (chat) | Fonctionne partout, reconnexion auto |
| **Swagger** | Documentation API | Auto-générée, testable dans le navigateur |

### Frontend Web (apps/web/)

| Technologie | Rôle | Pourquoi ce choix |
|-------------|------|-------------------|
| **Next.js 14** | Framework React | SSR, routing, optimisé, Vercel-ready |
| **Tailwind CSS** | Styles | Rapide, utilitaire, pas de CSS à écrire |
| **React Query** | Gestion des données | Cache, refetch auto, loading states |
| **Zustand** | État global | Simple, léger, pas de boilerplate |
| **Axios** | Requêtes HTTP | Interceptors, facile à configurer |

### Mobile (apps/mobile/)

| Technologie | Rôle | Pourquoi ce choix |
|-------------|------|-------------------|
| **React Native** | Framework mobile | Un code = iOS + Android |
| **Expo** | Plateforme | Simplifie le dev, OTA updates |
| **Expo Router** | Navigation | File-based comme Next.js |
| **NativeWind** | Styles | Tailwind pour React Native |

### Partagé (packages/shared/)

| Fichier | Contenu | Utilisé par |
|---------|---------|-------------|
| `types/` | Interfaces TypeScript | Tous |
| `constants/` | Villes, catégories | Tous |
| `validation/` | Validation téléphone, etc | Tous |
| `utils/` | Fonctions utilitaires | Tous |

---

## 📁 Structure Détaillée du Backend

```
apps/api/
├── prisma/
│   ├── schema.prisma        # Définition des tables
│   └── seed.ts              # Données initiales
├── src/
│   ├── main.ts              # Point d'entrée
│   ├── app.module.ts        # Module racine
│   ├── prisma/              # Service base de données
│   └── modules/
│       ├── auth/            # Authentification
│       ├── users/           # Utilisateurs
│       ├── jobs/            # Offres de jobs
│       ├── applications/    # Candidatures
│       ├── messages/        # Chat
│       ├── reviews/         # Avis
│       ├── categories/      # Catégories
│       └── notifications/   # Notifications
```

### Comment fonctionne un module NestJS ?

Chaque module a 3 fichiers principaux :

```
modules/jobs/
├── jobs.module.ts      # Déclare le module
├── jobs.controller.ts  # Reçoit les requêtes HTTP
└── jobs.service.ts     # Logique métier
```

**Flux d'une requête :**
```
Client → Controller → Service → Prisma → Base de données
                                    ↓
Client ← Controller ← Service ← Réponse
```

### Exemple : Créer un job

```typescript
// jobs.controller.ts - Reçoit la requête
@Post()
async create(@Request() req, @Body() data: any) {
  return this.jobsService.create(req.user.id, data);
}

// jobs.service.ts - Logique métier
async create(clientId: string, data: any) {
  return this.prisma.job.create({
    data: {
      ...data,
      clientId,
      status: 'OPEN',
    },
  });
}
```

---

## 📁 Structure du Frontend Web

```
apps/web/
├── src/
│   ├── app/                 # Pages (App Router)
│   │   ├── layout.tsx       # Layout global
│   │   ├── page.tsx         # Page d'accueil (/)
│   │   ├── login/
│   │   │   └── page.tsx     # Page /login
│   │   ├── register/
│   │   │   └── page.tsx     # Page /register
│   │   └── dashboard/
│   │       └── page.tsx     # Page /dashboard
│   ├── components/          # Composants réutilisables
│   ├── lib/
│   │   └── api.ts           # Client API (axios)
│   └── store/
│       └── auth.ts          # État global (zustand)
├── tailwind.config.ts       # Config Tailwind
└── next.config.js           # Config Next.js
```

### Routing Next.js (App Router)

Le chemin du fichier = l'URL :
- `app/page.tsx` → `/`
- `app/login/page.tsx` → `/login`
- `app/jobs/[id]/page.tsx` → `/jobs/123`

### Composant React typique

```tsx
// app/login/page.tsx
'use client';  // Indique que c'est un composant client

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const { setAuth } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data } = await authApi.login(phone, password);
    setAuth(data.user, data.accessToken, data.refreshToken);
    router.push('/dashboard');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={phone} onChange={(e) => setPhone(e.target.value)} />
      <input value={password} onChange={(e) => setPassword(e.target.value)} />
      <button type="submit">Connexion</button>
    </form>
  );
}
```

---

## 🗃️ Base de Données (Prisma)

### Schéma principal (prisma/schema.prisma)

```prisma
model User {
  id            String   @id @default(uuid())
  phone         String   @unique
  firstName     String
  lastName      String
  role          UserRole @default(CLIENT)

  // Relations
  jobs          Job[]    @relation("ClientJobs")
  applications  Application[]
}

model Job {
  id          String    @id @default(uuid())
  title       String
  description String
  status      JobStatus @default(OPEN)

  // Relations
  clientId    String
  client      User      @relation("ClientJobs", fields: [clientId], references: [id])
  applications Application[]
}
```

### Commandes Prisma utiles

```bash
# Voir la base de données visuellement
pnpm exec prisma studio

# Générer le client après modification du schema
pnpm exec prisma generate

# Appliquer les changements à la DB
pnpm exec prisma db push

# Créer une migration (production)
pnpm exec prisma migrate dev --name nom_migration
```

---

## 🔐 Authentification

### Flux d'inscription

```
1. Utilisateur entre son téléphone
   ↓
2. POST /auth/send-otp → Envoie SMS (ou log en dev)
   ↓
3. Utilisateur entre le code OTP
   ↓
4. POST /auth/verify-otp → Retourne un token temporaire
   ↓
5. Utilisateur remplit son profil
   ↓
6. POST /auth/register → Crée le compte, retourne JWT
   ↓
7. JWT stocké dans localStorage
```

### Comment fonctionne JWT ?

```
┌─────────────────┐
│  Access Token   │  Durée: 15 min, utilisé pour les requêtes
└─────────────────┘
┌─────────────────┐
│ Refresh Token   │  Durée: 7 jours, pour renouveler l'access
└─────────────────┘
```

### Protection des routes

```typescript
// Dans le controller
@UseGuards(JwtAuthGuard)  // Route protégée
@Get('me')
async getMe(@Request() req) {
  return req.user;  // L'utilisateur est injecté par le guard
}
```

---

## 💬 Chat en Temps Réel

### Architecture Socket.io

```
Client A                 Serveur                 Client B
   │                        │                        │
   │── join_conversation ──→│                        │
   │                        │←── join_conversation ──│
   │                        │                        │
   │── send_message ───────→│                        │
   │                        │── new_message ────────→│
   │                        │                        │
```

### Code serveur (messages.gateway.ts)

```typescript
@SubscribeMessage('send_message')
async handleSendMessage(client: Socket, payload: { conversationId: string; content: string }) {
  // Sauvegarder en DB
  const message = await this.messagesService.sendMessage(...);

  // Envoyer à tous les participants
  this.server.to(`conversation:${payload.conversationId}`).emit('new_message', message);
}
```

---

## 🎨 Styles avec Tailwind

### Classes utilitaires

```html
<!-- Avant (CSS classique) -->
<button class="submit-btn">Envoyer</button>
<style>
.submit-btn {
  background-color: #E63946;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
}
</style>

<!-- Après (Tailwind) -->
<button class="bg-primary text-white py-3 px-6 rounded-lg">
  Envoyer
</button>
```

### Classes personnalisées (globals.css)

```css
@layer components {
  .btn-primary {
    @apply bg-primary text-white py-3 px-6 rounded-lg hover:bg-primary-600;
  }

  .card {
    @apply bg-white rounded-xl p-6 shadow-sm;
  }
}
```

### Couleurs du thème (tailwind.config.ts)

```typescript
colors: {
  primary: '#E63946',    // Rouge - boutons, liens
  secondary: '#1D3557',  // Bleu nuit - texte
  accent: '#F4A261',     // Orange - highlights
}
```

---

## 📝 Comment Ajouter une Fonctionnalité

### Exemple : Ajouter un système de favoris

#### 1. Modifier le schéma Prisma

```prisma
// prisma/schema.prisma
model Favorite {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  helperId  String
  helper    User     @relation("FavoriteHelpers", fields: [helperId], references: [id])
  createdAt DateTime @default(now())

  @@unique([userId, helperId])
}
```

```bash
cd apps/api
pnpm exec prisma db push
pnpm exec prisma generate
```

#### 2. Créer le module backend

```bash
# Créer les fichiers
mkdir -p src/modules/favorites
touch src/modules/favorites/favorites.module.ts
touch src/modules/favorites/favorites.service.ts
touch src/modules/favorites/favorites.controller.ts
```

```typescript
// favorites.service.ts
@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async addFavorite(userId: string, helperId: string) {
    return this.prisma.favorite.create({
      data: { userId, helperId },
    });
  }

  async removeFavorite(userId: string, helperId: string) {
    return this.prisma.favorite.delete({
      where: { userId_helperId: { userId, helperId } },
    });
  }

  async getUserFavorites(userId: string) {
    return this.prisma.favorite.findMany({
      where: { userId },
      include: { helper: true },
    });
  }
}
```

#### 3. Ajouter au module principal

```typescript
// app.module.ts
import { FavoritesModule } from './modules/favorites/favorites.module';

@Module({
  imports: [
    // ... autres modules
    FavoritesModule,
  ],
})
export class AppModule {}
```

#### 4. Créer le composant frontend

```typescript
// lib/api.ts
export const favoritesApi = {
  add: (helperId: string) => api.post(`/favorites/${helperId}`),
  remove: (helperId: string) => api.delete(`/favorites/${helperId}`),
  getAll: () => api.get('/favorites'),
};
```

---

## 🧪 Tester les Modifications

### Tester l'API avec Swagger

1. Ouvrez http://localhost:3001/docs
2. Cliquez sur un endpoint
3. Cliquez "Try it out"
4. Remplissez les paramètres
5. Cliquez "Execute"

### Tester avec curl

```bash
# Tester les catégories
curl http://localhost:3001/api/v1/categories

# Tester l'envoi d'OTP
curl -X POST http://localhost:3001/api/v1/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+212612345678", "purpose": "registration"}'
```

### Voir les logs

Les erreurs s'affichent dans le terminal où tourne `pnpm dev:api`.

---

## 📂 Fichiers Importants à Connaître

| Fichier | Rôle | Quand le modifier |
|---------|------|-------------------|
| `prisma/schema.prisma` | Structure DB | Nouvelle table/colonne |
| `apps/api/src/app.module.ts` | Modules API | Nouveau module |
| `apps/web/src/lib/api.ts` | Client API | Nouvel endpoint |
| `apps/web/src/store/auth.ts` | État auth | Modifier l'auth |
| `packages/shared/src/types/` | Types TS | Nouveaux types |
| `packages/shared/src/constants/` | Constantes | Nouvelles villes/catégories |
| `tailwind.config.ts` | Styles | Nouvelles couleurs |

---

## 🔗 Ressources pour Apprendre

### Documentation officielle

- **NestJS** : https://docs.nestjs.com
- **Prisma** : https://www.prisma.io/docs
- **Next.js** : https://nextjs.org/docs
- **Tailwind** : https://tailwindcss.com/docs
- **React Native** : https://reactnative.dev
- **Expo** : https://docs.expo.dev

### Tutoriels recommandés

- NestJS Crash Course (YouTube)
- Prisma in 100 Seconds (Fireship)
- Next.js 14 Tutorial (Vercel)
- Tailwind CSS Full Course

---

## ❓ FAQ Développeur

### Comment ajouter une nouvelle page web ?

Créez un fichier dans `apps/web/src/app/` :
```
apps/web/src/app/ma-page/page.tsx → accessible sur /ma-page
```

### Comment ajouter un nouvel endpoint API ?

1. Créez le service et controller dans le module concerné
2. Ou créez un nouveau module si c'est une nouvelle fonctionnalité

### Comment modifier la base de données ?

1. Modifiez `prisma/schema.prisma`
2. Exécutez `pnpm exec prisma db push`
3. Exécutez `pnpm exec prisma generate`

### Comment ajouter une nouvelle dépendance ?

```bash
# Pour le backend
cd apps/api && pnpm add nom-package

# Pour le web
cd apps/web && pnpm add nom-package

# Pour le mobile
cd apps/mobile && pnpm add nom-package

# Pour le package partagé
cd packages/shared && pnpm add nom-package
```

### Comment débugger ?

1. Regardez les logs dans le terminal
2. Utilisez `console.log()` temporairement
3. Utilisez les DevTools du navigateur (F12)
4. Utilisez Prisma Studio pour voir les données
