# PayPro - Complete Payment Application

A full-stack payment application with wallet management, P2P transfers, and transaction tracking.

## 🏗️ Architecture

- **user-app**: Next.js frontend application (Port 3000)
- **bank-webhook**: NestJS backend API (Port 3001)
- **PostgreSQL**: Database (Port 5432)

## 🚀 Quick Start

### Using Docker (Recommended)

```bash
# Clone the repository
git clone <repo-url>
cd Payment_proj

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Services will be available at:
- User App: http://localhost:3000
- Bank API: http://localhost:3001
- PostgreSQL: localhost:5432

### Local Development

```bash
# Install dependencies
npm install

# Setup database
cd packages/database
npx prisma migrate dev
npx prisma generate

# Start PostgreSQL (if not using Docker)
docker run -d -p 5432:5432 \
  -e POSTGRES_USER=user \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=payments \
  postgres:15-alpine

# Start backend
cd apps/bank-webhook
npm run dev

# Start frontend (in another terminal)
cd apps/user-app
npm run dev
```

## 📦 Tech Stack

### Frontend (user-app)
- Next.js 16
- React 19
- TailwindCSS 4
- TypeScript
- NextAuth (Authentication)

### Backend (bank-webhook)
- NestJS
- Prisma ORM
- PostgreSQL
- TypeScript

### Database Schema
- **User**: User accounts
- **Wallet**: User wallet balances (loosely coupled for microservices)
- **Transaction**: P2P transfers, credits, debits

## 🔑 Key Features

### User App
- ✅ Dashboard with wallet balance
- ✅ Recent transaction history
- ✅ P2P money transfers
- ✅ Real-time balance updates
- ✅ Transaction status tracking

### Bank Webhook API
- ✅ Wallet balance checks
- ✅ Transaction creation with atomic updates
- ✅ Transaction history
- ✅ RESTful API endpoints
- ✅ Database transaction support

## 📡 API Endpoints

### Wallet Endpoints
```
GET  /wallet/balance/:userId      - Get user wallet balance
GET  /wallet/transactions/:userId - Get transaction history
```

### Transaction Endpoints
```
POST /webhook/transaction         - Create P2P transaction
GET  /webhook/transaction/:id     - Get transaction by ID
GET  /webhook/transactions        - Get all transactions
POST /webhook/verify              - Verify webhook
```

## 🔒 Environment Variables

### user-app (.env)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
DATABASE_URL=postgresql://user:password@localhost:5432/payments
JWT_SECRET=your_jwt_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

### bank-webhook (.env)
```env
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/payments
WEBHOOK_SECRET=bank_webhook_secret_key_12345
JWT_SECRET=jwt_secret_key_for_authentication
API_KEY=your_api_key_here
```

## 🐳 Docker Commands

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f [service-name]

# Restart service
docker-compose restart [service-name]

# Stop all services
docker-compose down

# Remove volumes (clean database)
docker-compose down -v
```

## 📝 Database Migrations

```bash
cd packages/database

# Create new migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate

# Reset database (development only)
npx prisma migrate reset
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific app tests
npm test --workspace=user-app
npm test --workspace=bank-webhook
```

## 🔧 Development

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Run linter
npm run lint

# Type check
npm run check-types
```

## 📚 Project Structure

```
Payment_proj/
├── apps/
│   ├── user-app/          # Next.js frontend
│   │   ├── app/           # App router pages
│   │   ├── lib/           # Utility functions & API client
│   │   └── dockerfile
│   └── bank-webhook/      # NestJS backend
│       ├── src/
│       │   ├── transaction/
│       │   ├── wallet/
│       │   └── prisma/
│       └── dockerfile
├── packages/
│   ├── database/          # Prisma schema & client
│   ├── ui/                # Shared UI components
│   └── recoil/            # State management
├── docker-compose.yml
└── turbo.json
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

## 📄 License

MIT

## 👥 Authors

- Your Name
