# 🚀 Quick Start Guide

## Local Development (Current Setup)

Your project is configured to use **SQLite for local development**. Everything is ready to go!

### Start Developing Now

```bash
# 1. Install dependencies (if not already done)
npm install

# 2. Generate Prisma Client
npm run db:generate

# 3. Run migrations
npm run db:migrate

# 4. Start development server
npm run dev
```

Visit `http://localhost:3000` - your app is running with SQLite!

### Database Commands

```bash
npm run db:studio      # View database in browser
npm run db:migrate     # Create/apply migrations
npm run db:generate    # Regenerate Prisma Client
```

---

## Production Deployment

### One-Command Preparation

```bash
npm run prepare:prod
```

This switches your schema from SQLite to PostgreSQL for production.

### Deploy to Vercel (Recommended)

1. **Push your code to GitHub**

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Add Vercel Postgres**
   - In your Vercel project → Storage → Create Database → Postgres
   - Vercel automatically sets `DATABASE_URL` for you

4. **Set Environment Variables**
   In Vercel project settings → Environment Variables:
   ```
   NEXTAUTH_URL=https://your-app.vercel.app
   NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
   GOOGLE_CLIENT_ID=<from Google Cloud Console>
   GOOGLE_CLIENT_SECRET=<from Google Cloud Console>
   GOOGLE_GENERATIVE_AI_API_KEY=<your existing key>
   RESEND_API_KEY=<from resend.com>
   ```

5. **Deploy Migrations**
   Add this to your `package.json` build script or run manually:
   ```bash
   npm run db:deploy
   ```

6. **Deploy!**
   - Vercel will automatically deploy on push
   - Or click "Deploy" in Vercel dashboard

### Return to Local Development

```bash
npm run restore:dev
```

---

## Database Setup Summary

| Environment | Database | Schema File |
|-------------|----------|-------------|
| **Local Development** | SQLite (`prisma/dev.db`) | `prisma/schema.prisma` (SQLite) |
| **Production** | PostgreSQL (Vercel/Prisma) | `prisma/schema.production.prisma` |

**Scripts handle the switching automatically!**

---

## Need Help?

- **Local setup issues**: See `DATABASE_SETUP.md`
- **Production deployment**: See `DEPLOYMENT.md` and `SETUP_GUIDE.md`
- **Environment variables**: See `.env.production` for template

---

## Quick Troubleshooting

### "PrismaClient is not configured"
```bash
npm run db:generate
```

### "Migration failed"
```bash
# For local development (SQLite)
npm run restore:dev

# For production (PostgreSQL)
npm run prepare:prod
```

### Database not found
```bash
# Recreate local database
npm run db:migrate
```

---

**You're all set! Happy coding! 🎉**
