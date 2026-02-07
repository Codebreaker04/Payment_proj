# 🔧 Docker Issues Fixed

## ❌ Problems Found

### 1. **webhook.Dockerfile**
**Issues:**
- ❌ Using `npm install --filter` (wrong syntax for turbo monorepo)
- ❌ Not copying necessary workspace files
- ❌ Missing multi-stage build optimization
- ❌ No proper dependency caching

### 2. **user.Dockerfile**
**Issues:**
- ❌ Syntax error: `CMD [node"` (missing opening quote)
- ❌ Wrong path: Next.js doesn't output to `dist/main.js`
- ❌ Same npm install issues as webhook
- ❌ Not configured for Next.js standalone output

### 3. **merchant.Dockerfile**
**Issues:**
- ❌ **Empty file** - completely missing implementation

### 4. **docker-compose.yml**
**Issues:**
- ❌ Missing container names
- ❌ No network configuration
- ❌ Missing merchant-app service

## ✅ Solutions Applied

### 1. **Fixed webhook.Dockerfile**
```dockerfile
FROM node:20-alpine AS base

# Install dependencies stage
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy all necessary files
COPY package*.json ./
COPY turbo.json ./
COPY packages ./packages
COPY apps/bank-webhook ./apps/bank-webhook

# Install all dependencies
RUN npm ci

# Build stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY --from=deps /app/apps/bank-webhook ./apps/bank-webhook
COPY --from=deps /app/package*.json ./
COPY --from=deps /app/turbo.json ./

WORKDIR /app/apps/bank-webhook
RUN npm run build

# Production stage
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

COPY --from=builder /app/apps/bank-webhook/dist ./dist
COPY --from=builder /app/apps/bank-webhook/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/bank-webhook/package*.json ./

USER nestjs
EXPOSE 3001

CMD ["node", "dist/main.js"]
```

**What Changed:**
- ✅ Proper multi-stage build with deps, builder, runner
- ✅ Correct npm ci (installs from lockfile)
- ✅ Copies all workspace dependencies
- ✅ Proper layer caching for faster rebuilds
- ✅ Security: runs as non-root user

### 2. **Fixed user.Dockerfile**
```dockerfile
FROM node:20-alpine AS base

# ... similar deps stage ...

# Build stage builds Next.js app
WORKDIR /app/apps/user-app
RUN npm run build

# Production stage
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy Next.js standalone output
COPY --from=builder /app/apps/user-app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/user-app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/user-app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

**What Changed:**
- ✅ Fixed CMD syntax (was missing quote)
- ✅ Correct Next.js standalone output paths
- ✅ Updated next.config.js to enable standalone mode
- ✅ Proper file permissions with chown

### 3. **Created merchant.Dockerfile**
- ✅ Implemented complete Dockerfile (was empty)
- ✅ Same pattern as user.Dockerfile
- ✅ Configured for port 3002

### 4. **Updated docker-compose.yml**
```yaml
services:
  postgres:
    container_name: paypro-postgres
    networks:
      - paypro-network

  bank-webhook:
    container_name: paypro-bank-webhook
    dockerfile: docker/webhook.Dockerfile  # ✅ Correct path
    networks:
      - paypro-network

  user-app:
    container_name: paypro-user-app
    dockerfile: docker/user.Dockerfile
    networks:
      - paypro-network

  merchant-app:  # ✅ NEW SERVICE
    container_name: paypro-merchant-app
    dockerfile: docker/merchant.Dockerfile
    ports:
      - "3002:3002"
    networks:
      - paypro-network

networks:
  paypro-network:
    driver: bridge
```

**What Changed:**
- ✅ Added container names for easier management
- ✅ Added merchant-app service
- ✅ Created bridge network for inter-service communication
- ✅ Proper service dependencies

## 🚀 How to Use Fixed Docker Setup

### Build All Services
```bash
docker-compose build
```

### Start All Services
```bash
docker-compose up -d
```

### Check Status
```bash
docker-compose ps
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f bank-webhook
docker-compose logs -f user-app
docker-compose logs -f merchant-app
```

### Restart a Service
```bash
docker-compose restart bank-webhook
```

### Stop All Services
```bash
docker-compose down
```

### Clean Rebuild (if needed)
```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

## 📊 Service Ports

| Service | Port | URL |
|---------|------|-----|
| PostgreSQL | 5432 | localhost:5432 |
| Bank Webhook API | 3001 | http://localhost:3001 |
| User App | 3000 | http://localhost:3000 |
| Merchant App | 3002 | http://localhost:3002 |

## 🔍 Key Improvements

1. **Better Caching** - Dependencies layer cached separately
2. **Smaller Images** - Multi-stage builds reduce final image size
3. **Security** - Non-root users for all apps
4. **Network Isolation** - All services in same Docker network
5. **Proper Dependencies** - Turbo workspace dependencies included
6. **Production Ready** - Optimized builds with NODE_ENV=production

## 🧪 Testing

```bash
# Build (should complete without errors)
docker-compose build

# Start services
docker-compose up -d

# Check all containers are running
docker-compose ps

# Test bank-webhook
curl http://localhost:3001/

# Test user-app
curl http://localhost:3000/

# Test merchant-app
curl http://localhost:3002/
```

## 📝 Notes

- All apps now use **standalone mode** for Next.js (smaller image size)
- **Turbo monorepo** dependencies properly handled
- **Layer caching** optimized for faster rebuilds
- **Environment variables** configured in docker-compose.yml
