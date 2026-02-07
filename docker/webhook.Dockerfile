FROM node:20-alpine

WORKDIR /app

# Copy all files
COPY package*.json ./
COPY turbo.json ./
COPY packages ./packages
COPY apps/bank-webhook ./apps/bank-webhook

# Install dependencies, generate Prisma client, build database package, and build app
RUN npm ci && \
    cd packages/database && \
    npx prisma generate && \
    npm run build && \
    cd /app/apps/bank-webhook && \
    npm run build

# Set up user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

USER nestjs

WORKDIR /app/apps/bank-webhook

EXPOSE 3001

CMD ["node", "dist/main.js"]

