# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is PayPro?

A digital payment wallet platform with P2P (peer-to-peer) money transfers. Users authenticate, view a dashboard with wallet balance and transaction history, and send money to other users.

## Commands

### Monorepo (root)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start all services in dev mode (Turbo) |
| `npm run build` | Build all apps/packages |
| `npm run lint` | Lint everything |
| `npm run check-types` | TypeScript type checking |
| `npm run format` | Prettier format |

### Bank Webhook (NestJS API)

```bash
cd apps/bank-webhook
npm run dev             # PORT=3002 watch mode
npm run test            # Jest unit tests
npm run test:watch      # Watch mode
npm run test:cov        # Coverage report
npm run test:e2e        # E2E tests
npm run test -- <pattern> # Single test file
```

### User App (Next.js)

```bash
cd apps/user-app
npm run dev             # Port 3000
npm run build           # Production build
npm run check-types     # next typegen && tsc --noEmit
```

### Database (Prisma)

```bash
cd packages/database
npm run db:generate     # Generate Prisma Client
npm run db:migrate      # Create/apply migrations (dev)
npm run db:deploy       # Apply pending migrations (prod)
npm run db:studio       # Open Prisma Studio
```

### Run a single service via Turbo

```bash
npx turbo dev --filter=user-app
npx turbo dev --filter=bank-webhook
```

### Docker

```bash
docker-compose up -d    # Start all services
docker-compose logs -f  # Follow logs
docker-compose down     # Stop services
```

### Adding dependencies

```bash
npm install <package> -w <workspace-name>
npm install -D <package> # root devDependency
```

## Project Structure

```
paypro/
├── apps/
│   ├── bank-webhook/          # NestJS 11 REST API (port 3002 dev / 3001 prod)
│   ├── user-app/              # Next.js 16 consumer app (port 3000)
│   └── merchant-app/          # Next.js 16 merchant app (skeleton, port 3001/3003)
├── packages/
│   ├── database/              # Prisma schema, migrations, generated client
│   ├── ui/                    # Shared React components (Button, Card, Code, Sidebar)
│   ├── recoil/                # Recoil state management (unused/skeleton)
│   ├── eslint-config/         # Shared ESLint flat configs
│   ├── tailwind-config/       # Shared TailwindCSS 4 config
│   └── typescript-config/     # Shared tsconfig bases
├── docker/                    # Dockerfiles (user, merchant, webhook)
├── docs/                      # Design/architecture docs (10 markdown files)
├── docker-compose.yml         # postgres + 3 app services
└── turbo.json                 # Pipeline config
```

**Port map**: User App 3000, Merchant App 3001 (dev) / 3003 (Docker), Bank Webhook 3002, PostgreSQL 5432.

## High-Level Architecture

```
User Browser (port 3000) ──HTTP──> Next.js App ──REST──> NestJS API ──Prisma──> PostgreSQL
```

- **Next.js (user-app)**: App Router, React 19, TailwindCSS 4. NextAuth.js with JWT strategy + Credentials provider. Authenticated pages: dashboard, transfer, transactions, payments, account, settings. API routes: NextAuth handler, signup. Frontend API client in `lib/api.ts` calls the NestJS backend.
- **NestJS (bank-webhook)**: Feature-module pattern (controller/service/module/repository + dtos). Endpoints:
  - `POST /webhook/transaction` (JWT-guarded) — create P2P transfer
  - `POST /transaction/transfer` — user-initiated P2P
  - `GET /transactions` — list all with pagination
  - `GET /webhook/transaction/:id` — by ID
  - `POST /verify` — webhook signature verification
  - `GET /wallet/balance/:userId` — wallet balance
  - `GET /wallet/transactions/:userId` — paginated history
- **Database**: Postgres 15 via Prisma ORM 7.2 with `@prisma/adapter-pg`.

## Database Schema

Located in `packages/database/prisma/schema.prisma`. Key models: `User`, `UserSettings`, `Wallet`, `Transaction`.

**Important conventions:**
- **No FK between User and Wallet** — they are loosely coupled via a `userId` string. This is deliberate ("microservices-ready") so they can be split into separate services later.
- **camelCase** field names, UUID v4 primary keys, soft deletes (`deletedAt`), `Decimal(10,2)` for money, tables mapped to lowercase plural via `@@map("users")`.
- **Transaction** has enums: `TransactionStatus` (Pending/Completed/Failed/Refunded), `TransactionType` (P2P_Transfer/credit/debit/refund).
- **Spelling corrections already applied**: `refrenceId→referenceId`, `recieverId→receiverId`.
- Prisma client generated to custom path `../generated/prisma` (not `node_modules`). Client wrapper in `packages/database/src/client.ts` uses global singleton + `PrismaPg` adapter.

## Key Design Notes

- **Feature-module NestJS**: Each feature has controller → service → repository → module, plus `dtos/`. Dependency injection via constructor. Guards for auth (`jwt-auth.guard.ts`). Global `ValidationPipe` with whitelist + transform.
- **NextAuth**: JWT session strategy (30-day maxAge), Credentials provider calling `/auth/login` on the backend. Type augmentation in `lib/auth.ts` for session/JWT. User-app middleware handles route protection.
- **Idempotency**: P2P transfers accept an `idempotencyKey` to prevent duplicate processing.

## Environment

Key env vars (see `.env.example` and `docker-compose.yml`):

- `DATABASE_URL` — postgres connection string
- `NEXT_PUBLIC_API_URL` — backend URL (default `http://localhost:3002`)
- `NEXTAUTH_SECRET` — NextAuth encryption key
- `JWT_SECRET` — JWT signing key
- `WEBHOOK_SECRET` — bank webhook HMAC key

## Important Docs

| File | Purpose |
|------|---------|
| `docs/QUICK_START.md` | 30-second startup guide |
| `docs/MICROSERVICES_SCHEMA_GUIDE.md` | How to split into microservices |
| `docs/AUTH_FIX_GUIDE.md` | Security fixes in NextAuth |
| `docs/PRODUCTION_SECURITY.md` | Pre-deployment security checklist |
| `docs/IMPLEMENTATION_SUMMARY.md` | Full feature checklist & architecture |

## Known Drift in `copilot-instructions.md`

The `.github/copilot-instructions.md` is the most detailed project doc but has **drifted from reality** in several places:
- References `webhook-auth.guard.ts` and `start.sh` which don't exist (only `jwt-auth.guard.ts` exists; no startup script)
- User transfer endpoint is `POST /transaction/transfer` (not through `POST /webhook/transaction`)
- Port claims inconsistent: merchant Docker port is 3003 (not 3001); bank-webhook prod port in Docker is 3002
- The actual API client in `apps/user-app/lib/api.ts` calls `/wallet/...`, `/user/...`, `/transaction/transfer` — these are the real endpoints