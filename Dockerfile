# ==============================================================================
# APIWatch Production Multi-Stage Dockerfile
# Optimized for Next.js 16 (Turbopack standalone) and Node.js Background Worker
# ==============================================================================

# ------------------------------------------------------------------------------
# 1. Base Image
# ------------------------------------------------------------------------------
FROM node:22-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
ENV NODE_ENV=production

# ------------------------------------------------------------------------------
# 2. Dependencies
# ------------------------------------------------------------------------------
FROM base AS deps
WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Install full dependencies for building
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# ------------------------------------------------------------------------------
# 3. Builder
# ------------------------------------------------------------------------------
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Ensure Prisma Client is available
RUN npx prisma generate

# Build Next.js application (standalone bundle)
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ------------------------------------------------------------------------------
# 4. Web Runner (Next.js Standalone)
# ------------------------------------------------------------------------------
FROM base AS web-runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone build and static assets
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

USER nextjs

EXPOSE 3000

# Container healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/robots.txt || exit 1

CMD ["node", "server.js"]

# ------------------------------------------------------------------------------
# 5. Worker Runner (API Monitoring Background Engine)
# ------------------------------------------------------------------------------
FROM base AS worker-runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 workerjs

# Copy runtime code and dependencies
COPY --from=builder --chown=workerjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=workerjs:nodejs /app/tsconfig.json ./tsconfig.json
COPY --from=builder --chown=workerjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=workerjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=workerjs:nodejs /app/worker ./worker
COPY --from=builder --chown=workerjs:nodejs /app/src ./src

USER workerjs

# Container healthcheck (process status)
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD ps aux | grep -v grep | grep tsx || exit 1

CMD ["npx", "tsx", "worker/src/index.ts"]
