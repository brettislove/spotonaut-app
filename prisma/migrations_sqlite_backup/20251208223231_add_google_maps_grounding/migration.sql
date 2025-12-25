-- CreateTable
CREATE TABLE "google_maps_usage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "dailyLimit" INTEGER NOT NULL DEFAULT 500,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_analyses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "locationName" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "coordinates" JSONB,
    "metrics" JSONB NOT NULL,
    "productType" TEXT NOT NULL DEFAULT 'coffee',
    "operatingHours" INTEGER NOT NULL DEFAULT 40,
    "avgSpend" INTEGER NOT NULL DEFAULT 50,
    "timeframe" TEXT NOT NULL DEFAULT 'month',
    "aiSummary" TEXT NOT NULL DEFAULT '',
    "groundingSources" JSONB,
    "usedMapsGrounding" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "analyses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_analyses" ("aiSummary", "avgSpend", "coordinates", "createdAt", "id", "location", "locationName", "metrics", "operatingHours", "productType", "timeframe", "userId") SELECT "aiSummary", "avgSpend", "coordinates", "createdAt", "id", "location", "locationName", "metrics", "operatingHours", "productType", "timeframe", "userId" FROM "analyses";
DROP TABLE "analyses";
ALTER TABLE "new_analyses" RENAME TO "analyses";
CREATE INDEX "analyses_userId_idx" ON "analyses"("userId");
CREATE INDEX "analyses_createdAt_idx" ON "analyses"("createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "google_maps_usage_date_key" ON "google_maps_usage"("date");

-- CreateIndex
CREATE INDEX "google_maps_usage_date_idx" ON "google_maps_usage"("date");

-- CreateIndex
CREATE INDEX "google_maps_usage_archived_date_idx" ON "google_maps_usage"("archived", "date");

-- CreateIndex
CREATE INDEX "google_maps_usage_createdAt_idx" ON "google_maps_usage"("createdAt");
