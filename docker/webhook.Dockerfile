FROM node:20-alpine

WORKDIR /app

# Copy all files
COPY package*.json ./
COPY turbo.json ./
COPY packages ./packages
COPY apps/bank-webhook ./apps/bank-webhook

# Install dependencies, generate Prisma client, then build workspace deps and
# the app via Turbo. Turbo's ^build ordering compiles @repo/contracts and
# @repo/database (both resolve from their built dist/) before bank-webhook.
RUN npm ci && \
    cd packages/database && \
    npx prisma generate && \
    cd /app && \
    npx turbo build --filter=bank-webhooks

# Set up user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

USER nestjs

WORKDIR /app/apps/bank-webhook

EXPOSE 3001

CMD ["node", "dist/main.js"]

