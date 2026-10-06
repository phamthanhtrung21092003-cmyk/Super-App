-- BƯỚC 3: Food Merchant Backend
-- Chỉ ADD COLUMN / CREATE TABLE, không xóa dữ liệu.

-- Restaurant: owner, trạng thái mở cửa, auto accept, ngân hàng
ALTER TABLE "Restaurant" ADD COLUMN IF NOT EXISTS "isOpen" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Restaurant" ADD COLUMN IF NOT EXISTS "autoAcceptOrder" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Restaurant" ADD COLUMN IF NOT EXISTS "phoneNumber" TEXT;
ALTER TABLE "Restaurant" ADD COLUMN IF NOT EXISTS "ownerId" TEXT;
ALTER TABLE "Restaurant" ADD COLUMN IF NOT EXISTS "bankName" TEXT;
ALTER TABLE "Restaurant" ADD COLUMN IF NOT EXISTS "bankCode" TEXT;
ALTER TABLE "Restaurant" ADD COLUMN IF NOT EXISTS "bankAccountNo" TEXT;
ALTER TABLE "Restaurant" ADD COLUMN IF NOT EXISTS "bankAccountHolder" TEXT;

CREATE INDEX IF NOT EXISTS "Restaurant_isOpen_idx" ON "Restaurant"("isOpen");
CREATE INDEX IF NOT EXISTS "Restaurant_ownerId_idx" ON "Restaurant"("ownerId");

DO $$ BEGIN
  ALTER TABLE "Restaurant" ADD CONSTRAINT "Restaurant_ownerId_fkey"
    FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- FoodOrder: mốc thời gian trạng thái + lý do từ chối
ALTER TABLE "FoodOrder" ADD COLUMN IF NOT EXISTS "confirmedAt" TIMESTAMP(3);
ALTER TABLE "FoodOrder" ADD COLUMN IF NOT EXISTS "preparingAt" TIMESTAMP(3);
ALTER TABLE "FoodOrder" ADD COLUMN IF NOT EXISTS "readyAt" TIMESTAMP(3);
ALTER TABLE "FoodOrder" ADD COLUMN IF NOT EXISTS "pickedUpAt" TIMESTAMP(3);
ALTER TABLE "FoodOrder" ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP(3);
ALTER TABLE "FoodOrder" ADD COLUMN IF NOT EXISTS "rejectedReason" TEXT;

-- FoodAuditLog
CREATE TABLE IF NOT EXISTS "FoodAuditLog" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orderId" TEXT,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FoodAuditLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "FoodAuditLog_restaurantId_idx" ON "FoodAuditLog"("restaurantId");
CREATE INDEX IF NOT EXISTS "FoodAuditLog_userId_idx" ON "FoodAuditLog"("userId");
CREATE INDEX IF NOT EXISTS "FoodAuditLog_action_idx" ON "FoodAuditLog"("action");
CREATE INDEX IF NOT EXISTS "FoodAuditLog_createdAt_idx" ON "FoodAuditLog"("createdAt");

DO $$ BEGIN
  ALTER TABLE "FoodAuditLog" ADD CONSTRAINT "FoodAuditLog_restaurantId_fkey"
    FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "FoodAuditLog" ADD CONSTRAINT "FoodAuditLog_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "FoodAuditLog" ADD CONSTRAINT "FoodAuditLog_orderId_fkey"
    FOREIGN KEY ("orderId") REFERENCES "FoodOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
