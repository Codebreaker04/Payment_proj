# Bank Webhook Application

A NestJS application that handles all bank transactions via webhooks.

## Features

- ✅ Transaction processing endpoint
- ✅ Get all transactions
- ✅ Get transaction by ID
- ✅ Webhook verification
- ✅ Environment configuration with .env
- ✅ CORS enabled
- ✅ Health check endpoint

## Environment Variables

All secrets are stored in `.env` file:

```
PORT=3001
WEBHOOK_SECRET=bank_webhook_secret_key_12345
DATABASE_URL=postgresql://user:password@localhost:5432/bankdb
API_KEY=your_api_key_here
JWT_SECRET=jwt_secret_key_for_authentication
BANK_API_URL=https://api.bank.com
```

## API Endpoints

### Root
- `GET /` - Welcome message
- `GET /health` - Health check

### Webhook Endpoints
- `POST /webhook/transaction` - Process a transaction
- `GET /webhook/transactions` - Get all transactions
- `GET /webhook/transaction/:id` - Get transaction by ID
- `POST /webhook/verify` - Verify webhook signature

## Running the Application

```bash
# Development
npm run dev

# Production
npm run build
npm run start:prod
```

## Transaction Example

```json
POST /webhook/transaction
{
  "amount": 100.50,
  "currency": "USD",
  "from": "account123",
  "to": "account456",
  "type": "transfer"
}
```

## Response Format

```json
{
  "success": true,
  "message": "Transaction processed successfully",
  "transaction": {
    "id": "txn_1234567890_abcdefghi",
    "amount": 100.50,
    "currency": "USD",
    "from": "account123",
    "to": "account456",
    "type": "transfer",
    "status": "processed",
    "timestamp": "2026-01-25T09:42:00.000Z"
  }
}
```
