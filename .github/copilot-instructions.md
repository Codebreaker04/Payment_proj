# PayPro - GitHub Copilot Instructions

> Payment wallet application with P2P transfers, built with Next.js, NestJS, and PostgreSQL

## Tech Stack

- **Frontend**: Next.js 16 (React 19), TailwindCSS 4, NextAuth.js
- **Backend**: NestJS 11, Express
- **Database**: PostgreSQL 15, Prisma ORM 7
- **Monorepo**: Turborepo, npm workspaces
- **Runtime**: Node.js ≥18, npm 11.4.2

## Project Structure

```
apps/
├── bank-webhook/     # NestJS API (port 3001/3002)
├── user-app/         # Next.js consumer app (port 3000)
└── merchant-app/     # Next.js merchant app (port 3001)

packages/
├── database/         # Prisma schema & migrations
├── ui/              # React component library
├── recoil/          # State management
├── eslint-config/   # Shared ESLint rules
├── tailwind-config/ # Shared Tailwind config
└── typescript-config/ # Shared TypeScript configs
```

## Build & Development Commands

### Monorepo (Root)
```bash
npm run build          # Build all apps/packages
npm run dev            # Start all services in dev mode
npm run lint           # Lint all packages
npm run format         # Format with Prettier
npm run check-types    # TypeScript type checking
```

### Bank Webhook (NestJS)
```bash
npm run dev            # Watch mode (PORT=3002)
npm run build          # Compile TypeScript
npm run start:prod     # Production mode
npm run test           # Run all tests
npm run test:watch     # Watch mode
npm run test:cov       # Coverage report
npm run test:e2e       # E2E tests
```

### User App (Next.js)
```bash
npm run dev            # Dev server (port 3000)
npm run build          # Production build
npm run check-types    # Type generation + tsc
```

### Database Package
```bash
npm run db:generate    # Generate Prisma Client
npm run db:migrate     # Run migrations (dev)
npm run db:deploy      # Deploy migrations (prod)
npm run db:studio      # Open Prisma Studio
```

### Docker
```bash
docker-compose up -d   # Start all services
docker-compose logs -f # Follow logs
docker-compose down    # Stop services
./start.sh            # One-command setup
```

## Architecture

### High-Level Flow
```
User Browser (localhost:3000)
    ↓ HTTP
Next.js User App (port 3000)
    ↓ REST API
NestJS Bank Webhook (port 3001/3002)
    ↓ Prisma ORM
PostgreSQL Database (port 5432)
```

### Microservices-Ready Design

**Critical**: The schema is designed for future service separation:

- `User ↔ Wallet`: **NO foreign key constraint** (loosely coupled via `userId` string reference)
- `Wallet ↔ Transaction`: Hard FK (both remain in same service)

This allows splitting into separate services:
- **User Service**: Authentication, user profiles
- **Wallet Service**: Wallets + transactions

Reference: `/MICROSERVICES_SCHEMA_GUIDE.md` for detailed migration strategy.

### NestJS Backend Structure

```
apps/bank-webhook/src/
├── <feature>/
│   ├── <feature>.controller.ts    # HTTP endpoints
│   ├── <feature>.service.ts       # Business logic
│   ├── <feature>.module.ts        # Dependency injection
│   ├── <feature>.repository.ts    # Data access layer
│   └── dtos/                      # Request/response DTOs
├── guards/                         # Auth/validation guards
├── middleware/                     # Request processing
└── prisma/                         # Database service wrapper
```

**Patterns**:
- Dependency Injection via NestJS modules
- Repository pattern for data access
- DTOs for request/response validation
- Guards for authentication/authorization
- Middleware for logging and headers

### Next.js Frontend Structure

```
apps/user-app/
├── app/
│   ├── dashboard/page.tsx       # Balance & transactions
│   ├── transfer/page.tsx        # P2P transfer form
│   ├── auth/signin/page.tsx     # Authentication
│   └── api/auth/[...nextauth]/  # NextAuth routes
├── lib/
│   ├── auth.ts                  # NextAuth config
│   └── api.ts                   # Type-safe API client
├── utils/
│   └── auth.ts                  # JWT utilities
└── types/
    └── next-auth.d.ts           # Type extensions
```

