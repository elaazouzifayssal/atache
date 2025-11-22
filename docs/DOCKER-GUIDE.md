# Docker Guide - Khedma Development Environment

This guide explains how to use Docker to run the Khedma project. Docker simplifies setup by containerizing all services.

---

## Prerequisites

### Install Docker Desktop

**macOS:**
```bash
# Using Homebrew
brew install --cask docker

# Or download from https://www.docker.com/products/docker-desktop
```

**Windows:**
- Download Docker Desktop from https://www.docker.com/products/docker-desktop
- Enable WSL 2 during installation

**Linux:**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install docker.io docker-compose-plugin
sudo usermod -aG docker $USER
# Log out and back in
```

### Verify Installation

```bash
docker --version        # Docker version 24.x or higher
docker compose version  # Docker Compose version v2.x
```

---

## Quick Start

### 1. Start All Services

```bash
# From project root
docker compose up
```

This starts:
- **PostgreSQL** on port 5432
- **API** on http://localhost:3001
- **Web** on http://localhost:3000
- **Adminer** (DB UI) on http://localhost:8080

### 2. Run in Background

```bash
docker compose up -d
```

### 3. View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f api
docker compose logs -f web
```

### 4. Stop Services

```bash
# Stop but keep containers
docker compose stop

# Stop and remove containers
docker compose down

# Stop and remove everything (including volumes)
docker compose down -v
```

---

## Services Overview

| Service | URL | Description |
|---------|-----|-------------|
| **web** | http://localhost:3000 | Next.js frontend |
| **api** | http://localhost:3001 | NestJS backend |
| **api/docs** | http://localhost:3001/docs | Swagger API docs |
| **postgres** | localhost:5432 | PostgreSQL database |
| **adminer** | http://localhost:8080 | Database management UI |

### Adminer Login

- **System:** PostgreSQL
- **Server:** postgres
- **Username:** khedma
- **Password:** khedma_password
- **Database:** khedma

---

## Development Workflow

### Hot Reloading

Source code is mounted as volumes, so changes are reflected immediately:
- `apps/api/src/` → API hot reload
- `apps/web/src/` → Web hot reload
- `packages/shared/src/` → Shared package

### Run Commands in Containers

```bash
# Open shell in API container
docker compose exec api sh

# Run Prisma commands
docker compose exec api pnpm exec prisma studio
docker compose exec api pnpm exec prisma db push
docker compose exec api pnpm exec prisma migrate dev --name my_migration

# Run commands in web container
docker compose exec web sh
```

### Rebuild After Dependency Changes

```bash
# Rebuild specific service
docker compose build api
docker compose build web

# Rebuild and restart
docker compose up --build
```

---

## Database Management

### Access Database

```bash
# Using psql in container
docker compose exec postgres psql -U khedma -d khedma

# Common commands
\dt          # List tables
\d users     # Describe users table
\q           # Quit
```

### Reset Database

```bash
# Drop and recreate
docker compose down -v
docker compose up
```

### Seed Database

```bash
docker compose exec api pnpm exec prisma db seed
```

### Backup Database

```bash
# Create backup
docker compose exec postgres pg_dump -U khedma khedma > backup.sql

# Restore backup
cat backup.sql | docker compose exec -T postgres psql -U khedma -d khedma
```

---

## Troubleshooting

### Port Already in Use

```bash
# Find what's using the port
lsof -i :3000
lsof -i :3001
lsof -i :5432

# Kill the process or change ports in docker-compose.yml
```

### Container Won't Start

```bash
# Check logs
docker compose logs api
docker compose logs web

# Rebuild from scratch
docker compose down -v
docker compose build --no-cache
docker compose up
```

### Database Connection Failed

```bash
# Check if postgres is healthy
docker compose ps

# Wait for postgres to be ready
docker compose up -d postgres
sleep 10
docker compose up
```

### Permission Denied

```bash
# On Linux, you may need to run
sudo chown -R $USER:$USER .
```

### Clear Docker Cache

```bash
# Remove unused images and containers
docker system prune

# Remove everything (careful!)
docker system prune -a --volumes
```

---

## Production Deployment

### Build Production Images

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml build
```

### Run Production

Create a `.env.production` file:
```env
DATABASE_URL=postgresql://user:password@host:5432/khedma
JWT_SECRET=your-super-secret-jwt-key
NEXT_PUBLIC_API_URL=https://api.khedma.ma/api/v1
POSTGRES_PASSWORD=strong_password_here
```

Run with production config:
```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.production up -d
```

---

## Useful Commands Reference

```bash
# Start services
docker compose up                    # Start all (foreground)
docker compose up -d                 # Start all (background)
docker compose up api web           # Start specific services

# Stop services
docker compose stop                  # Stop all
docker compose down                  # Stop and remove containers
docker compose down -v               # Also remove volumes

# Logs
docker compose logs                  # All logs
docker compose logs -f api           # Follow API logs
docker compose logs --tail=100 web   # Last 100 lines

# Execute commands
docker compose exec api sh           # Shell into API
docker compose exec postgres psql -U khedma  # PostgreSQL shell

# Build
docker compose build                 # Build all
docker compose build --no-cache api  # Rebuild API without cache
docker compose up --build            # Build and start

# Status
docker compose ps                    # List containers
docker compose top                   # Running processes
```

---

## Switching Between Docker and Local

### Use Docker
```bash
docker compose up
```

### Use Local (stop Docker first)
```bash
docker compose down
pnpm dev
```

**Note:** When switching, ensure the database URL is correct:
- Docker: `postgresql://khedma:khedma_password@postgres:5432/khedma`
- Local: `postgresql://your_user:@localhost:5432/khedma`

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Docker Network                         │
│                                                             │
│  ┌──────────┐    ┌──────────┐    ┌──────────────────────┐  │
│  │   Web    │───→│   API    │───→│     PostgreSQL       │  │
│  │  :3000   │    │  :3001   │    │       :5432          │  │
│  └──────────┘    └──────────┘    └──────────────────────┘  │
│                                              ↑              │
│                                   ┌──────────┴───────────┐  │
│                                   │      Adminer         │  │
│                                   │       :8080          │  │
│                                   └──────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
         ↓              ↓                      ↓
      Volumes        Volumes               Volume
   (hot reload)   (hot reload)        (persistent data)
```

---

## FAQ

### Q: Do I need to install Node.js locally?
**A:** No! Docker containers have Node.js. But for IDE features (TypeScript, ESLint), local Node.js is recommended.

### Q: Do I need PostgreSQL locally?
**A:** No! PostgreSQL runs in a Docker container.

### Q: Can I use both Docker and local development?
**A:** Yes, but not simultaneously (port conflicts). Stop one before starting the other.

### Q: Where is the database data stored?
**A:** In a Docker volume named `personalproject_postgres_data`. It persists between restarts.

### Q: How do I update Docker images?
**A:** Run `docker compose build` after changing Dockerfiles or dependencies.
