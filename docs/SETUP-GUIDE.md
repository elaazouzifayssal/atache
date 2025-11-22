# 🚀 Guide d'Installation pour Débutants

Ce guide vous accompagne pas à pas pour installer et lancer l'application Khedma sur votre ordinateur.

---

## 📋 Prérequis

Avant de commencer, vous devez installer ces outils sur votre Mac :

### 1. Homebrew (Gestionnaire de paquets Mac)

Ouvrez le **Terminal** (cherchez "Terminal" dans Spotlight avec Cmd+Space) et collez :

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Suivez les instructions à l'écran. À la fin, exécutez les commandes affichées pour ajouter Homebrew au PATH.

### 2. Node.js (JavaScript runtime)

```bash
brew install node
```

Vérifiez l'installation :
```bash
node --version   # Doit afficher v18 ou plus
npm --version    # Doit afficher un numéro
```

### 3. pnpm (Gestionnaire de paquets rapide)

```bash
npm install -g pnpm
```

Vérifiez :
```bash
pnpm --version   # Doit afficher 8.x ou plus
```

### 4. PostgreSQL (Base de données)

```bash
brew install postgresql@16
brew services start postgresql@16
```

Ajoutez PostgreSQL au PATH :
```bash
echo 'export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

Vérifiez :
```bash
psql --version   # Doit afficher PostgreSQL 16.x
```

### 5. Git (Contrôle de version)

```bash
brew install git
```

### 6. VS Code (Éditeur de code) - Recommandé

Téléchargez depuis : https://code.visualstudio.com/

---

## 📥 Récupérer le Code

### Option A : Cloner depuis GitHub

```bash
# Allez dans votre dossier de projets
cd ~/Desktop

# Clonez le repo
git clone https://github.com/elaazouzifayssal/atache.git

# Entrez dans le dossier
cd atache
```

### Option B : Si vous avez déjà le dossier

```bash
cd ~/Desktop/personalProject
```

---

## ⚙️ Configuration

### 1. Installer les dépendances

```bash
pnpm install
```

Attendez que tout s'installe (peut prendre 1-2 minutes).

### 2. Créer la base de données

```bash
# Créer la base de données "khedma"
/opt/homebrew/opt/postgresql@16/bin/createdb khedma
```

### 3. Configurer les variables d'environnement

Le fichier `.env` existe déjà dans `apps/api/`. Si vous devez le recréer :

```bash
cp apps/api/.env.example apps/api/.env
```

Éditez le fichier `apps/api/.env` :
```bash
# Ouvrez avec VS Code
code apps/api/.env
```

Modifiez `DATABASE_URL` avec votre nom d'utilisateur Mac :
```
DATABASE_URL="postgresql://VOTRE_NOM_MAC:@localhost:5432/khedma"
```

Pour trouver votre nom d'utilisateur Mac :
```bash
whoami
```

### 4. Initialiser la base de données

```bash
# Générer le client Prisma
cd apps/api
pnpm exec prisma generate

# Créer les tables dans la base de données
pnpm exec prisma db push

# Ajouter les données initiales (catégories)
pnpm exec ts-node prisma/seed.ts

# Revenir à la racine
cd ../..
```

---

## 🎮 Lancer l'Application

### Lancer tous les serveurs en même temps

```bash
pnpm dev
```

### Ou lancer séparément (3 terminaux différents)

**Terminal 1 - API Backend :**
```bash
pnpm dev:api
```

**Terminal 2 - Site Web :**
```bash
pnpm dev:web
```

**Terminal 3 - Application Mobile :**
```bash
pnpm dev:mobile
```

---

## 🌐 Accéder à l'Application

Une fois lancée, ouvrez votre navigateur :

| Application | URL | Description |
|-------------|-----|-------------|
| **Site Web** | http://localhost:3000 | Interface utilisateur |
| **API Docs** | http://localhost:3001/docs | Documentation Swagger |
| **Prisma Studio** | `pnpm exec prisma studio` | Voir la base de données |

---

## 📱 Tester l'Application Mobile

1. Installez l'app **Expo Go** sur votre téléphone (App Store / Play Store)

2. Lancez le serveur mobile :
```bash
pnpm dev:mobile
```

3. Scannez le QR code affiché avec :
   - **iPhone** : Caméra native
   - **Android** : App Expo Go

---

## 🧪 Tester l'Inscription

1. Allez sur http://localhost:3000/register
2. Entrez un numéro de téléphone (ex: 0612345678)
3. **Important** : Le code OTP s'affiche dans le terminal de l'API !
   - Cherchez : `OTP for +212612345678: 123456`
4. Entrez ce code
5. Créez votre mot de passe et profil

---

## 🛑 Arrêter l'Application

- Dans le terminal : appuyez sur `Ctrl + C`
- Ou fermez les fenêtres de terminal

---

## 🔄 Commandes Utiles

```bash
# Voir l'état de la base de données
cd apps/api && pnpm exec prisma studio

# Réinitialiser la base de données (ATTENTION: efface tout!)
cd apps/api && pnpm exec prisma db push --force-reset

# Mettre à jour les dépendances
pnpm install

# Voir les logs de l'API
pnpm dev:api

# Formater le code
pnpm format
```

---

## ❓ Problèmes Fréquents

### "command not found: pnpm"
```bash
npm install -g pnpm
source ~/.zshrc
```

### "psql: command not found"
```bash
echo 'export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### "connection refused" ou erreur de base de données
```bash
# Vérifier que PostgreSQL tourne
brew services list

# Le redémarrer si nécessaire
brew services restart postgresql@16
```

### "ENOENT" ou fichier non trouvé
```bash
# Réinstaller les dépendances
rm -rf node_modules
pnpm install
```

### Port déjà utilisé
```bash
# Trouver et tuer le processus sur le port 3000
lsof -i :3000
kill -9 <PID>

# Ou pour le port 3001
lsof -i :3001
kill -9 <PID>
```

---

## 📞 Besoin d'Aide ?

1. Vérifiez d'abord cette documentation
2. Cherchez l'erreur sur Google
3. Demandez dans le groupe de l'équipe

---

## ✅ Checklist de Vérification

Avant de dire "ça marche", vérifiez :

- [ ] `pnpm --version` affiche un numéro
- [ ] `node --version` affiche v18+
- [ ] `psql --version` affiche PostgreSQL 16
- [ ] http://localhost:3000 affiche le site Khedma
- [ ] http://localhost:3001/docs affiche la doc Swagger
- [ ] Vous pouvez créer un compte test
