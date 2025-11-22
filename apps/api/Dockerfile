# ================================
# API Dockerfile - Khedma Backend
# ================================

# Development stage (Debian-based to support Prisma native engines)
FROM node:18-bullseye-slim AS development

WORKDIR /app

# Install packages required by Prisma (libssl) and common build tools
RUN apt-get update && \
	apt-get install -y --no-install-recommends \
	ca-certificates \
	openssl \
	libssl1.1 \
	build-essential \
	python3 \
	&& rm -rf /var/lib/apt/lists/*

# Install pnpm
RUN npm install -g pnpm@8.15.0

# Copy workspace configuration
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY turbo.json ./

# Copy package.json files for all workspaces
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/api ./apps/api
COPY packages/shared ./packages/shared

# Generate Prisma client
WORKDIR /app/apps/api
RUN pnpm exec prisma generate

EXPOSE 3001

CMD ["pnpm", "dev"]

# ================================
# Production build stage
# ================================
FROM node:18-bullseye-slim AS builder

WORKDIR /app

# Install packages required by Prisma (libssl) and common build tools
RUN apt-get update && \
	apt-get install -y --no-install-recommends \
	ca-certificates \
	openssl \
	libssl1.1 \
	build-essential \
	python3 \
	&& rm -rf /var/lib/apt/lists/*

RUN npm install -g pnpm@8.15.0

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/

RUN pnpm install --frozen-lockfile

COPY apps/api ./apps/api
COPY packages/shared ./packages/shared

WORKDIR /app/apps/api
RUN pnpm exec prisma generate
RUN pnpm build

# ================================
# Production stage
# ================================
FROM node:18-bullseye-slim AS production

WORKDIR /app

# Install libssl runtime for production image
RUN apt-get update && \
	apt-get install -y --no-install-recommends \
	ca-certificates \
	libssl1.1 \
	&& rm -rf /var/lib/apt/lists/*

RUN npm install -g pnpm@8.15.0

# Copy built application
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./
COPY --from=builder /app/apps/api/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules

# Generate Prisma client for production
RUN pnpm exec prisma generate

EXPOSE 3001

CMD ["node", "dist/main.js"]
