# Database Setup Guide

This project uses **SQLite for local development** and **PostgreSQL (Prisma Postgres) for production**.

## ⚙️ Configuration

Database connection URLs are managed through both `prisma.config.ts` (for environment loading) and the schema `url` property.

## 🛠️ Local Development Setup

### 1. Use SQLite Database

Your local development uses SQLite, which requires no additional setup.

```bash
# Generate Prisma Client
npm run db:generate

# Create database and run migrations
npm run db:migrate

# (Optional) View database in Prisma Studio
npm run db:studio
```

### 2. Environment Variables

The `.env` file is configured for local SQLite development:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="development-secret-change-in-production"
GOOGLE_GENERATIVE_AI_API_KEY="your-api-key-here"
```

### 3. Start Development Server

```bash
npm run dev
```

Your app will use the SQLite database at `prisma/dev.db`.

---

## 🚀 Production Deployment

### 1. Switch to PostgreSQL Schema

For production deployment, you need to use the PostgreSQL schema:

```bash
# Copy production schema to main schema file
cp prisma/schema.production.prisma prisma/schema.prisma

# Generate Prisma Client for PostgreSQL
npx prisma generate
```

### 2. Set Environment Variables

In your deployment platform (Vercel, Railway, etc.), set:

```env
DATABASE_URL="postgresql://..." # Your Prisma Postgres connection string
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-secure-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_GENERATIVE_AI_API_KEY="your-api-key"
RESEND_API_KEY="your-resend-api-key"
```

### 3. Deploy Database Migrations

```bash
# Deploy migrations to production (use in CI/CD or manually)
npx prisma migrate deploy
```

---

## 📋 Quick Reference

### Database Commands

```bash
# Generate Prisma Client (after schema changes)
npm run db:generate

# Create and apply migrations (development)
npm run db:migrate

# Push schema changes without migrations (development only)
npm run db:push

# View database in browser UI
npm run db:studio

# Deploy migrations (production)
npx prisma migrate deploy
```

### Schema Files

- `prisma/schema.prisma` - **SQLite schema for local development**
- `prisma/schema.production.prisma` - **PostgreSQL schema for production** (backup/reference)

### Environment Files

- `.env` - Local development (SQLite)
- `.env.local` - Local overrides (git-ignored, for sensitive keys)
- `.env.production` - Production template (not committed, set in deployment platform)

---

## 🔄 Switching Between Databases

### From SQLite (dev) to PostgreSQL (prod):

```bash
# 1. Backup your current schema
cp prisma/schema.prisma prisma/schema.dev.prisma

# 2. Use production schema
cp prisma/schema.production.prisma prisma/schema.prisma

# 3. Update DATABASE_URL to PostgreSQL connection string
# Edit .env or set environment variable

# 4. Generate client and deploy
npx prisma generate
npx prisma migrate deploy
```

### From PostgreSQL (prod) to SQLite (dev):

```bash
# 1. Use development schema
cp prisma/schema.dev.prisma prisma/schema.prisma
# OR just revert schema.prisma to SQLite provider

# 2. Update DATABASE_URL back to SQLite
# Edit .env: DATABASE_URL="file:./dev.db"

# 3. Generate client and migrate
npx prisma generate
npx prisma migrate dev
```

---

## ⚠️ Important Notes

1. **Never commit `.env.local`** - Contains sensitive API keys
2. **SQLite limitations** - SQLite doesn't support `@db.Text`, that's why we removed it
3. **Production builds** - Make sure to use PostgreSQL schema before deploying
4. **Migration history** - Keep `prisma/migrations/` in git for production deployments

---

## 🐛 Troubleshooting

### "PrismaClient is not configured"
```bash
npx prisma generate
```

### "Migration failed" on SQLite
SQLite doesn't support all PostgreSQL features. Make sure you're using the correct schema file.

### "Database connection error" in production
Verify your `DATABASE_URL` is set correctly in your deployment platform's environment variables.
