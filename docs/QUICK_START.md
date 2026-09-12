# PayPro — Setup & Startup Guide

Payment wallet app with P2P transfers. Monorepo with a NestJS API backend, a Next.js consumer frontend, and a PostgreSQL database.

## Prerequisites

- **Node.js ≥ 18** (npm 11.4.2 recommended)
- **PostgreSQL 15** running locally, OR **Docker**
- A terminal

## Quick Start (with Docker)

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma client
cd packages/database && npm run db:generate && cd ../..

# 3. Start everything
docker-compose up -d
```

Services spin up:
| Service | URL |
|---------|-----|
| User App (Next.js) | http://localhost:3000 |
| Merchant App (Next.js) | http://localhost:3003 |
| Bank Webhook (NestJS) | http://localhost:3002 |
| PostgreSQL | localhost:5432 |

## Quick Start (without Docker)

Start PostgreSQL manually, then:

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
#    Copy and edit the example:
cp .env.example .env
#    Make sure DATABASE_URL points to your running Postgres:
#    postgresql://admin:admin@localhost:5432/payments

# 3. Generate Prisma client & run migrations
cd packages/database
npm run db:generate
npm run db:migrate
cd ../..

# 4. Start both services in dev mode
npm run dev
```

This starts:
- Bank Webhook on **http://localhost:3002**
- User App on **http://localhost:3000**
- Merchant App on **http://localhost:3001**

Create an account at http://localhost:3000/auth/signup, then log in.

## Run a Single Service

```bash
npx turbo dev --filter=user-app      # Frontend only
npx turbo dev --filter=bank-webhook  # Backend only
```

## API Endpoints

Base URL: `http://localhost:3002`

```bash
# Auth
POST /auth/login         # Login, returns JWT
POST /auth/signup        # Create account

# Wallet
GET  /wallet/balance/:userId        # Balance
GET  /wallet/transactions/:userId   # Transaction history (limit/offset pagination)

# Transactions
POST /transaction/transfer          # User-initiated P2P transfer
POST /webhook/transaction           # Webhook-initiated transaction (JWT-guarded)
GET  /webhook/transaction/:id       # Get by ID
GET  /transactions                  # List all (limit/offset)
POST /verify                        # Verify webhook signature

# Profile & Settings
GET  /user/profile/:userId          # Get profile
GET  /user/settings/:userId         # Get settings
PUT  /user/settings/:userId         # Update settings
```

### Example: Create a P2P Transfer

```bash
curl -X POST http://localhost:3002/transaction/transfer \
  -H "Content-Type: application/json" \
  -d '{
    "senderUserId": "uuid-here",
    "receiverUserId": "other-uuid",
    "amount": 50.00,
    "description": "lunch",
    "idempotencyKey": "unique-ref-123"
  }'
```

## Environment Variables

Key vars (see `.env.example` for all):

| Variable | Default | Where Needed |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://admin:admin@localhost:5432/payments` | Root, bank-webhook, user-app |
| `PORT` | `3002` | bank-webhook |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3002` | user-app, merchant-app |
| `NEXTAUTH_URL` | `http://localhost:3000` | user-app |
| `NEXTAUTH_SECRET` *(generate)* | — | user-app |
| `JWT_SECRET` *(generate)* | — | bank-webhook, user-app |
| `WEBHOOK_SECRET` | — | bank-webhook |

Generate secrets:
```bash
openssl rand -base64 32   # for NEXTAUTH_SECRET and JWT_SECRET
```

## Database Migrations

```bash
cd packages/database

# Create a new migration after schema changes
npm run db:migrate

# Regenerate client (run after pulling new migrations)
npm run db:generate

# Apply pending migrations in production
npm run db:deploy

# Open Prisma Studio
npm run db:studio
```

## Common Commands

| Task | Command |
|------|---------|
| Install everything | `npm install` |
| Build all | `npm run build` |
| Lint all | `npm run lint` |
| Type-check all | `npm run check-types` |
| Format code | `npm run format` |
| Run backend tests | `cd apps/bank-webhook && npm run test` |
| Run backend E2E tests | `cd apps/bank-webhook && npm run test:e2e` |
| View Docker logs | `docker-compose logs -f` |
| Stop Docker | `docker-compose down` |
| Fresh Docker (delete data) | `docker-compose down -v && docker-compose up -d` |

## Troubleshooting

**Prisma client out of sync:** `cd packages/database && npm run db:generate`

**Port conflict:** `lsof -i :3000` then `kill -9 <PID>`

**NextAuth session issues:** Verify `NEXTAUTH_SECRET` is set and `NEXTAUTH_URL` matches.

**Docker DB not connecting:** Make sure the database service is healthy before the app starts. `docker-compose up -d` handles the healthcheck wait automatically.

---

For more detail, see docs in the `docs/` directory.