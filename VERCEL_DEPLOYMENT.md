# Vercel Deployment Guide

Complete guide to deploy your Bitespeed Identity Reconciliation service to Vercel.

## Prerequisites

- Vercel account (sign up at [vercel.com](https://vercel.com))
- GitHub account
- Railway PostgreSQL database (already set up)

## Step 1: Prepare Your Project

The project is already configured for Vercel with:

- ✅ `vercel.json` - Vercel configuration
- ✅ `src/server.ts` - Updated to export app for serverless
- ✅ `.gitignore` - Excludes Vercel files

## Step 2: Upload Project to GitHub

Before deploying to Vercel, ensure your project is hosted on GitHub. If you haven't uploaded your code yet, please refer to GitHub's official documentation for comprehensive instructions:

**📚 [GitHub: Uploading a Project Guide](https://docs.github.com/en/get-started/start-your-journey/uploading-a-project-to-github)**

This guide covers:

- Creating a new repository on GitHub
- Initializing Git in your local project
- Connecting your local repository to GitHub
- Pushing your code to the remote repository

Once your repository is live on GitHub, proceed to the next step.

## Step 3: Deploy to Vercel

### Option A: Using Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure your project:
   - **Framework Preset:** Other
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

5. **Add Environment Variables:**
   - Click **"Environment Variables"**
   - Add the following:
     ```
     DATABASE_URL = postgresql://postgres:xxx@ballast.proxy.rlwy.net:xxxxx/railway
     NODE_ENV = production
     ```
   - Get `DATABASE_URL` from your Railway dashboard

6. Click **"Deploy"**

### Option B: Using Vercel CLI

1. Install Vercel CLI:

```powershell
npm install -g vercel
```

2. Login to Vercel:

```powershell
vercel login
```

3. Deploy:

```powershell
vercel
```

4. Follow the prompts and add environment variables when asked

## Step 4: Test Your Deployment

Once deployed, Vercel will provide you with a unique live URL for your API.

**Example:** My live deployment is at: `https://bitespeed-olive.vercel.app`

Test the endpoints:

```powershell
# Health check
Invoke-RestMethod -Uri https://bitespeed-olive.vercel.app/api/health -UseBasicParsing

# Test identify endpoint
$body = @{ email = "test@example.com"; phoneNumber = "1234567890" } | ConvertTo-Json
Invoke-RestMethod -Uri https://bitespeed-olive.vercel.app/api/identify -Method Post -Body $body -ContentType "application/json" -UseBasicParsing
```

## Important Notes

### Database Connection

- Make sure your Railway database allows connections from Vercel's IP ranges
- Railway's public network connection works by default with Vercel
- Your `DATABASE_URL` environment variable on Vercel must match your Railway connection string

### Vercel Limitations

- **Serverless functions timeout:** 10 seconds (Hobby), 60 seconds (Pro)
- **Cold starts:** First request after inactivity may be slower
- **Region:** Choose region close to your Railway database for better performance

### Environment Variables

On Vercel Dashboard → Your Project → Settings → Environment Variables, you need:

| Variable       | Value                                | Example                                                          |
| -------------- | ------------------------------------ | ---------------------------------------------------------------- |
| `DATABASE_URL` | Railway PostgreSQL connection string | `postgresql://postgres:xxx@ballast.proxy.rlwy.net:xxxxx/railway` |
| `NODE_ENV`     | `production`                         | `production`                                                     |

### Prisma Considerations

Vercel automatically runs `prisma generate` during build. If you need to run migrations:

```powershell
# Run migrations on Railway database
npx prisma migrate deploy
```

**Note:** Don't run `prisma migrate dev` in production. Use `prisma migrate deploy` instead.

## Troubleshooting

### Build Fails

**Error: `Cannot find module '@prisma/client'`**

Solution: Make sure `@prisma/client` is in `dependencies`, not `devDependencies`:

```json
"dependencies": {
  "@prisma/client": "^5.9.1",
  ...
}
```

### Database Connection Timeouts

**Error: `Can't reach database server`**

Solutions:

- Verify `DATABASE_URL` is correctly set in Vercel environment variables
- Check Railway database is running and accessible
- Ensure no typos in connection string

### Function Timeout

**Error: `FUNCTION_INVOCATION_TIMEOUT`**

Solutions:

- Optimize database queries
- Add database indexes (already included in schema)
- Consider upgrading to Vercel Pro for 60s timeout

### Cold Starts

First request after inactivity is slow:

- Expected behavior for serverless
- Consider keeping the service warm with periodic health checks
- Or upgrade to Vercel Pro for better performance

## Continuous Deployment

Once set up, Vercel automatically:

- ✅ Deploys when you push to main branch
- ✅ Creates preview deployments for PRs
- ✅ Runs build and tests
- ✅ Updates production when builds succeed

## Production Checklist

Before going live:

- [ ] Test all endpoints on Vercel deployment
- [ ] Verify database connection works
- [ ] Test primary/secondary contact linking
- [ ] Check error handling returns proper responses
- [ ] Run comprehensive tests from `TEST_RESULTS.md`
- [ ] Monitor Vercel dashboard for errors
- [ ] Set up custom domain (optional)

## Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Wait for DNS propagation

## Monitoring

Vercel provides:

- **Runtime Logs:** View function execution logs
- **Analytics:** Track requests and performance
- **Deployments:** View deployment history

Access from: Vercel Dashboard → Your Project → Logs/Analytics

## Rollback

If something goes wrong:

1. Go to Vercel Dashboard → Your Project → Deployments
2. Find the last working deployment
3. Click **"..."** → **"Promote to Production"**

---

## Summary

You've successfully deployed your Bitespeed Identity Reconciliation service to Vercel! 🎉

**Your API is now live!** Vercel will provide you with a unique URL for your deployment.

**Example:** My live API is at: `https://bitespeed-olive.vercel.app`

**Endpoints:**

- Health: `GET /api/health`
- Identify: `POST /api/identify`

**Example with my live URL:**

- Health: `GET https://bitespeed-olive.vercel.app/api/health`
- Identify: `POST https://bitespeed-olive.vercel.app/api/identify`

**Next Steps:**

- Share your API URL
- Integrate with frontend applications
- Set up monitoring and alerts
- Consider upgrading for better performance

Happy deploying!
