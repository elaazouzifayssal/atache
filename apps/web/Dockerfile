# ================================
# Web Dockerfile - Khedma Frontend
# ================================

# Development stage
FROM node:18-alpine AS development

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@8.15.0

# Copy workspace configuration
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY turbo.json ./

# Copy package.json files for all workspaces
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/web ./apps/web
COPY packages/shared ./packages/shared

WORKDIR /app/apps/web

EXPOSE 3000

CMD ["pnpm", "dev"]

# ================================
# Production build stage
# ================================
FROM node:18-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm@8.15.0

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY turbo.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/

RUN pnpm install --frozen-lockfile

COPY apps/web ./apps/web
COPY packages/shared ./packages/shared

WORKDIR /app/apps/web

# Build arguments for environment variables
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN pnpm build

# ================================
# Production stage
# ================================
FROM node:18-alpine AS production

WORKDIR /app

RUN npm install -g pnpm@8.15.0

# Copy built application
COPY --from=builder /app/apps/web/.next ./.next
COPY --from=builder /app/apps/web/public ./public
COPY --from=builder /app/apps/web/package.json ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["pnpm", "start"]
