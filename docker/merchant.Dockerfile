FROM node:20-alpine

WORKDIR /app

# Copy all files
COPY package*.json ./
COPY turbo.json ./
COPY packages ./packages
COPY apps/merchant-app ./apps/merchant-app

# Install dependencies, generate Prisma client, build database package, and build app
RUN npm ci && \
    cd packages/database && \
    npx prisma generate && \
    npm run build && \
    cd /app/apps/merchant-app && \
    npm run build

# Set up user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    chown -R nextjs:nodejs /app/apps/merchant-app/.next

USER nextjs

WORKDIR /app

EXPOSE 3002

ENV PORT=3002
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/merchant-app/.next/standalone/apps/merchant-app/server.js"]

