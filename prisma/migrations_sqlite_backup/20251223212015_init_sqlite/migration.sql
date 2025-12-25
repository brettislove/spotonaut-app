-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_chat_usage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "promptCount" INTEGER NOT NULL DEFAULT 0,
    "requestPending" BOOLEAN NOT NULL DEFAULT false,
    "quota" INTEGER NOT NULL DEFAULT 3,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_chat_usage" ("createdAt", "id", "promptCount", "quota", "updatedAt", "userId") SELECT "createdAt", "id", "promptCount", "quota", "updatedAt", "userId" FROM "chat_usage";
DROP TABLE "chat_usage";
ALTER TABLE "new_chat_usage" RENAME TO "chat_usage";
CREATE UNIQUE INDEX "chat_usage_userId_key" ON "chat_usage"("userId");
CREATE INDEX "chat_usage_userId_idx" ON "chat_usage"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
