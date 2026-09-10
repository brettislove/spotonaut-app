# Spotonaut

Spotonaut helps entrepreneurs decide where to open a physical business (cafés, shops, vending machines, etc.) by analyzing a candidate location with AI — combining foot-traffic signals, nearby competition, and demographic data pulled from Google Maps into a single readiness report.

## Features

- **AI location analysis** — submit an address and get an AI-generated report on viability, competition, and demand signals (Google Generative AI + Google Maps Places API)
- **Chat-based refinement** — follow up on a report through a conversational interface
- **Auth** — email/password and OAuth (Google) via NextAuth
- **Billing** — subscription tiers and credit consumption via Stripe
- **Admin dashboard** — usage, feedback, traffic, and chat analytics
- **Blog & marketing pages** — localized (Czech/English) content, SEO-oriented static pages
- **Multi-currency pricing** (CZK/EUR)

## Tech stack

- [Next.js 16](https://nextjs.org/) (App Router) + React 19 + TypeScript
- [Prisma](https://www.prisma.io/) (PostgreSQL in production, SQLite for local dev)
- [NextAuth](https://authjs.dev/) for authentication
- [Stripe](https://stripe.com/) for billing
- Tailwind CSS 4
- Google Generative AI + Google Maps Platform APIs

## Getting started

```bash
npm install
cp .env.example .env   # fill in the required keys, see below
npm run db:migrate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Required environment variables

See [`.env.example`](.env.example) for the full list. At minimum, local development needs:

- `DATABASE_URL` — defaults to a local SQLite file
- `GOOGLE_GENERATIVE_AI_API_KEY` — for AI-generated analyses
- `GOOGLE_MAPS_API_KEY` — for location/places data

Stripe and admin-email variables are only required for billing and admin-panel features.

## Project structure

- `app/` — routes (App Router), including `app/api/*` for backend endpoints
- `prisma/` — schema and migrations
- `_posts/` — blog content (Markdown, cs/en)
- `scripts/` — local dev ↔ production schema switching helpers

## Documentation

See [docs/SETUP.md](docs/SETUP.md) for local development and production deployment.

## Author

Bretislav Dancak — [GitHub](https://github.com/brettislove)

## License

All rights reserved. This code is shared for portfolio/review purposes only; no license is granted to use, copy, modify, or distribute it.
