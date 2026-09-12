# NestJS Code Quality Implementation Guide

This guide provides step-by-step instructions for implementing all the improvements identified in the code quality analysis.

---

## Phase 1: Critical Fixes (Do First)

### 1.1 Fix DTO `strictPropertyInitialization` Errors

**Problem:** TypeScript's `strictPropertyInitialization` requires class properties to be initialized in the constructor. DTOs are populated by NestJS's `ValidationPipe` at runtime via reflection, which TypeScript can't see.

**Solution:** Add `!` (definite assignment assertion) to all DTO properties.

**Files to modify:**

| File | Changes |
|------|---------|
| `src/auth/dtos/login.dto.ts` | Add `!` to `email` and `password` |
| `src/auth/dtos/signup.dto.ts` | Add `!` to `name`, `email`, `password` |
| `src/transaction/dtos/request.ts` | Add `!` to all properties in all classes |
| `src/user/dtos/update-profile.dto.ts` | Add `!` to `name`, `email`, `phone` |
| `src/user/dtos/update-settings.dto.ts` | Add `!` to `language`, `currency`, `emailNotifications`, `transactionAlerts`, `twoFactorEnabled` |

**Example:**
```typescript
// Before
@IsEmail()
email: string;

// After
@IsEmail()
email!: string;
```

**Verify:** `cd apps/bank-webhook && npx tsc --noEmit` — should show no TS2564 errors.

---

### 1.2 Fix `auth.repository.ts` (Broken Stub)

**Problem:** The file is an incomplete stub with a syntax error (`createUser` lowercase type reference).

**Solution:** Either implement it properly or remove it entirely (the `AuthenticationService` uses `PrismaService` directly).

**File:** `src/auth/auth.repository.ts`

