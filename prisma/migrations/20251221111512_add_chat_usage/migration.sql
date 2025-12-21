-- CreateTable
CREATE TABLE "chat_usage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "promptCount" INTEGER NOT NULL DEFAULT 0,
    "quota" INTEGER NOT NULL DEFAULT 3,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "chat_usage_userId_key" ON "chat_usage"("userId");

-- CreateIndex
CREATE INDEX "chat_usage_userId_idx" ON "chat_usage"("userId");
