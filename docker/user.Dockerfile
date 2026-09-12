# Build stage: install dependencies
FROM node:20-alpine AS deps
WORKDIR /app

COPY package*.json ./
COPY turbo.json ./
COPY packages ./packages
COPY apps ./apps

RUN npm ci

# Build stage: compile user-app via Turbo. Turbo respects the `^build` dep
# ordering, so @repo/ui, @repo/recoil, and @repo/database are built
# automatically before apps/user-app. DATABASE_URL is required by prisma
# generate (via packages/database/prisma.config.ts); a placeholder is fine
# because the build does not connect to a live database.
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
# package-lock.json is required: Turbopack auto-detects the project root by
# walking up from the app dir looking for a lockfile. Without it, `next build`
# fails with a Turbopack root-directory error.
COPY --from=deps /app/package*.json ./
COPY --from=deps /app/turbo.json ./turbo.json
COPY --from=deps /app/packages ./packages
COPY --from=deps /app/apps ./apps

ENV DATABASE_URL=postgresql://placeholder:placeholder@localhost:5432/placeholder
RUN npx turbo build --filter=user-app

# Set up node user for both builder and runner
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Runner stage: minimal image with only standalone output + static assets
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# The standalone server resolves `.next` relative to its own location
# (apps/user-app/server.js), so static assets and public/ MUST sit next to it.
COPY --from=builder --chown=nextjs:nodejs /app/apps/user-app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/user-app/.next/static ./apps/user-app/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/user-app/public ./apps/user-app/public

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "apps/user-app/server.js"]