**Option A - Remove (Recommended):**
```bash
rm src/auth/auth.repository.ts
```
Then remove from `AuthModule` if imported (it's not currently).

**Option B - Implement properly:**
```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@repo/database';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({ data });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }
}
```
Then inject in `AuthenticationService` instead of using `this.prisma` directly.

**Verify:** `npm run build` — should compile without errors.

---

### 1.3 Create Global Exception Filter

**Problem:** No global error handling — Prisma errors leak internal details, inconsistent error formats.

**Solution:** Create a global exception filter that catches all exceptions and returns standardized responses.

**New file:** `src/common/filters/http-exception.filter.ts`

```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@repo/database';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message = typeof res === 'string' ? res : (res as any).message || exception.message;
      error = exception.name;
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      ({ status, message, error } = this.handlePrismaError(exception));
    } else if (exception instanceof Prisma.PrismaClientValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Invalid data provided';
      error = 'Validation Error';
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;
    }

    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
      exception instanceof Error ? exception.stack : '',
    );

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      error,
      message,
    });
  }

  private handlePrismaError(exception: Prisma.PrismaClientKnownRequestError) {
    switch (exception.code) {
      case 'P2002':
        return {
          status: HttpStatus.CONFLICT,
          message: 'A record with this value already exists',
          error: 'Conflict',
        };
      case 'P2025':
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'Record not found',
          error: 'Not Found',
        };
      case 'P2003':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Foreign key constraint failed',
          error: 'Bad Request',
        };
      default:
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Database operation failed',
          error: 'Internal Server Error',
        };
    }
  }
}
```

**Register in `main.ts`:**
```typescript
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

// In bootstrap()
app.useGlobalFilters(new HttpExceptionFilter());
```

**Update `AuthenticationService`** — remove inline Prisma error handling since filter handles it globally.

---

### 1.4 Standardize Response Format with Interceptor

**Problem:** Inconsistent responses — some `{ success: true, data }`, others raw Prisma models.

**Solution:** Global interceptor that wraps all successful responses.

**New file:** `src/common/interceptors/transform-response.interceptor.ts`

```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';

export interface ApiResponse<T> {
  data: T;
  timestamp: string;
  path: string;
}

@Injectable()
export class TransformResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest<Request>();
    
    // Skip for Swagger, health checks, or non-JSON responses
    const skipPaths = ['/api', '/docs', '/health'];
    if (skipPaths.some(p => request.url.startsWith(p))) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => ({
        data,
        timestamp: new Date().toISOString(),
        path: request.url,
      })),
    );
  }
}
```

**Register in `main.ts`:**
```typescript
import { TransformResponseInterceptor } from './common/interceptors/transform-response.interceptor';

// In bootstrap()
app.useGlobalInterceptors(new TransformResponseInterceptor());
```

**Update services** — return raw data, let interceptor wrap it.

---

### 1.5 Enable Implicit Conversion in ValidationPipe

**Problem:** Query parameters come as strings, need manual `@Type()` or pipes.

**Solution:** Add `enableImplicitConversion` to `ValidationPipe` options.

**Modify `main.ts`:**
```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true, // "50" → 50, "true" → true
    },
  }),
);
```

Now you can remove `ParseIntPipe` from simple query params:
```typescript
// Before
@Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,

// After (auto-converts)
@Query('limit', new DefaultValuePipe(50)) limit: number,
```

---

## Phase 2: Architecture Improvements

### 2.1 Add Swagger/OpenAPI Documentation

**Install:**
```bash
cd apps/bank-webhook && npm install @nestjs/swagger swagger-ui-express
```

**Modify `main.ts`:**
```typescript
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

// In bootstrap(), before app.listen()
const config = new DocumentBuilder()
  .setTitle('PayPro Bank Webhook API')
  .setDescription('Digital Payment Wallet P2P Transfer API')
  .setVersion('1.0')
  .addBearerAuth()
  .addTag('auth', 'Authentication endpoints')
  .addTag('wallet', 'Wallet balance & transactions')
  .addTag('transaction', 'P2P transfers & webhook')
  .addTag('user', 'User profile & settings')
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document);
```

**Add decorators to controllers:**
```typescript
// auth/auth.controller.ts
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() payload: LoginDto) { ... }
}
```

**Add to DTOs:**
```typescript
// auth/dtos/login.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password!: string;
}
```

---

### 2.2 Environment Configuration Validation

**Install:**
```bash
cd apps/bank-webhook && npm install joi
```

**New file:** `src/config/validation.schema.ts`

```typescript
import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().port().default(3002),
  
  DATABASE_URL: Joi.string().uri().required(),
  
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('15d'),
  
  WEBHOOK_SECRET: Joi.string().min(32).required(),
  
  ALLOWED_ORIGINS: Joi.string().default('*'),
  
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'log', 'debug', 'verbose')
    .default('log'),
});
```

**Update `app.module.ts`:**
```typescript
import { validationSchema } from './config/validation.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        `.env.${process.env.NODE_ENV}.local`,
        `.env.${process.env.NODE_ENV}`,
        '.env.local',
        '.env',
      ],
      validationSchema,
    }),
    // ...
  ],
})
export class AppModule {}
```

**Create environment files:**
- `.env.development` — dev values
- `.env.production` — production values (secrets from CI/CD)
- `.env.test` — test values

---

### 2.3 Extract JwtService from AuthenticationService

**Problem:** JWT logic mixed with authentication business logic; uses raw `jsonwebtoken`.

**Solution:** Create dedicated `JwtService` using `@nestjs/jwt`.

**Install:**
```bash
cd apps/bank-webhook && npm install @nestjs/jwt
```

**New file:** `src/auth/jwt.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  userId: string;
  email: string;
  name: string | null;
}

@Injectable()
export class JwtService {
  constructor(
    private readonly jwtService: NestJwtService,
    private readonly configService: ConfigService,
  ) {}

  generateAccessToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '15d',
    });
  }

  verifyAccessToken(token: string): JwtPayload {
    try {
      return this.jwtService.verify<JwtPayload>(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  decodeToken(token: string): JwtPayload | null {
    return this.jwtService.decode(token) as JwtPayload | null;
  }
}
```

**Update `auth.module.ts`:**
```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthenticationService } from './auth.service';
import { JwtService } from './jwt.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '15d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthenticationService, JwtService],
  exports: [AuthenticationService, JwtService],
})
export class AuthModule {}
```

**Update `AuthenticationService`** — inject `JwtService` instead of using `jsonwebtoken` directly.

---

### 2.4 Fix Circular Dependency (WalletService → TransactionRepository)

**Problem:** `WalletService` injects `TransactionRepository`, but `TransactionService` also uses wallet logic.

**Solution:** Move `getWalletTransactions` to `TransactionService` only. `WalletService` should only handle wallet-specific operations.

**Modify `src/wallet/wallet.service.ts`:**
```typescript
// Remove TransactionRepository injection
@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(private readonly walletRepository: WalletRepository) {}

  async getWalletBalance(userId: string) {
    const balance = await this.walletRepository.getBalanceByUserId(userId);
    return { success: true, balance };
  }

  // Remove getWalletTransactions — use TransactionController/Service instead
}
```

**Modify `src/wallet/wallet.module.ts`:**
```typescript
// Remove TransactionRepository from providers
@Module({
  imports: [PrismaModule],
  controllers: [WalletController],
  providers: [WalletService, WalletRepository], // No TransactionRepository
})
export class WalletModule {}
```

**Modify `src/transaction/transaction.module.ts`:**
```typescript
// Remove JwtAuthGuard from providers (register globally instead)
@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [TransactionController],
  providers: [TransactionService, TransactionRepository], // No JwtAuthGuard
})
export class TransactionModule {}
```

---

## Phase 3: Quality of Life

### 3.1 Create Base Repository Class

**New file:** `src/common/repository/base.repository.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@repo/database';

@Injectable()
export abstract class BaseRepository<T, CreateInput, UpdateInput, WhereUniqueInput> {
  constructor(protected readonly prisma: PrismaService) {}

  protected abstract get model(): any;

  async create(data: CreateInput): Promise<T> {
    return this.model.create({ data });
  }

  async findUnique(where: WhereUniqueInput): Promise<T | null> {
    return this.model.findUnique({ where });
  }

  async findFirst(where: Prisma.Args<T, 'findFirst'>['where']): Promise<T | null> {
    return this.model.findFirst({ where });
  }

  async findMany(args?: Prisma.Args<T, 'findMany'>): Promise<T[]> {
    return this.model.findMany(args);
  }

  async update(where: WhereUniqueInput, data: UpdateInput): Promise<T> {
    return this.model.update({ where, data });
  }

  async delete(where: WhereUniqueInput): Promise<T> {
    return this.model.delete({ where });
  }

  async count(where?: Prisma.Args<T, 'count'>['where']): Promise<number> {
    return this.model.count({ where });
  }
}
```

**Usage in repositories:**
```typescript
// transaction.repository.ts
@Injectable()
export class TransactionRepository extends BaseRepository<
  Prisma.TransactionGetPayload<{}>,
  Prisma.TransactionCreateInput,
  Prisma.TransactionUpdateInput,
  Prisma.TransactionWhereUniqueInput
> {
  protected get model() {
    return this.prisma.transaction;
  }
  // ... custom methods
}
```

---

### 3.2 Add Request ID Middleware for Logging

**New file:** `src/common/middleware/request-id.middleware.ts`

```typescript
import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RequestIdMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    const requestId = req.headers['x-request-id'] as string || uuidv4();
    req['requestId'] = requestId;
    res.setHeader('X-Request-ID', requestId);
    
    this.logger.log(`${req.method} ${req.url} [${requestId}]`);
    next();
  }
}
```

**Register in `app.module.ts`:**
```typescript
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';

@Module({ ... })
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
```

**Update Logger usage:**
```typescript
// In services, include request ID
this.logger.log(`Processing transaction ${id}`, 'TransactionService');
```

---

### 3.3 Add Current User Decorator

**New file:** `src/common/decorators/current-user.decorator.ts`

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedUser } from '../auth/auth.service';

