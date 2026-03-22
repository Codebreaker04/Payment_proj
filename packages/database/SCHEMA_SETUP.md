# Prisma Schema Setup Guide

## Schema File

### **schema.prisma** - Single schema with loose coupling
- All models in one database (for now)
- NO FK constraint between User and Wallet
- Ready to split into microservices when needed
- Can be separated later by copying User model to one service and Wallet+Transaction to another

## Environment Variables

```env
DATABASE_URL="postgresql://user:password@localhost:5432/payment_db"
```

## Usage

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name microservices_ready

# Push schema without migrations
npx prisma db push

# Validate schema
npx prisma validate
```

## Key Changes from Original

✅ **Removed:**
- `User.wallet` relation field
- `Wallet.user` FK constraint
- Hard coupling between services

✅ **Added:**
- `amount` field to Transaction
- Indexes for performance
- Table name mappings (`@@map`)
- `onDelete: SetNull` for safe deletions
- Separate schemas for each service

✅ **Improved:**
- Consistent casing (camelCase)
- Better decimal precision
- Query optimization indexes

## Service Communication

Since User and Wallet are decoupled, use API calls:

```typescript
// Wallet Service - Validate user before creating wallet
async function createWallet(userId: string) {
  // Call User Service API
  const userExists = await fetch(`http://user-service/api/users/${userId}`);
  if (!userExists) throw new Error('User not found');
  
  return prisma.wallet.create({
    data: { userId, balance: 0 }
  });
}

// API Gateway - Aggregate data
async function getUserWithWallet(userId: string) {
  const [user, wallet] = await Promise.all([
    userService.getUser(userId),
    walletService.getWalletByUserId(userId)
  ]);
  
  return { ...user, wallet };
}
```

## Migration Path

1. **Now:** Use `schema.prisma` (monolith, loose coupling)
2. **Later:** Split into services using separate schemas
3. **Deploy:** Each service with its own database

## Testing

```bash
# Test current monolith schema
npx prisma validate

# Test microservices schemas
npx prisma validate --schema=./prisma/schema-user-service.prisma
npx prisma validate --schema=./prisma/schema-wallet-service.prisma
```
