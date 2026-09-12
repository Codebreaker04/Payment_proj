# NestJS Code Quality Improvements for bank-webhook

## Context

The `bank-webhook` app is a NestJS 11 REST API for a digital payment wallet. It has all the basic features working but doesn't follow many NestJS best practices. This plan documents the issues found and the recommended improvements.

## Current Architecture Summary

```
src/
├── app.module.ts          # Root module with ConfigModule
├── main.ts                # Bootstrap with ValidationPipe, Helmet, CORS
├── auth/                  # Auth feature module
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   ├── auth.repository.ts (stub)
│   └── dtos/
│       ├── login.dto.ts
│       └── signup.dto.ts
├── transaction/           # Transaction feature module
│   ├── transaction.controller.ts
│   ├── transaction.service.ts
│   ├── transaction.repository.ts
│   ├── transaction.module.ts
│   ├── dtos/request.ts
│   └── enum/paymentMethod.ts
├── wallet/                # Wallet feature module
│   ├── wallet.controller.ts
│   ├── wallet.service.ts
│   ├── wallet.repository.ts
│   └── wallet.module.ts
├── user/                  # User feature module
│   ├── user.controller.ts
│   ├── user.service.ts
│   ├── user.repository.ts
│   ├── user.module.ts
│   └── dtos/
├── prisma/                # Database module
│   ├── prisma.service.ts  # Singleton PrismaService extending PrismaClient
│   └── prisma.module.ts
└── guards/
    └── jwt-auth.guard.ts  # JWT authentication guard
```

## Issues Found (Categorized by NestJS Best Practice)

### 1. **DTO Validation & Type Safety** (High Priority)

**Issues:**
- DTOs missing `!` definite assignment assertions for `strictPropertyInitialization`
- `PaymentMethod` enum not using string enum properly in some places
- No global DTO transformation options configured

**Files to fix:**
- `src/auth/dtos/login.dto.ts` - add `!` to properties
- `src/auth/dtos/signup.dto.ts` - add `!` to properties
- `src/transaction/dtos/request.ts` - add `!` to all properties
- `src/user/dtos/update-profile.dto.ts` - add `!` to properties
- `src/user/dtos/update-settings.dto.ts` - add `!` to properties

### 2. **Global Exception Filter** (High Priority)

**Issues:**
- No global exception filter — errors leak internal details
- `PrismaClientKnownRequestError` handled inline in services
- No standard error response format

**Recommended:**
- Create `src/common/filters/http-exception.filter.ts` implementing `ExceptionFilter`
- Register globally in `main.ts` with `app.useGlobalFilters(new HttpExceptionFilter())`
- Standard error format: `{ statusCode, message, error, timestamp, path }`
- Map Prisma errors (P2002, P2025) to appropriate HTTP exceptions

### 3. **Global Response Interceptor** (Medium Priority)

**Issues:**
- Inconsistent response format: `{ success: true, data }` vs raw data
- Some endpoints return `{ success: true, balance }` others return Prisma models directly

**Recommended:**
- Create `src/common/interceptors/transform-response.interceptor.ts`
- Wrap all successful responses: `{ data, timestamp, path }`
- Exclude Swagger paths and health checks

### 4. **Structured Logging** (Medium Priority)

**Issues:**
- Using `Logger` class but inconsistent usage
- Some services use `this.logger.log()` others use `console.log`
- No request context in logs

**Recommended:**
- Add `src/common/logger/custom.logger.ts` extending `Logger`
- Use `NestJS` built-in `Logger` with context
- Add request ID middleware for traceability

### 5. **Configuration Management** (Medium Priority)

**Issues:**
- `ConfigModule.forRoot({ envFilePath: '.env' })` only loads one file
- No validation schema for env vars
- Secrets in docker-compose.yml not using `.env` files

**Recommended:**
- Use `@nestjs/config` with `validationSchema` (Joi/Zod)
- Separate `.env.development`, `.env.production`, `.env.test`
- Use `ConfigService` with typed getters

### 6. **Swagger/OpenAPI Documentation** (Medium Priority)

**Issues:**
- No Swagger setup at all
- API consumers have no documentation

**Recommended:**
- Install `@nestjs/swagger`
- Add `src/main.ts` Swagger configuration
- Add `@ApiTags`, `@ApiOperation`, `@ApiResponse`, `@ApiBearerAuth` decorators
- DTOs: `@ApiProperty` decorators

### 7. **Repository Pattern Improvements** (Medium Priority)

**Issues:**
- `auth.repository.ts` is a stub (empty class with comment)
- TransactionRepository has duplicate balance check methods
- WalletRepository re-implements wallet finding logic
- UserRepository has `createUser` with lowercase `createUser` type (bug)
- No base repository class for common operations

**Recommended:**
- Remove `auth.repository.ts` or implement properly
- Create `src/common/repository/base.repository.ts` with CRUD operations
- Consolidate `getWalletByUserId` logic (exists in 3 places)
- Fix `createUser` type reference

### 8. **Guard & Auth Improvements** (High Priority)

