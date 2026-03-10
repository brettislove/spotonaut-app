-- Create enums for billing
CREATE TYPE "BillingInterval" AS ENUM ('month', 'year');
CREATE TYPE "BillingStatus" AS ENUM (
  'active',
  'trialing',
  'past_due',
  'canceled',
  'unpaid',
  'incomplete',
  'incomplete_expired'
);

-- Alter users table for Stripe customer linkage
ALTER TABLE "users"
ADD COLUMN "stripeCustomerId" TEXT;

CREATE UNIQUE INDEX "users_stripeCustomerId_key" ON "users"("stripeCustomerId");

-- Billing subscriptions
CREATE TABLE "billing_subscriptions" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "stripeSubscriptionId" TEXT NOT NULL,
  "stripeCustomerId" TEXT NOT NULL,
  "stripePriceId" TEXT NOT NULL,
  "tier" INTEGER NOT NULL,
  "interval" "BillingInterval" NOT NULL,
  "currency" TEXT NOT NULL,
  "status" "BillingStatus" NOT NULL,
  "currentPeriodStart" TIMESTAMP(3),
  "currentPeriodEnd" TIMESTAMP(3),
  "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "billing_subscriptions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "billing_subscriptions_stripeSubscriptionId_key" ON "billing_subscriptions"("stripeSubscriptionId");
CREATE INDEX "billing_subscriptions_userId_idx" ON "billing_subscriptions"("userId");
CREATE INDEX "billing_subscriptions_status_idx" ON "billing_subscriptions"("status");
CREATE INDEX "billing_subscriptions_stripeCustomerId_idx" ON "billing_subscriptions"("stripeCustomerId");

ALTER TABLE "billing_subscriptions"
ADD CONSTRAINT "billing_subscriptions_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Webhook idempotency and audit trail
CREATE TABLE "billing_webhook_events" (
  "id" TEXT NOT NULL,
  "stripeEventId" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "payload" JSONB,
  "processedAt" TIMESTAMP(3),
  "processingError" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "billing_webhook_events_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "billing_webhook_events_stripeEventId_key" ON "billing_webhook_events"("stripeEventId");
CREATE INDEX "billing_webhook_events_eventType_idx" ON "billing_webhook_events"("eventType");
CREATE INDEX "billing_webhook_events_processedAt_idx" ON "billing_webhook_events"("processedAt");