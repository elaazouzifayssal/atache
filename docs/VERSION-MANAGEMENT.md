# 📦 Gestion des Versions et Dépendances

Ce guide explique comment gérer les versions des outils, dépendances et plateformes.

---

## 🔒 Versions Actuelles du Projet

### Outils Requis

| Outil | Version Minimum | Commande de vérification |
|-------|-----------------|--------------------------|
| Node.js | 18.0.0+ | `node --version` |
| pnpm | 8.15.0+ | `pnpm --version` |
| PostgreSQL | 16.x | `psql --version` |

### Versions des Frameworks

| Package | Version | Fichier |
|---------|---------|---------|
| NestJS | 10.3.x | `apps/api/package.json` |
| Next.js | 14.1.x | `apps/web/package.json` |
| Expo | 50.x | `apps/mobile/package.json` |
| React | 18.2.x | Tous |
| Prisma | 5.8.x | `apps/api/package.json` |
| TypeScript | 5.3.x | Racine `package.json` |

---

## 📋 Fichiers de Configuration des Versions

### 1. package.json (Racine)

```json
{
  "engines": {
    "node": ">=18.0.0"
  },
  "packageManager": "pnpm@8.15.0"
}
```

**Signification :**
- `engines.node` : Version minimum de Node.js requise
- `packageManager` : Version exacte de pnpm à utiliser

### 2. .nvmrc (Optionnel - pour NVM)

Créez ce fichier à la racine pour que les membres de l'équipe utilisent la même version de Node :

```bash
echo "18.19.0" > .nvmrc
```

Utilisation :
```bash
nvm use  # Utilise automatiquement la version du fichier
```

### 3. pnpm-lock.yaml

**NE JAMAIS SUPPRIMER CE FICHIER !**

Ce fichier verrouille les versions exactes de toutes les dépendances. Il garantit que tout le monde a les mêmes versions.

---

## 🎯 Bonnes Pratiques de Versioning

### Symboles dans package.json

```json
{
  "dependencies": {
    "exact": "1.2.3",        // Version exacte
    "caret": "^1.2.3",       // 1.x.x (minor + patch)
    "tilde": "~1.2.3",       // 1.2.x (patch seulement)
    "latest": "*"            // ⚠️ ÉVITER - instable
  }
}
```

**Recommandation pour ce projet :**
- Utiliser `^` (caret) pour la plupart des packages
- Utiliser version exacte pour les packages critiques (Prisma, Next.js)

### Exemple Actuel

```json
// apps/api/package.json
{
  "dependencies": {
    "@nestjs/core": "^10.3.0",     // Accepte 10.3.x, 10.4.x, etc.
    "@prisma/client": "^5.8.0",    // Accepte 5.8.x, 5.9.x, etc.
    "next": "14.1.0"               // Version exacte
  }
}
```

---

## 🔄 Mettre à Jour les Dépendances

### Voir les mises à jour disponibles

```bash
# Voir toutes les mises à jour possibles
pnpm outdated

# Pour un package spécifique
pnpm outdated next
```

### Mettre à jour de manière sécurisée

```bash
# Mettre à jour les patches (sûr)
pnpm update

# Mettre à jour un package spécifique
pnpm update next

# Mettre à jour vers la dernière version (attention!)
pnpm update next --latest
```

### Processus recommandé pour les mises à jour majeures

1. **Créer une branche**
```bash
git checkout -b update/nestjs-11
```

2. **Mettre à jour**
```bash
pnpm update @nestjs/core @nestjs/common --latest
```

3. **Tester**
```bash
pnpm dev
# Tester toutes les fonctionnalités
```

4. **Commit si OK**
```bash
git add .
git commit -m "Update NestJS to v11"
git push
```

---

## 🛡️ Éviter les Problèmes de Version

### 1. Toujours committer pnpm-lock.yaml

```bash
git add pnpm-lock.yaml
git commit -m "Update lock file"
```

### 2. Utiliser les mêmes versions Node.js

Ajoutez dans votre `~/.zshrc` :
```bash
# Charger automatiquement la version Node du projet
autoload -U add-zsh-hook
load-nvmrc() {
  if [ -f .nvmrc ]; then
    nvm use
  fi
}
add-zsh-hook chpwd load-nvmrc
```

