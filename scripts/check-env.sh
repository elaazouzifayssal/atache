#!/bin/bash

echo "🔍 Vérification de l'environnement Khedma..."
echo ""

ERRORS=0

# Node.js
if command -v node &> /dev/null; then
  NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
  if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js doit être >= 18 (actuel: $(node --version))"
    ERRORS=$((ERRORS + 1))
  else
    echo "✅ Node.js: $(node --version)"
  fi
else
  echo "❌ Node.js non installé"
  ERRORS=$((ERRORS + 1))
fi

# pnpm
if command -v pnpm &> /dev/null; then
  PNPM_VERSION=$(pnpm --version | cut -d'.' -f1)
  if [ "$PNPM_VERSION" -lt 8 ]; then
    echo "❌ pnpm doit être >= 8 (actuel: $(pnpm --version))"
    ERRORS=$((ERRORS + 1))
  else
    echo "✅ pnpm: $(pnpm --version)"
  fi
else
  echo "❌ pnpm non installé"
  echo "   → Installer avec: npm install -g pnpm"
  ERRORS=$((ERRORS + 1))
fi

# PostgreSQL
if command -v psql &> /dev/null; then
  echo "✅ PostgreSQL: $(psql --version | head -1)"
elif [ -f /opt/homebrew/opt/postgresql@16/bin/psql ]; then
  echo "✅ PostgreSQL: $(/opt/homebrew/opt/postgresql@16/bin/psql --version | head -1)"
  echo "   ⚠️  Ajouter au PATH: export PATH=\"/opt/homebrew/opt/postgresql@16/bin:\$PATH\""
else
  echo "❌ PostgreSQL non installé"
  echo "   → Installer avec: brew install postgresql@16"
  ERRORS=$((ERRORS + 1))
fi

# Git
if command -v git &> /dev/null; then
  echo "✅ Git: $(git --version)"
else
  echo "❌ Git non installé"
  ERRORS=$((ERRORS + 1))
fi

# Check if in project directory
if [ -f "package.json" ]; then
  echo "✅ Dans le dossier du projet"
else
  echo "⚠️  Pas dans le dossier du projet"
fi

# Check node_modules
if [ -d "node_modules" ]; then
  echo "✅ Dépendances installées"
else
  echo "⚠️  Dépendances non installées"
  echo "   → Exécuter: pnpm install"
fi

# Check .env file
if [ -f "apps/api/.env" ]; then
  echo "✅ Fichier .env présent"
else
  echo "⚠️  Fichier .env manquant"
  echo "   → Copier: cp apps/api/.env.example apps/api/.env"
fi

echo ""
if [ $ERRORS -eq 0 ]; then
  echo "🎉 Environnement OK! Vous pouvez lancer: pnpm dev"
else
  echo "⚠️  $ERRORS problème(s) détecté(s). Corrigez-les avant de continuer."
  exit 1
fi
