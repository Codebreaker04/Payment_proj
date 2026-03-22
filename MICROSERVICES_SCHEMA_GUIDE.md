# Microservices-Ready Prisma Schema Design

## Problem with Current Schema
- Hard FK constraints (User → Wallet → Transaction)
- All must be in same database
- Cannot split into microservices

## Solution: Loose Coupling Pattern

### Option 1: Remove FK Constraints (Recommended for Microservices)

```prisma
// USER SERVICE - schema.prisma
model User {
  id       String  @id @default(uuid())
  email    String  @unique
  phone    String? @unique
  password String?
  name     String?
  
  // NO wallet relation - just store ID reference
  walletId String? // Reference only, no FK
  
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  deletedAt DateTime?
}

// WALLET/TRANSACTION SERVICE - schema.prisma
model Wallet {
  id      String  @id @default(uuid())
  userId  String  @unique // Reference to User service, NO FK constraint
  balance Decimal @default(0.0)

  // Relations within same service are OK
  senttransactions     Transaction[] @relation("SentTransactions")
  receivedtransactions Transaction[] @relation("ReceivedTransactions")

  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  deletedAt DateTime?
}

model Transaction {
  id         String @id @default(uuid())
  referenceId String @unique
  
  senderId   String?
  receiverId String?
  
  // Keep FK only within same service
  sender   Wallet? @relation("SentTransactions", fields: [senderId], references: [id])
  receiver Wallet? @relation("ReceivedTransactions", fields: [receiverId], references: [id])
  
  type   TransactionType
  status TransactionStatus
  
  description String?
  
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  deletedAt DateTime?
}
```

### Option 2: Event-Driven Architecture

```typescript
// User Service publishes events
userService.emit('user.created', { userId, email, phone });

// Wallet Service subscribes
walletService.on('user.created', async (data) => {
  await createWallet({ userId: data.userId, balance: 0 });
});
```

### Option 3: API Gateway Pattern

```typescript
// API Gateway aggregates data from multiple services
async function getUserWithWallet(userId: string) {
  const user = await userService.getUser(userId);
  const wallet = await walletService.getWalletByUserId(userId);
  return { ...user, wallet };
}
```

## Migration Strategy

### Phase 1: Prepare Current Monolith
```prisma
// Add indexes for future service split
model Wallet {
  userId  String  @unique
  
  @@index([userId]) // Ready for external queries
}

model Transaction {
  senderId   String?
  receiverId String?
  
  @@index([senderId])
  @@index([receiverId])
}
```

### Phase 2: Soft References
```prisma
// Remove @relation decorator but keep field
model User {
  id       String  @id @default(uuid())
  // ... other fields
  
  // wallet Wallet? // Remove this relation
  walletId String? // Keep as reference
}
```

### Phase 3: Separate Databases
```
User Service     -> users_db (User table)
Wallet Service   -> wallets_db (Wallet + Transaction tables)
```

## Recommended Approach for Your Schema

Since you have User → Wallet → Transaction, here's the split:

**Service 1: User Service**
- User model only
- Authentication/Authorization
- User profile management

**Service 2: Wallet Service**
- Wallet model
- Transaction model
- Keep Wallet → Transaction FK (same DB)
- Reference userId as string (no FK to User)

**Communication:**
```typescript
// Wallet Service validates user exists via API call
async createWallet(userId: string) {
  const userExists = await userServiceClient.checkUser(userId);
  if (!userExists) throw new Error('User not found');
  
  return prisma.wallet.create({
    data: { userId, balance: 0 }
  });
}
```

## Key Principles

1. **One Database per Service** - Each microservice owns its data
2. **No Shared Database** - Services communicate via APIs/events
3. **Eventual Consistency** - Accept some data sync delay
4. **Saga Pattern** - For distributed transactions
5. **Circuit Breaker** - Handle service failures gracefully

## When to Split?

- ✅ Split when: Different teams, scaling needs, deployment cycles
- ❌ Don't split if: Small team, simple app, premature optimization

## Your Next Steps

1. Add `@@index` to foreign key fields now
2. Remove Prisma relations when ready to split
3. Keep foreign keys as String references
4. Implement service-to-service communication
5. Use event bus (Kafka/RabbitMQ) for data sync
