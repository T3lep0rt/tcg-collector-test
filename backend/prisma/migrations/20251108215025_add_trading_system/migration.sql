-- CreateTable
CREATE TABLE "Trade" (
    "id" TEXT NOT NULL,
    "offererId" TEXT NOT NULL,
    "offeredCardId" TEXT NOT NULL,
    "requestedRarity" TEXT NOT NULL,
    "targetUserId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TradeResponse" (
    "id" TEXT NOT NULL,
    "tradeId" TEXT NOT NULL,
    "responderId" TEXT NOT NULL,
    "responseCardId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TradeResponse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Trade_offererId_idx" ON "Trade"("offererId");

-- CreateIndex
CREATE INDEX "Trade_targetUserId_idx" ON "Trade"("targetUserId");

-- CreateIndex
CREATE INDEX "Trade_status_idx" ON "Trade"("status");

-- CreateIndex
CREATE INDEX "Trade_requestedRarity_idx" ON "Trade"("requestedRarity");

-- CreateIndex
CREATE INDEX "TradeResponse_tradeId_idx" ON "TradeResponse"("tradeId");

-- CreateIndex
CREATE INDEX "TradeResponse_responderId_idx" ON "TradeResponse"("responderId");

-- CreateIndex
CREATE INDEX "TradeResponse_status_idx" ON "TradeResponse"("status");

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_offererId_fkey" FOREIGN KEY ("offererId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_offeredCardId_fkey" FOREIGN KEY ("offeredCardId") REFERENCES "Card"("cardId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradeResponse" ADD CONSTRAINT "TradeResponse_tradeId_fkey" FOREIGN KEY ("tradeId") REFERENCES "Trade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradeResponse" ADD CONSTRAINT "TradeResponse_responderId_fkey" FOREIGN KEY ("responderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradeResponse" ADD CONSTRAINT "TradeResponse_responseCardId_fkey" FOREIGN KEY ("responseCardId") REFERENCES "Card"("cardId") ON DELETE CASCADE ON UPDATE CASCADE;
