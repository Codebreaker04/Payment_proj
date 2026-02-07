# 🚀 PayPro - Quick Start Guide

## ⚡ Start in 30 Seconds

```bash
# 1. Clone & Navigate
cd Payment_proj

# 2. Start Everything
./start.sh

# 3. Access Application
# Frontend: http://localhost:3000
# Backend:  http://localhost:3001
```

## 📋 What You Get

### Frontend (http://localhost:3000)
- **Homepage** - Feature overview
- **/dashboard** - View balance & transactions
- **/transfer** - Send money to others

### Backend (http://localhost:3001)
```bash
GET  /wallet/balance/:userId       # Get balance
GET  /wallet/transactions/:userId  # Transaction history
POST /webhook/transaction          # Send money
```

## 🔧 Common Commands

```bash
# View Logs
docker-compose logs -f

# Restart Service
docker-compose restart user-app

# Stop Everything
docker-compose down

# Start Fresh (delete all data)
docker-compose down -v && ./start.sh
```

## 📦 What's Included

✅ Next.js Frontend (React 19, TailwindCSS 4)  
✅ NestJS Backend (TypeScript, Prisma)  
✅ PostgreSQL Database  
✅ Docker Setup  
✅ Transaction Management  
✅ Wallet System  

## 🎯 Test the API

```bash
# Get balance
curl http://localhost:3001/wallet/balance/user-123

# Get transactions
curl http://localhost:3001/wallet/transactions/user-123

# Send money
curl -X POST http://localhost:3001/webhook/transaction \
  -H "Content-Type: application/json" \
  -d '{
    "recieverId": "user-456",
    "amount": 50,
    "paymentMethod": "P2P",
    "currency": "USD",
    "idempotencyKey": "txn-123"
  }'
```

## 📚 More Documentation

- `SETUP_COMPLETE.md` - Complete feature list
- `README_DEPLOYMENT.md` - Deployment guide
- `docker-compose.yml` - Service configuration

---

**Questions?** Check the docs or run `docker-compose logs -f`