export const CurrentUser = createParamDecorator(
  (data: keyof AuthenticatedUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser;
    return data ? user?.[data] : user;
  },
);
```

**Usage in controllers:**
```typescript
@Get('profile')
async getProfile(@CurrentUser() user: AuthenticatedUser) {
  // user.userId, user.email, user.name available
}
```

---

## Phase 4: Testing

### 4.1 Unit Test Structure

**Example:** `src/auth/auth.service.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthenticationService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from './jwt.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');
jest.mock('@nestjs/jwt');

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let prisma: jest.Mocked<PrismaService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthenticationService,
        { provide: PrismaService, useValue: mockPrismaService() },
        { provide: JwtService, useValue: mockJwtService() },
      ],
    }).compile();

    service = module.get(AuthenticationService);
    prisma = module.get(PrismaService);
    jwtService = module.get(JwtService);
  });

  describe('signup', () => {
    it('should create user and wallet', async () => {
      // Arrange
      const dto = { name: 'Test', email: 'test@test.com', password: 'password123' };
      prisma.$transaction.mockResolvedValue({ id: '1', email: dto.email, name: dto.name });

      // Act
      const result = await service.signup(dto);

      // Assert
      expect(result.success).toBe(true);
      expect(result.user.email).toBe(dto.email);
    });

    it('should throw ConflictException on duplicate email', async () => {
      // Arrange
      const error = new Prisma.PrismaClientKnownRequestError('Unique constraint', { code: 'P2002', clientVersion: '1' });
      prisma.$transaction.mockRejectedValue(error);

      // Act & Assert
      await expect(service.signup({ name: 'Test', email: 'test@test.com', password: 'password123' }))
        .rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should return access token on valid credentials', async () => {
      // Arrange
      prisma.user.findUnique.mockResolvedValue({ id: '1', email: 'test@test.com', name: 'Test', password: 'hashed' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.generateAccessToken.mockReturnValue('token123');

      // Act
      const result = await service.login({ email: 'test@test.com', password: 'password123' });

      // Assert
      expect(result.accessToken).toBe('token123');
    });
  });
});
```

---

## Verification Checklist

After each change, run:

```bash
# Type check
cd apps/bank-webhook && npx tsc --noEmit

