-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'STUDIO', 'ADMIN');

-- CreateEnum
CREATE TYPE "ProductKind" AS ENUM ('VESSEL', 'FOUNDATION', 'FLORA', 'HARDSCAPE', 'HARDWARE', 'EDITION');

-- CreateEnum
CREATE TYPE "CartItemType" AS ENUM ('CUSTOM_BLUEPRINT', 'EDITION', 'HARDWARE');

-- CreateEnum
CREATE TYPE "Fulfillment" AS ENUM ('COURIER', 'PICKUP', 'SHIPPED');

-- CreateEnum
CREATE TYPE "BuildStage" AS ENUM ('BLUEPRINT_RECEIVED', 'CIRCUIT_SOLDERING', 'PLANTING', 'QUARANTINE', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "role" "Role" NOT NULL DEFAULT 'CUSTOMER',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMPTZ(3),
    "refreshTokenExpiresAt" TIMESTAMPTZ(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "ProductKind" NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "note" TEXT,
    "maxPerOrder" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cart" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fulfillment" "Fulfillment" NOT NULL DEFAULT 'COURIER',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CartItem" (
    "id" TEXT NOT NULL,
    "cartId" TEXT NOT NULL,
    "type" "CartItemType" NOT NULL,
    "productId" TEXT,
    "blueprint" JSONB,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stage" "BuildStage" NOT NULL DEFAULT 'BLUEPRINT_RECEIVED',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "fulfillment" "Fulfillment" NOT NULL,
    "subtotalCents" INTEGER NOT NULL,
    "assemblyCents" INTEGER NOT NULL DEFAULT 0,
    "shippingCents" INTEGER NOT NULL,
    "taxCents" INTEGER NOT NULL,
    "totalCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "stripeCheckoutSessionId" TEXT,
    "stripePaymentIntentId" TEXT,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT,
    "shipLine1" TEXT,
    "shipLine2" TEXT,
    "shipCity" TEXT,
    "shipState" TEXT,
    "shipPostalCode" TEXT,
    "shipCountry" TEXT DEFAULT 'US',
    "deliveryNotes" TEXT,
    "estimatedReadyAt" DATE,
    "carrier" TEXT,
    "trackingNumber" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "type" "CartItemType" NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPriceCents" INTEGER NOT NULL,
    "blueprint" JSONB,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderStageEvent" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "stage" "BuildStage" NOT NULL,
    "title" TEXT NOT NULL,
    "notes" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderStageEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StripeEvent" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "processedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StripeEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "account_providerId_accountId_key" ON "account"("providerId", "accountId");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE INDEX "Product_kind_active_sortOrder_idx" ON "Product"("kind", "active", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Cart_userId_key" ON "Cart"("userId");

-- CreateIndex
CREATE INDEX "CartItem_cartId_idx" ON "CartItem"("cartId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Order_stripeCheckoutSessionId_key" ON "Order"("stripeCheckoutSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_stripePaymentIntentId_key" ON "Order"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX "Order_userId_createdAt_idx" ON "Order"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Order_stage_paymentStatus_idx" ON "Order"("stage", "paymentStatus");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderStageEvent_orderId_createdAt_idx" ON "OrderStageEvent"("orderId", "createdAt");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderStageEvent" ADD CONSTRAINT "OrderStageEvent_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderStageEvent" ADD CONSTRAINT "OrderStageEvent_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- Integrity rules Prisma's schema language can't express. The database enforces them even if
-- application code has a bug.
ALTER TABLE "Product" ADD CONSTRAINT "Product_priceCents_nonnegative" CHECK ("priceCents" >= 0);
ALTER TABLE "Product" ADD CONSTRAINT "Product_maxPerOrder_positive" CHECK ("maxPerOrder" IS NULL OR "maxPerOrder" >= 1);

ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_quantity_positive" CHECK ("quantity" >= 1);
-- Custom builds carry a blueprint; editions and hardware point at a product.
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_product_or_blueprint" CHECK (
  ("type" = 'CUSTOM_BLUEPRINT' AND "blueprint" IS NOT NULL AND "productId" IS NULL)
  OR ("type" <> 'CUSTOM_BLUEPRINT' AND "productId" IS NOT NULL AND "blueprint" IS NULL)
);

ALTER TABLE "Order" ADD CONSTRAINT "Order_amounts_nonnegative" CHECK (
  "subtotalCents" >= 0 AND "assemblyCents" >= 0 AND "shippingCents" >= 0 AND "taxCents" >= 0 AND "totalCents" >= 0
);
ALTER TABLE "Order" ADD CONSTRAINT "Order_total_adds_up" CHECK (
  "totalCents" = "subtotalCents" + "assemblyCents" + "shippingCents" + "taxCents"
);

ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_quantity_positive" CHECK ("quantity" >= 1);
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_unitPriceCents_nonnegative" CHECK ("unitPriceCents" >= 0);