## Database Schema Conventions

**File**: `/packages/database/prisma/schema.prisma`

### Key Conventions
- **Field Naming**: camelCase (`userId`, `referenceId`)
- **IDs**: UUID v4 with `@default(uuid())`
- **Timestamps**: `createdAt`, `updatedAt`, `deletedAt` (soft deletes)
- **Money Fields**: `Decimal @db.Decimal(10, 2)`
- **Table Names**: lowercase plural via `@@map("users")`
- **Indexes**: On foreign keys and frequently queried fields

### Schema Example
```prisma
model Wallet {
  id      String  @id @default(uuid())
  userId  String  @unique  // NO FK - microservices-ready
  balance Decimal @db.Decimal(10, 2)
  
  sentTransactions     Transaction[] @relation("SentTransactions")
  receivedTransactions Transaction[] @relation("ReceivedTransactions")
  
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  deletedAt DateTime?
  
  @@index([userId])
  @@map("wallets")
}
```

### Recent Schema Fixes

⚠️ **Important Spelling Corrections**:
1. ✅ `refrenceId` → `referenceId` (migration: `20260201120155_fix_reference_id_typo`)
2. ✅ `recieverId` → `receiverId` (fixed across all files)

When referencing these fields, use the **correct** spelling.

## Coding Conventions

### Naming
- **Files**: camelCase for utilities, PascalCase for components
- **Variables**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Types/Interfaces**: PascalCase
- **Database columns**: camelCase (follow Prisma schema)

### API Patterns
- RESTful endpoints with HTTP verbs
- Route pattern: `/resource/:id`
- Error responses: Use NestJS exceptions (`NotFoundException`, `BadRequestException`)
- Authentication: JWT tokens via NextAuth

### Type Safety
- Full TypeScript end-to-end
- Frontend API client (`lib/api.ts`) with typed responses
- Prisma generates types from schema
- No `any` types without justification

## Authentication & Security

### NextAuth Configuration

**File**: `/apps/user-app/lib/auth.ts`

**Critical Security Fix Applied** (see `/AUTH_FIX_GUIDE.md`):
- ✅ `bcrypt.compare()` must use `await` (security vulnerability if missing)
- ✅ Return user object from `authorize()`, not token
- ✅ Validate credentials before processing
- ✅ Use proper error messages

### JWT Utilities

**File**: `/apps/user-app/utils/auth.ts`

```typescript
generateToken(userId: string): string    // Create JWT
verifyToken(token: string): { userId }   // Validate JWT
```

### Environment Variables

**User App**:
```env
DATABASE_URL=postgresql://admin:admin@localhost:5432/payments
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
JWT_SECRET=<generate with: openssl rand -base64 32>
```

**Bank Webhook**:
```env
PORT=3002
DATABASE_URL=postgresql://admin:admin@localhost:5432/payments
WEBHOOK_SECRET=bank_webhook_secret_key
ALLOWED_WEBHOOK_IPS=1.2.3.4
```

### Webhook Security

**Guards**: `/apps/bank-webhook/src/guards/webhook-auth.guard.ts`

- HMAC signature verification
- Timestamp validation (prevent replay attacks)
- IP whitelisting
- Reference: `/PRODUCTION_SECURITY.md`

## Common Tasks

### Running Tests
```bash
# NestJS (bank-webhook)
cd apps/bank-webhook
npm run test                    # All tests
npm run test:watch              # Watch mode
npm run test -- <file-pattern> # Single test file
npm run test:cov               # With coverage

# Next.js apps don't have test setup yet
```

### Database Migrations
```bash
cd packages/database

# Development
npm run db:migrate             # Interactive migration creation
npm run db:generate            # Regenerate Prisma Client

# Production
npm run db:deploy              # Apply pending migrations
```

