# Setup

## Local development

```bash
npm install
cp .env.example .env
npm run db:generate
npm run db:migrate
npm run dev
```

Local dev uses SQLite (`prisma/dev.db`), so no external database is required. See [`.env.example`](../.env.example) for the full list of environment variables — at minimum you'll need `GOOGLE_GENERATIVE_AI_API_KEY` and `GOOGLE_MAPS_API_KEY`.

Other useful scripts: `npm run db:studio` (browse the database), `npm run db:push` (sync schema without a migration), `npm run lint`.

## Production (Vercel + PostgreSQL)

The project keeps two Prisma schemas — `prisma/schema.prisma` (SQLite, used locally) and `prisma/schema.production.prisma` (PostgreSQL). `npm run prepare:prod` swaps to the PostgreSQL schema and regenerates the client; `npm run restore:dev` swaps back.

To deploy:

1. `npm run prepare:prod`
2. Set the production environment variables in the Vercel dashboard (`DATABASE_URL`, `NEXTAUTH_SECRET`, `IP_HASH_SECRET`, `CRON_SECRET`, Google OAuth/AI/Maps keys, `RESEND_API_KEY`, `ADMIN_EMAILS`, Stripe keys)
3. `npm run db:deploy` to apply migrations
4. Deploy (Vercel does this automatically on push)
5. `npm run restore:dev` locally afterwards

All payments go through Stripe's hosted checkout — the app never handles raw card data.
