# Feedback System Migration Instructions

This document contains instructions for deploying the feedback system to production.

## Development Environment (Already Applied)

The feedback system has been implemented and the database migration has been applied to your local development environment (SQLite).

## Production Environment Deployment

When you're ready to deploy to production (PostgreSQL), follow these steps:

### 1. Update Production Schema File

First, ensure `prisma/schema.production.prisma` includes the Feedback model. The model should match what's in `prisma/schema.prisma`:

```prisma
model Feedback {
  id           String   @id @default(cuid())
  userId       String? // Nullable for anonymous feedback
  analysisId   String? // Link to specific analysis
  rating       Int // 1-5 star rating
  comment      String? // Optional user comment
  feedbackType String? // "accuracy", "chat", "general"
  fingerprint  String? // For anonymous user tracking
  createdAt    DateTime @default(now())

  user     User?     @relation(fields: [userId], references: [id], onDelete: SetNull)
  analysis Analysis? @relation(fields: [analysisId], references: [id], onDelete: SetNull)

  @@index([userId])
  @@index([analysisId])
  @@index([createdAt])
  @@map("feedback")
}
```

Also update the User and Analysis models to include the feedbacks relation:

```prisma
model User {
  // ... existing fields ...
  feedbacks           Feedback[]
}

model Analysis {
  // ... existing fields ...
  feedbacks Feedback[]
}
```

### 2. Deploy Migration to Production

Run the following command in your production environment:

```bash
npx prisma migrate deploy
```

This will apply all pending migrations to your production database.

### 3. Verify Database

After deployment, verify the migration was successful:

```bash
npx prisma db pull
```

This will introspect your production database and confirm the feedback table exists with all the correct columns and indexes.

### 4. Generate Prisma Client

Ensure the Prisma Client is regenerated for production:

```bash
npx prisma generate
```

## Admin Access

To access the feedback dashboard:

1. Ensure your email is added to the `ADMIN_EMAILS` environment variable in your production environment
2. Navigate to: `https://your-domain.com/admin/feedback`

## Environment Variables

Make sure the following environment variables are set in production:

- `DATABASE_URL` - PostgreSQL connection string
- `ADMIN_EMAILS` - JSON array of admin emails, e.g., `["admin@example.com","admin2@example.com"]`

## Testing the Feedback System

After deployment:

1. Complete an analysis on your site
2. Click "Nová analýza" button
3. You should see the feedback modal appear (if it's been 7+ days since last feedback, or first time)
4. Submit feedback with a rating and optional comment
5. Verify the success toast appears: "Signál úspěšně přijat, díky za pomoc! 📡"
6. As an admin, visit `/admin/feedback` to see the submitted feedback

## Rollback Instructions

If you need to rollback the migration:

1. Identify the migration timestamp: `20241212_add_feedback` (or similar)
2. Run: `npx prisma migrate resolve --rolled-back <migration_name>`
3. Manually drop the feedback table if needed:
   ```sql
   DROP TABLE IF EXISTS feedback CASCADE;
   ```

## Notes

- Feedback is collected no more than once every 7 days per user (tracked via localStorage)
- Anonymous users can submit feedback (tracked by browser fingerprint)
- All feedback is retained indefinitely for long-term trend analysis
- The feedback modal appears before the "New Analysis" confirmation dialog
- Toast notifications auto-dismiss after 3 seconds
