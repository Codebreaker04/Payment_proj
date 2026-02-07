FROM node:20-alpine

WORKDIR /app

# Copy all files
COPY package*.json ./
COPY turbo.json ./
COPY packages ./packages
COPY apps/user-app ./apps/user-app

# Install dependencies, generate Prisma client, build database package, and build app
RUN npm ci && \
    cd packages/database && \
    npx prisma generate && \
    npm run build && \
    cd /app/apps/user-app && \
    npm run build

# Set up user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    chown -R nextjs:nodejs /app/apps/user-app/.next

USER nextjs

WORKDIR /app

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/user-app/.next/standalone/apps/user-app/server.js"]

