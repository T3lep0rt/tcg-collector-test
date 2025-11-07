-- AlterTable
ALTER TABLE "Card"
ADD COLUMN "cardId" TEXT,
ADD COLUMN "setName" TEXT,
ADD COLUMN "number" TEXT,
ADD COLUMN "types" TEXT,
ADD COLUMN "supertype" TEXT,
ADD COLUMN "subtypes" TEXT,
ADD COLUMN "hp" TEXT,
ADD COLUMN "artist" TEXT,
ADD COLUMN "flavorText" TEXT,
ADD COLUMN "attacks" TEXT,
ADD COLUMN "weaknesses" TEXT,
ADD COLUMN "resistances" TEXT,
ADD COLUMN "retreatCost" TEXT,
ADD COLUMN "prices" TEXT,
ADD COLUMN "imageUrlHiRes" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Card_cardId_key" ON "Card"("cardId");

-- CreateIndex
CREATE INDEX "Card_cardId_idx" ON "Card"("cardId");