# Lint
cd apps/bank-webhook && npm run lint

# Unit tests
cd apps/bank-webhook && npm run test

# E2E tests
cd apps/bank-webhook && npm run test:e2e

# Build
cd apps/bank-webhook && npm run build

# Dev server
cd apps/bank-webhook && npm run dev

# Swagger UI
# Open http://localhost:3002/api/docs
```

---

## Summary of Files to Create

| Phase | File | Purpose |
|-------|------|---------|
| 1.3 | `src/common/filters/http-exception.filter.ts` | Global error handling |
| 1.4 | `src/common/interceptors/transform-response.interceptor.ts` | Response normalization |
| 2.1 | `src/main.ts` (modifications) | Swagger setup |
| 2.2 | `src/config/validation.schema.ts` | Env validation |
| 2.3 | `src/auth/jwt.service.ts` | JWT token management |
| 3.1 | `src/common/repository/base.repository.ts` | Base CRUD |
| 3.2 | `src/common/middleware/request-id.middleware.ts` | Request tracing |
| 3.3 | `src/common/decorators/current-user.decorator.ts` | User injection |

## Summary of Files to Modify

| Phase | File | Changes |
|-------|------|---------|
| 1.1 | All DTOs | Add `!` assertions |
| 1.2 | `src/auth/auth.repository.ts` | Remove or implement |
| 1.3 | `src/main.ts` | Register exception filter |
| 1.4 | `src/main.ts` | Register interceptor |
| 1.5 | `src/main.ts` | Update ValidationPipe |
| 2.1 | Controllers + DTOs | Swagger decorators |
| 2.2 | `src/app.module.ts` | Config validation |
| 2.3 | `src/auth/auth.module.ts`, `auth.service.ts` | Use JwtService |
| 2.4 | `wallet.service.ts`, `wallet.module.ts`, `transaction.module.ts` | Fix circular deps |

---

## Dependencies to Install

```bash
cd apps/bank-webhook && npm install @nestjs/swagger swagger-ui-express @nestjs/jwt joi uuid
cd apps/bank-webhook && npm install -D @types/uuid
```

---

This guide provides everything needed to implement the improvements. Each phase can be done independently and verified before moving to the next.