**Issues:**
- `JwtAuthGuard` re-verifies token on every request (no caching)
- No refresh token mechanism
- Token verification logic duplicated in `AuthenticationService.verifyJwtToken()`
- `JwtAuthGuard` added as provider in `TransactionModule` instead of global or controller-level

**Recommended:**
- Register `JwtAuthGuard` globally in `app.module.ts` or use `@UseGuards` on controllers
- Extract JWT verification to a dedicated `JwtService`
- Add optional token caching with short TTL
- Consider using `@nestjs/jwt` module instead of raw `jsonwebtoken`

### 9. **Service Layer Issues** (High Priority)

**Issues:**
- `TransactionService.createP2PTransaction` doesn't validate receiver exists
- `WalletService` injects `TransactionRepository` (circular dependency risk)
- `AuthenticationService` uses raw `jsonwebtoken` + `bcrypt` instead of NestJS modules
- Business logic in repository (`createTransaction` does balance updates + transaction creation)

**Recommended:**
- Move balance validation to service layer
- Use `@nestjs/jwt` and `@nestjs/bcrypt` modules
- Separate concerns: repository = data access only, service = business logic
- Add unit tests for services

### 10. **Module Organization** (Low Priority)

**Issues:**
- `TransactionModule` provides `JwtAuthGuard` as provider (should be global)
- `WalletModule` provides `TransactionRepository` (leaks internal)
- No feature module for common/shared utilities

**Recommended:**
- Create `src/common/` module for shared pipes, filters, interceptors, guards
- Move `JwtAuthGuard` to common or auth module
- Use `forwardRef` if circular dependencies exist

### 11. **Testing** (Medium Priority)

**Issues:**
- Only `app.controller.spec.ts` and `transaction.controller.spec.ts` exist
- No unit tests for services, repositories, guards
- No e2e tests for auth, wallet, user endpoints

**Recommended:**
- Add unit tests for each service (mock repositories)
- Add unit tests for guards
- Add e2e tests for all endpoints
- Use `jest` with `supertest`

### 12. **TypeScript & Code Style** (Low Priority)

**Issues:**
- Some files use `private readonly` others just `private`
- Inconsistent error handling patterns
- No strict null checks on some returns
- `auth.repository.ts` has syntax error (lowercase `createUser`)

**Recommended:**
- Run `npm run lint` and fix all issues
- Add consistent `private readonly` for injected dependencies
- Use `NonNullable` types where appropriate

## Implementation Priority

### Phase 1: Critical Fixes (Do First)
1. DTO `!` assertions
2. Fix `auth.repository.ts` stub/bug
2. Global exception filter
3. Standardize response format

### Phase 2: Architecture Improvements
4. Swagger/OpenAPI setup
5. Configuration validation schema
6. Extract `JwtService` from `AuthenticationService`
7. Fix circular dependency risks (WalletService → TransactionRepository)

### Phase 3: Quality of Life
8. Base repository class
9. Structured logging with request IDs
10. Unit and e2e tests

### Phase 4: Optional Enhancements
11. Refresh token mechanism
12. Rate limiting
13. API versioning

## Verification

After each phase:
```bash
# Type check
cd apps/bank-webhook && npm run check-types  # or npx tsc --noEmit

# Lint
cd apps/bank-webhook && npm run lint

# Tests
cd apps/bank-webhook && npm run test
cd apps/bank-webhook && npm run test:e2e

# Build
cd apps/bank-webhook && npm run build

# Dev server
cd apps/bank-webhook && npm run dev
```

## Files to Create

| File | Purpose |
|------|---------|
| `src/common/filters/http-exception.filter.ts` | Global exception handling |
| `src/common/interceptors/transform-response.interceptor.ts` | Response normalization |
| `src/common/guards/jwt-auth.guard.ts` | Moved/improved guard |
| `src/common/pipes/validation.pipe.ts` | Custom validation pipe (optional) |
| `src/common/repository/base.repository.ts` | Base CRUD repository |
| `src/common/decorators/current-user.decorator.ts` | Current user injection |
| `src/auth/jwt.service.ts` | JWT token management |
| `src/config/validation.schema.ts` | Env validation |

## Files to Modify

| File | Changes |
|------|---------|
| `src/main.ts` | Add global filter, interceptor, Swagger |
| `src/app.module.ts` | Register global guard, common module |
| `src/auth/auth.service.ts` | Extract JWT logic to JwtService |
| `src/auth/dtos/*.ts` | Add `!` assertions |
| `src/transaction/dtos/request.ts` | Add `!` assertions |
| `src/user/dtos/*.ts` | Add `!` assertions |
| `src/transaction/transaction.service.ts` | Move balance logic from repo |
| `src/wallet/wallet.service.ts` | Remove TransactionRepository dependency |
| `src/guards/jwt-auth.guard.ts` | Use JwtService |
| `src/user/user.repository.ts` | Fix `createUser` type bug |

---

**Estimated Effort:** 2-3 days for Phase 1-2, 1 week for full implementation with tests.