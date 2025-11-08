-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "username" TEXT,
    "bio" TEXT,
    "avatar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Card" (
    "id" TEXT NOT NULL,
    "cardId" TEXT,
    "name" TEXT NOT NULL,
    "set" TEXT NOT NULL,
    "setName" TEXT,
    "number" TEXT,
    "rarity" TEXT,
    "types" TEXT,
    "supertype" TEXT,
    "subtypes" TEXT,
    "hp" TEXT,
    "artist" TEXT,
    "flavorText" TEXT,
    "attacks" TEXT,
    "weaknesses" TEXT,
    "resistances" TEXT,
    "retreatCost" TEXT,
    "prices" TEXT,
    "condition" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "imageUrl" TEXT,
    "imageUrlHiRes" TEXT,
    "notes" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);

-- CreateTable for express-session storage
CREATE TABLE IF NOT EXISTS "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL,
  CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Card_cardId_key" ON "Card"("cardId");

-- CreateIndex
CREATE INDEX "Card_userId_idx" ON "Card"("userId");

-- CreateIndex
CREATE INDEX "Card_cardId_idx" ON "Card"("cardId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
