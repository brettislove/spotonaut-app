-- AlterTable: Add tier and credit columns to users table
ALTER TABLE "users" ADD COLUMN "tier" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "users" ADD COLUMN "maxCredits" INTEGER;
ALTER TABLE "users" ADD COLUMN "usedCredits" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "users" ADD COLUMN "creditsResetAt" TIMESTAMP(3);

-- Add comments for documentation
COMMENT ON COLUMN "users"."tier" IS '0=Sonda (Free), 1=Raketa (Paid), 2=Modul (Enterprise)';
COMMENT ON COLUMN "users"."maxCredits" IS 'NULL = unlimited (∞), otherwise specific credit limit';
COMMENT ON COLUMN "users"."usedCredits" IS 'Credits consumed by the user';
COMMENT ON COLUMN "users"."creditsResetAt" IS 'When credits reset for renewable tiers (e.g., monthly)';