### Adding New Dependencies
```bash
# Root-level (shared dependencies)
npm install <package> -w <workspace-name>

# Examples:
npm install lodash -w user-app
npm install @nestjs/throttler -w bank-webhook
npm install zod -w database

# Shared devDependencies (root)
npm install -D <package>
```

### Running Single Service
```bash
# Filter by workspace name
npm run dev --filter=user-app
npm run dev --filter=bank-webhook

# Or use Turbo directly
npx turbo dev --filter=user-app
```

## Important Documentation

| File | Purpose |
|------|---------|
| `IMPLEMENTATION_SUMMARY.md` | Complete feature checklist, architecture diagrams, API endpoints |
| `AUTH_FIX_GUIDE.md` | Critical security fixes in NextAuth (bcrypt, JWT) |
| `PRODUCTION_SECURITY.md` | Security implementation guide, pre-deployment checklist |
| `MICROSERVICES_SCHEMA_GUIDE.md` | How to split into microservices, migration strategy |
| `DOCKER_FIX_SUMMARY.md` | Docker configuration and fixes |
| `QUICK_START.md` | 30-second startup guide |

## Known Issues & Fixes

### Fixed Issues ✅
1. **bcrypt.compare missing await** - Security vulnerability (now fixed)
2. **receiverId spelling** - Changed from `recieverId` to `receiverId`
3. **referenceId spelling** - Changed from `refrenceId` to `referenceId`
4. **NextAuth return value** - Fixed to return user object, not token
5. **Docker port conflicts** - Configured distinct ports (3000, 3001, 3002, 5432)

### Pending Improvements
- [ ] Unit test coverage (Jest setup exists)
- [ ] Rate limiting (@nestjs/throttler)
- [ ] API documentation (Swagger/OpenAPI)
- [ ] CI/CD pipeline
- [ ] Error monitoring (Sentry)
- [ ] Redis for caching

## API Reference

**Base URL**: `http://localhost:3001` (or 3002 in dev)

### Endpoints
```
GET  /wallet/balance/:userId           # Get wallet balance
GET  /wallet/transactions/:userId      # Get transaction history
POST /webhook/transaction              # Create P2P transfer
GET  /webhook/transaction/:id          # Get transaction by ID
POST /webhook/verify                   # Verify webhook signature
```

### Example Request
```bash
# Get balance
curl http://localhost:3001/wallet/balance/user-123

# Create transfer
curl -X POST http://localhost:3001/webhook/transaction \
  -H "Content-Type: application/json" \
  -d '{
    "senderId": "wallet-1",
    "receiverId": "wallet-2",
    "amount": 100.00,
    "referenceId": "unique-ref-123"
  }'
```

## Port Configuration

| Service | Development | Production | Docker |
|---------|------------|-----------|--------|
| User App | 3000 | 3000 | 3000 |
| Merchant App | 3001 | 3001 | 3001 |
| Bank Webhook | 3002 | 3001 | 3002 |
| PostgreSQL | 5432 | 5432 | 5432 |

## Troubleshooting

### Prisma Client Out of Sync
```bash
cd packages/database
npm run db:generate
```

### Docker Issues
```bash
# Full cleanup
docker-compose down -v
docker system prune -f

# Rebuild and restart
docker-compose up --build
```

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### NextAuth Session Issues
- Verify `NEXTAUTH_SECRET` is set in `.env`
- Check `NEXTAUTH_URL` matches your domain
- Clear cookies and restart Next.js dev server

## Project Status

✅ **Implemented**:
- Database schema with migrations
- Backend API (NestJS) with all CRUD operations
- Frontend (Next.js) with dashboard and transfer pages
- Authentication (NextAuth + JWT)
- Webhook security (HMAC, IP whitelisting)
- Docker orchestration
- Full TypeScript type safety

⚠️ **In Progress**:
- Unit test coverage
- API documentation

❌ **Not Started**:
- CI/CD pipeline
- Error monitoring
- Rate limiting
- Redis caching
