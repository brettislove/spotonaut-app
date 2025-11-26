# Deployment Guide - Vercel with Postgres

## Prerequisites
- Vercel account
- GitHub repository connected to Vercel

## Steps to Deploy

### 1. Install Vercel Postgres Package
```bash
npm install @vercel/postgres
```

### 2. Deploy to Vercel
```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Deploy
vercel
```

### 3. Add Vercel Postgres Storage

1. Go to your project dashboard on [vercel.com](https://vercel.com)
2. Navigate to the **Storage** tab
3. Click **Create Database**
4. Select **Postgres**
5. Click **Connect**

Vercel will automatically add these environment variables to your project:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL` 
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_URL_NO_SSL`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

### 4. Update Environment Variables

In your Vercel project settings, add/update:

```bash
DATABASE_URL=$POSTGRES_PRISMA_URL
DIRECT_URL=$POSTGRES_URL_NON_POOLING
```

**Important:** Use `POSTGRES_PRISMA_URL` for `DATABASE_URL` as it includes connection pooling which is essential for serverless.

### 5. Run Prisma Migrations

After connecting the database, you need to push your schema:

```bash
# Option 1: Push schema (for development/first deployment)
npx prisma db push

# Option 2: Create and run migrations (recommended for production)
npx prisma migrate deploy
```

You can run these commands locally after setting up your local environment with the production database URL, or add them to your build command in Vercel.

### 6. Update Build Command (Optional)

In your Vercel project settings, update the build command to include Prisma generation:

```bash
npx prisma generate && next build
```

## Local Development with Production Database

If you want to test with the production database locally:

1. Pull the environment variables from Vercel:
```bash
vercel env pull .env.local
```

2. Update your `.env.local`:
```bash
DATABASE_URL=$POSTGRES_PRISMA_URL
DIRECT_URL=$POSTGRES_URL_NON_POOLING
```

## Switching Between SQLite (Dev) and Postgres (Production)

The schema is now configured for PostgreSQL. For local development, you have two options:

### Option A: Use PostgreSQL Locally
Install PostgreSQL locally and update your `.env`:
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/spotonaut"
DIRECT_URL="postgresql://user:password@localhost:5432/spotonaut"
```

### Option B: Keep Using SQLite for Local Development
You can temporarily switch back to SQLite for local development:

1. In `prisma/schema.prisma`, change:
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
  // directUrl = env("DIRECT_URL")  // Comment this out for SQLite
}
```

2. In `.env`:
```bash
DATABASE_URL="file:./dev.db"
```

**Remember:** Always use PostgreSQL schema for production deployments.

## Troubleshooting

### Migration Issues
If you encounter migration errors:
```bash
npx prisma migrate reset  # Only for development!
npx prisma db push
```

### Connection Pooling
Vercel Postgres uses connection pooling by default. Always use `POSTGRES_PRISMA_URL` for Prisma connections.

### Environment Variables Not Loading
Ensure you've redeployed after adding environment variables in Vercel dashboard.

## Additional Resources
- [Vercel Postgres Docs](https://vercel.com/docs/storage/vercel-postgres)
- [Prisma Vercel Guide](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
