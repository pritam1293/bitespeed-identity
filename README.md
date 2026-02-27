# Bitespeed Identity Reconciliation Service

A backend service for managing contact identity reconciliation with support for linking contacts based on email and phone number.

## Prerequisites

- Node.js (v18 or higher)
- Railway PostgreSQL database (or any cloud PostgreSQL provider)
- npm

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file and add your Railway PostgreSQL connection URL:

```env
DATABASE_URL="postgresql://postgres:password@ballast.proxy.rlwy.net:port/railway"
PORT=3000
NODE_ENV=development
```

Get the connection URL from Railway:

- Go to your Railway project → PostgreSQL service
- Click "Connect" tab
- Copy the "Connection URL"

3. Generate Prisma client:

```bash
npm run prisma:generate
```

4. Run database migrations:

```bash
npx prisma migrate dev --name init
```

## Running the Application

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```

## API Endpoints

### POST /identify

Identifies and reconciles contact information.

**Request Body:**

```json
{
  "email": "string (optional)",
  "phoneNumber": "string (optional)"
}
```

**Response:**

```json
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["primary@example.com", "secondary@example.com"],
    "phoneNumbers": ["+1234567890", "+0987654321"],
    "secondaryContactIds": [2, 3]
  }
}
```

**Example PowerShell request:**

```powershell
$body = @{ email = "test@example.com"; phoneNumber = "+1234567890" } | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost:3000/api/identify -Method Post -Body $body -ContentType "application/json" -UseBasicParsing
```

## Database Schema

The `Contact` table includes:

- `id`: Primary key (auto-increment)
- `phoneNumber`: String (nullable)
- `email`: String (nullable)
- `linkedId`: Foreign key to Contact (nullable)
- `linkPrecedence`: Enum ("primary", "secondary")
- `createdAt`: Timestamp
- `updatedAt`: Timestamp
- `deletedAt`: Timestamp (nullable, soft delete)

## Architecture

```
src/
├── controllers/     # Request handlers
├── services/        # Business logic
├── routes/          # API routes
├── middlewares/     # Error handling, validation
├── types/           # TypeScript interfaces
├── prisma/          # Prisma client instance
├── app.ts           # Express app configuration
└── server.ts        # Server entry point
```

## Features

- ✅ Contact identity reconciliation
- ✅ Automatic primary/secondary linking
- ✅ Transaction-based operations
- ✅ Soft delete support
- ✅ Production-ready error handling
- ✅ TypeScript type safety
- ✅ Clean architecture

## License

ISC