### 3. Installer avec --frozen-lockfile en CI/CD

```bash
# En production/CI, utiliser :
pnpm install --frozen-lockfile
```

Cela échoue si le lock file n'est pas à jour.

---

## 📱 Versions pour les Plateformes Mobiles

### iOS (apps/mobile/app.json)

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.khedma.app",
      "buildNumber": "1.0.0",
      "supportsTablet": true
    }
  }
}
```

### Android (apps/mobile/app.json)

```json
{
  "expo": {
    "android": {
      "package": "com.khedma.app",
      "versionCode": 1
    }
  }
}
```

### Gérer les versions de l'app

Pour chaque release :
1. Mettre à jour `version` dans `app.json`
2. Mettre à jour `buildNumber` (iOS) et `versionCode` (Android)

```json
{
  "expo": {
    "version": "1.0.1",
    "ios": {
      "buildNumber": "1.0.1"
    },
    "android": {
      "versionCode": 2
    }
  }
}
```

---

## 🔧 Résolution des Conflits de Version

### Erreur : "Peer dependency not met"

```bash
# Voir les problèmes
pnpm install

# Si warnings de peer dependencies, ajouter dans package.json :
{
  "pnpm": {
    "peerDependencyRules": {
      "allowedVersions": {
        "react": "18"
      }
    }
  }
}
```

### Erreur : "Version mismatch"

```bash
# Supprimer et réinstaller
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

### Erreur : "Cannot find module"

```bash
# Régénérer les modules
pnpm install --force
```

---

## 📊 Script de Vérification des Versions

Ajoutez ce script pour vérifier que l'environnement est correct :

```bash
# scripts/check-versions.sh
#!/bin/bash

echo "🔍 Vérification des versions..."

# Node.js
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "❌ Node.js doit être >= 18 (actuel: $(node --version))"
  exit 1
fi
echo "✅ Node.js: $(node --version)"

# pnpm
PNPM_VERSION=$(pnpm --version | cut -d'.' -f1)
if [ "$PNPM_VERSION" -lt 8 ]; then
  echo "❌ pnpm doit être >= 8 (actuel: $(pnpm --version))"
  exit 1
fi
echo "✅ pnpm: $(pnpm --version)"

# PostgreSQL
if command -v psql &> /dev/null; then
  echo "✅ PostgreSQL: $(psql --version)"
else
  echo "⚠️  PostgreSQL non trouvé dans PATH"
fi

echo ""
echo "🎉 Environnement OK!"
```

Rendez-le exécutable :
```bash
chmod +x scripts/check-versions.sh
```

---

## 📅 Politique de Mise à Jour

### Fréquence recommandée

| Type | Fréquence | Exemple |
|------|-----------|---------|
| Patches (x.x.PATCH) | Hebdomadaire | 5.8.0 → 5.8.1 |
| Minor (x.MINOR.x) | Mensuelle | 5.8.0 → 5.9.0 |
| Major (MAJOR.x.x) | Trimestrielle | 5.x → 6.x |

### Packages à surveiller

1. **Sécurité critique** - Mettre à jour immédiatement
   - `@nestjs/*`
   - `prisma`
   - `next`

2. **Important** - Mettre à jour mensuellement
   - `react`
   - `expo`
   - `typescript`

3. **Utilitaires** - Mettre à jour si nécessaire
   - `tailwindcss`
   - `eslint`

---

## 🔗 Outils Utiles

### Dependabot (GitHub)

Créez `.github/dependabot.yml` :

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    groups:
      dependencies:
        patterns:
          - "*"
```

### npm-check-updates

```bash
# Installer globalement
npm install -g npm-check-updates

# Voir les mises à jour
ncu

# Mettre à jour package.json
ncu -u
```

---

## ✅ Checklist Avant Commit

- [ ] `pnpm install` ne montre pas d'erreurs
- [ ] `pnpm dev` fonctionne
- [ ] `pnpm-lock.yaml` est inclus dans le commit
- [ ] Les tests passent (si configurés)
- [ ] Pas de `*` ou `latest` dans les versions
