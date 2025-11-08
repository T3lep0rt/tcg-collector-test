-- CreateTable
CREATE TABLE "UserCard" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "condition" TEXT DEFAULT 'Near Mint',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserCard_pkey" PRIMARY KEY ("id")
);

-- Migrate existing card ownership data to UserCard table
-- Only migrate cards that have a userId set (owned cards)
INSERT INTO "UserCard" ("id", "userId", "cardId", "quantity", "condition", "notes", "createdAt", "updatedAt")
SELECT
    gen_random_uuid(),
    "userId",
    "cardId",
    COALESCE("quantity", 1),
    COALESCE("condition", 'Near Mint'),
    "notes",
    "createdAt",
    "updatedAt"
FROM "Card"
WHERE "userId" IS NOT NULL AND "cardId" IS NOT NULL;

-- DropForeignKey
ALTER TABLE "Card" DROP CONSTRAINT IF EXISTS "Card_userId_fkey";

-- DropIndex
DROP INDEX IF EXISTS "Card_userId_idx";

-- AlterTable
-- Remove userId, condition, quantity, and notes columns from Card
-- These are now tracked in UserCard table
ALTER TABLE "Card" DROP COLUMN IF EXISTS "userId";
ALTER TABLE "Card" DROP COLUMN IF EXISTS "condition";
ALTER TABLE "Card" DROP COLUMN IF EXISTS "quantity";
ALTER TABLE "Card" DROP COLUMN IF EXISTS "notes";

-- Make cardId required (not nullable) since it's the primary identifier
ALTER TABLE "Card" ALTER COLUMN "cardId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "UserCard_userId_idx" ON "UserCard"("userId");

-- CreateIndex
CREATE INDEX "UserCard_cardId_idx" ON "UserCard"("cardId");

-- CreateIndex
CREATE UNIQUE INDEX "UserCard_userId_cardId_key" ON "UserCard"("userId", "cardId");

-- CreateIndex
CREATE INDEX "Card_set_idx" ON "Card"("set");

-- CreateIndex
CREATE INDEX "Card_rarity_idx" ON "Card"("rarity");

-- AddForeignKey
ALTER TABLE "UserCard" ADD CONSTRAINT "UserCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCard" ADD CONSTRAINT "UserCard_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("cardId") ON DELETE CASCADE ON UPDATE CASCADE;
