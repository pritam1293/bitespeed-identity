# Quick Setup Guide

Follow these steps to get the Bitespeed Identity Reconciliation service up and running.

## Step 1: Install Dependencies

```bash
npm install
```

This will install:

- express (web framework)
- @prisma/client (database ORM)
- dotenv (environment variables)
- typescript (type safety)
- ts-node-dev (development server)

## Step 2: Set Up PostgreSQL Database (Railway)

**Using Railway - No Docker or Local Installation Required:**

1. Go to [Railway](https://railway.app)
2. Sign up with GitHub
3. Create new project → Add PostgreSQL
4. Click on PostgreSQL service → Go to "Connect" tab
5. Copy the **Connection URL** from the "Connection URL" field
   - Format: `postgresql://postgres:password@ballast.proxy.rlwy.net:port/railway`
6. Open `.env` file in your project and update the `DATABASE_URL`:

```env
DATABASE_URL="postgresql://postgres:your_password@ballast.proxy.rlwy.net:your_port/railway"
PORT=3000
NODE_ENV=development
```

> **Note:** The database URL is from Railway's public network connection.

## Step 3: Generate Prisma Client

```bash
npm run prisma:generate
```

This generates the Prisma client based on your schema.

## Step 4: Run Database Migrations

```bash
npx prisma migrate dev --name init
```

This will:

- Create the `Contact` table
- Set up the `LinkPrecedence` enum
- Create necessary indexes
- Set up foreign key constraints

## Step 5: Start the Development Server

```bash
npm run dev
```

You should see:

```
Database connected successfully
Server is running on port 3000
Health check: http://localhost:3000/api/health
Identify endpoint: http://localhost:3000/api/identify
```

## Step 6: Test the API

### Quick Health Check

```powershell
Invoke-RestMethod -Uri http://localhost:3000/api/health -UseBasicParsing
```

### Test Identity Endpoint

```powershell
$body = @{ email = "test@example.com"; phoneNumber = "1234567890" } | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost:3000/api/identify -Method Post -Body $body -ContentType "application/json" -UseBasicParsing
```

**Example Response:**

```json
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["test@example.com"],
    "phoneNumbers": ["1234567890"],
    "secondaryContactIds": []
  }
}
```

## Step 7: View Database (Optional)

```bash
npm run prisma:studio
```

This opens Prisma Studio in your browser to view and edit data.

---

## Production Deployment

### Build for Production

```bash
npm run build
```

### Run Production Server

```bash
npm start
```

### Environment Variables for Production

Update `.env` for production:

```
DATABASE_URL="your_production_database_url"
PORT=3000
NODE_ENV=production
```

---

## Troubleshooting

### Connection Error

- Verify Railway database is running
- Check DATABASE_URL is correctly copied from Railway
- Ensure the connection string includes the correct host and port

### Migration Error

- Make sure DATABASE_URL is set in `.env` file
- Run `npm run prisma:generate` first
- Check Railway database status in dashboard

### Port Already in Use (Windows)

Find and kill the process:

```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace <PID> with the process ID from above)
taskkill /PID <PID> /F
```

### Module Not Found

- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Run `npm run prisma:generate`

---

## Development Tips

1. **Auto-restart on changes**: The dev server uses `ts-node-dev` for hot reload

2. **View SQL queries**: Prisma logs queries in development mode

3. **Database GUI**: Use Prisma Studio (`npm run prisma:studio`) to view data

4. **TypeScript errors**: Run `npm run build` to check for type errors

5. **Test different scenarios**: See `TEST_EXAMPLES.md` for comprehensive test cases

---

## Project Structure

```
BiteSpeed/
├── src/
│   ├── controllers/         # Request handlers
│   │   └── contact.controller.ts
│   ├── services/            # Business logic
│   │   └── contact.service.ts
│   ├── routes/              # API routes
│   │   └── contact.routes.ts
│   ├── middlewares/         # Express middlewares
│   │   └── error.middleware.ts
│   ├── types/               # TypeScript types
│   │   └── index.ts
│   ├── prisma/              # Prisma client instance
│   │   └── client.ts
│   ├── app.ts               # Express app setup
│   └── server.ts            # Server entry point
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── migration.sql        # SQL migration reference
├── dist/                    # Built JavaScript (after build)
├── node_modules/            # Dependencies
├── .env                     # Environment variables
├── .gitignore
├── package.json
├── tsconfig.json
├── README.md
├── SETUP.md                 # This file
└── TEST_EXAMPLES.md         # Test scenarios
```

---

## Next Steps

After setup is complete:

1. ✅ Test all endpoints from `TEST_EXAMPLES.md`
2. ✅ Review the code structure and logic
3. ✅ Try different scenarios to understand reconciliation
4. ✅ Monitor Prisma Studio for database changes
5. ✅ Add your own features or modifications

---

## Support

For issues or questions:

- Check `TEST_EXAMPLES.md` for common scenarios
- Review error messages in console
- Verify database connection
- Ensure all dependencies are installed

Happy coding!
