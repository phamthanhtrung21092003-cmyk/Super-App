-- CreateEnum
CREATE TYPE "CinemaBrand" AS ENUM ('CGV', 'LOTTE', 'GALAXY', 'BETA', 'BHD', 'CINESTAR', 'OTHER');

-- CreateEnum
CREATE TYPE "SeatType" AS ENUM ('STANDARD', 'VIP', 'COUPLE');

-- CreateEnum
CREATE TYPE "ShowtimeSeatStatus" AS ENUM ('AVAILABLE', 'HELD', 'BOOKED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "SeatHoldStatus" AS ENUM ('HELD', 'RELEASED', 'EXPIRED', 'CONVERTED');

-- CreateEnum
CREATE TYPE "MovieOrderStatus" AS ENUM ('PENDING', 'PAYMENT_PENDING', 'PAID', 'CONFIRMED', 'CANCELLED', 'EXPIRED', 'REFUND_PENDING', 'REFUNDED');

-- CreateEnum
CREATE TYPE "MovieOrderItemType" AS ENUM ('SEAT', 'COMBO');

-- CreateEnum
CREATE TYPE "MovieBookingStatus" AS ENUM ('PENDING', 'PAYMENT_PENDING', 'PAYMENT_SUCCESS', 'BOOKING_CONFIRMING', 'BOOKING_CONFIRMED', 'TICKET_ISSUED', 'CANCELLED', 'REFUND_PENDING', 'REFUNDED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "MovieTicketType" AS ENUM ('PRINT_AT_COUNTER');

-- CreateEnum
CREATE TYPE "MovieTicketStatus" AS ENUM ('ISSUED', 'USED', 'CANCELLED', 'REFUNDED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "VoucherDiscountType" AS ENUM ('FIXED_AMOUNT', 'PERCENTAGE');

-- CreateEnum
CREATE TYPE "VoucherStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'EXPIRED');

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_bookingId_fkey";

-- DropForeignKey
ALTER TABLE "Refund" DROP CONSTRAINT "Refund_bookingId_fkey";

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "movieOrderId" TEXT,
ALTER COLUMN "bookingId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Refund" ADD COLUMN     "movieOrderId" TEXT,
ALTER COLUMN "bookingId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "CinemaIntegration" (
    "id" TEXT NOT NULL,
    "brand" "CinemaBrand" NOT NULL,
    "adapterKey" TEXT NOT NULL,
    "providerName" TEXT NOT NULL,
    "baseUrl" TEXT,
    "apiVersion" TEXT NOT NULL DEFAULT 'v1',
    "authType" TEXT NOT NULL DEFAULT 'API_KEY',
    "timeoutMs" INTEGER NOT NULL DEFAULT 10000,
    "retryLimit" INTEGER NOT NULL DEFAULT 3,
    "holdTtlSeconds" INTEGER NOT NULL DEFAULT 600,
    "supportsCancel" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "config" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CinemaIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cinema" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" "CinemaBrand" NOT NULL,
    "integrationId" TEXT,
    "partnerId" TEXT,
    "city" TEXT NOT NULL,
    "area" TEXT,
    "address" TEXT NOT NULL,
    "phone" TEXT,
    "openingHours" TEXT DEFAULT '08:00 - 23:45',
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "facilities" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cinema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Auditorium" (
    "id" TEXT NOT NULL,
    "cinemaId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "totalRows" INTEGER NOT NULL DEFAULT 6,
    "totalCols" INTEGER NOT NULL DEFAULT 8,
    "capacity" INTEGER NOT NULL DEFAULT 48,
    "screenType" TEXT NOT NULL DEFAULT '2D',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Auditorium_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Seat" (
    "id" TEXT NOT NULL,
    "auditoriumId" TEXT NOT NULL,
    "seatCode" TEXT NOT NULL,
    "rowLabel" TEXT NOT NULL,
    "seatNumber" INTEGER NOT NULL,
    "type" "SeatType" NOT NULL DEFAULT 'STANDARD',
    "seatSpan" INTEGER NOT NULL DEFAULT 1,
    "priceModifier" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Seat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Movie" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "externalCode" TEXT,
    "title" TEXT NOT NULL,
    "originalTitle" TEXT,
    "description" TEXT,
    "posterUrl" TEXT NOT NULL,
    "bannerUrl" TEXT,
    "trailerUrl" TEXT,
    "ageRating" TEXT NOT NULL DEFAULT 'T13',
    "durationMin" INTEGER NOT NULL DEFAULT 110,
    "genres" TEXT NOT NULL,
    "director" TEXT,
    "cast" TEXT,
    "language" TEXT DEFAULT 'Tiß║┐ng Viß╗çt',
    "releaseDate" TIMESTAMP(3),
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 4.8,
    "isShowing" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Movie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Showtime" (
    "id" TEXT NOT NULL,
    "externalCode" TEXT,
    "movieId" TEXT NOT NULL,
    "cinemaId" TEXT NOT NULL,
    "auditoriumId" TEXT NOT NULL,
    "screeningFormat" TEXT NOT NULL DEFAULT '2D Phß╗Ñ ─Éß╗ü Viß╗çt',
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "basePrice" DECIMAL(65,30) NOT NULL,
    "vipPrice" DECIMAL(65,30) NOT NULL,
    "couplePrice" DECIMAL(65,30) NOT NULL,
    "serviceFee" DECIMAL(65,30) NOT NULL DEFAULT 5000,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Showtime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShowtimeSeat" (
    "id" TEXT NOT NULL,
    "showtimeId" TEXT NOT NULL,
    "seatId" TEXT NOT NULL,
    "seatCode" TEXT NOT NULL,
    "seatType" "SeatType" NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "status" "ShowtimeSeatStatus" NOT NULL DEFAULT 'AVAILABLE',
    "heldByUserId" TEXT,
    "activeHoldId" TEXT,
    "holdExpiresAt" TIMESTAMP(3),
    "movieBookingId" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShowtimeSeat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeatHold" (
    "id" TEXT NOT NULL,
    "holdCode" TEXT NOT NULL,
    "showtimeId" TEXT NOT NULL,
    "seatId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "movieOrderId" TEXT,
    "status" "SeatHoldStatus" NOT NULL DEFAULT 'HELD',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "releasedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeatHold_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Combo" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "cinemaId" TEXT,
    "brand" "CinemaBrand",
    "name" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "price" DECIMAL(65,30) NOT NULL,
    "originalPrice" DECIMAL(65,30),
    "savingsText" TEXT,
    "stockQuantity" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Combo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Voucher" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "discountType" "VoucherDiscountType" NOT NULL DEFAULT 'FIXED_AMOUNT',
    "discountValue" DECIMAL(65,30) NOT NULL,
    "maxDiscountAmount" DECIMAL(65,30),
    "minOrderAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "usageLimit" INTEGER NOT NULL DEFAULT 100,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "perUserLimit" INTEGER NOT NULL DEFAULT 1,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "cinemaBrand" "CinemaBrand",
    "cinemaId" TEXT,
    "movieId" TEXT,
    "showtimeId" TEXT,
    "status" "VoucherStatus" NOT NULL DEFAULT 'ACTIVE',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Voucher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoucherUsage" (
    "id" TEXT NOT NULL,
    "voucherId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "movieOrderId" TEXT NOT NULL,
    "discountAmount" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VoucherUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovieOrder" (
    "id" TEXT NOT NULL,
    "orderCode" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "movieId" TEXT NOT NULL,
    "cinemaId" TEXT NOT NULL,
    "showtimeId" TEXT NOT NULL,
    "voucherId" TEXT,
    "voucherCode" TEXT,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "customerEmail" TEXT,
    "seatsSubtotal" DECIMAL(65,30) NOT NULL,
    "combosSubtotal" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "serviceFee" DECIMAL(65,30) NOT NULL DEFAULT 5000,
    "discountAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(65,30) NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'VND',
    "status" "MovieOrderStatus" NOT NULL DEFAULT 'PENDING',
    "paymentReference" TEXT,
    "bookingReference" TEXT,
    "idempotencyKey" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MovieOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovieOrderItem" (
    "id" TEXT NOT NULL,
    "movieOrderId" TEXT NOT NULL,
    "itemType" "MovieOrderItemType" NOT NULL,
    "seatId" TEXT,
    "showtimeSeatId" TEXT,
    "comboId" TEXT,
    "nameSnapshot" TEXT NOT NULL,
    "codeSnapshot" TEXT,
    "unitPrice" DECIMAL(65,30) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "totalPrice" DECIMAL(65,30) NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MovieOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovieBooking" (
    "id" TEXT NOT NULL,
    "bookingCode" TEXT NOT NULL,
    "movieOrderId" TEXT NOT NULL,
    "cinemaId" TEXT NOT NULL,
    "showtimeId" TEXT NOT NULL,
    "externalBookingId" TEXT,
    "adapterBrand" "CinemaBrand" NOT NULL,
    "status" "MovieBookingStatus" NOT NULL DEFAULT 'PENDING',
    "failureReason" TEXT,
    "cancelReason" TEXT,
    "confirmedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "rawAdapterPayload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MovieBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovieTicket" (
    "id" TEXT NOT NULL,
    "ticketCode" TEXT NOT NULL,
    "barcode" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "movieId" TEXT NOT NULL,
    "cinemaId" TEXT NOT NULL,
    "showtimeId" TEXT NOT NULL,
    "auditoriumName" TEXT NOT NULL,
    "seatCodes" TEXT NOT NULL,
    "combosSummary" TEXT,
    "ticketType" "MovieTicketType" NOT NULL DEFAULT 'PRINT_AT_COUNTER',
    "status" "MovieTicketStatus" NOT NULL DEFAULT 'ISSUED',
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),
    "counterPrintCount" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MovieTicket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CinemaIntegration_brand_key" ON "CinemaIntegration"("brand");

-- CreateIndex
CREATE UNIQUE INDEX "CinemaIntegration_adapterKey_key" ON "CinemaIntegration"("adapterKey");

-- CreateIndex
CREATE INDEX "CinemaIntegration_brand_idx" ON "CinemaIntegration"("brand");

-- CreateIndex
CREATE INDEX "CinemaIntegration_isActive_idx" ON "CinemaIntegration"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Cinema_code_key" ON "Cinema"("code");

-- CreateIndex
CREATE INDEX "Cinema_brand_idx" ON "Cinema"("brand");

-- CreateIndex
CREATE INDEX "Cinema_city_idx" ON "Cinema"("city");

-- CreateIndex
CREATE INDEX "Cinema_integrationId_idx" ON "Cinema"("integrationId");

-- CreateIndex
CREATE INDEX "Cinema_partnerId_idx" ON "Cinema"("partnerId");

-- CreateIndex
CREATE INDEX "Cinema_isActive_idx" ON "Cinema"("isActive");

-- CreateIndex
CREATE INDEX "Auditorium_cinemaId_idx" ON "Auditorium"("cinemaId");

-- CreateIndex
CREATE INDEX "Auditorium_isActive_idx" ON "Auditorium"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Auditorium_cinemaId_code_key" ON "Auditorium"("cinemaId", "code");

-- CreateIndex
CREATE INDEX "Seat_auditoriumId_idx" ON "Seat"("auditoriumId");

-- CreateIndex
CREATE INDEX "Seat_type_idx" ON "Seat"("type");

-- CreateIndex
CREATE UNIQUE INDEX "Seat_auditoriumId_seatCode_key" ON "Seat"("auditoriumId", "seatCode");

-- CreateIndex
CREATE UNIQUE INDEX "Seat_auditoriumId_rowLabel_seatNumber_key" ON "Seat"("auditoriumId", "rowLabel", "seatNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Movie_slug_key" ON "Movie"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Movie_externalCode_key" ON "Movie"("externalCode");

-- CreateIndex
CREATE INDEX "Movie_isShowing_isActive_idx" ON "Movie"("isShowing", "isActive");

-- CreateIndex
CREATE INDEX "Movie_ageRating_idx" ON "Movie"("ageRating");

-- CreateIndex
CREATE UNIQUE INDEX "Showtime_externalCode_key" ON "Showtime"("externalCode");

-- CreateIndex
CREATE INDEX "Showtime_movieId_idx" ON "Showtime"("movieId");

-- CreateIndex
CREATE INDEX "Showtime_cinemaId_idx" ON "Showtime"("cinemaId");

-- CreateIndex
CREATE INDEX "Showtime_auditoriumId_idx" ON "Showtime"("auditoriumId");

-- CreateIndex
CREATE INDEX "Showtime_startTime_idx" ON "Showtime"("startTime");

-- CreateIndex
CREATE INDEX "Showtime_cinemaId_movieId_startTime_idx" ON "Showtime"("cinemaId", "movieId", "startTime");

-- CreateIndex
CREATE UNIQUE INDEX "Showtime_auditoriumId_startTime_key" ON "Showtime"("auditoriumId", "startTime");

-- CreateIndex
CREATE UNIQUE INDEX "ShowtimeSeat_activeHoldId_key" ON "ShowtimeSeat"("activeHoldId");

-- CreateIndex
CREATE INDEX "ShowtimeSeat_showtimeId_status_idx" ON "ShowtimeSeat"("showtimeId", "status");

-- CreateIndex
CREATE INDEX "ShowtimeSeat_heldByUserId_idx" ON "ShowtimeSeat"("heldByUserId");

-- CreateIndex
CREATE INDEX "ShowtimeSeat_holdExpiresAt_idx" ON "ShowtimeSeat"("holdExpiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "ShowtimeSeat_showtimeId_seatId_key" ON "ShowtimeSeat"("showtimeId", "seatId");

-- CreateIndex
CREATE UNIQUE INDEX "SeatHold_holdCode_key" ON "SeatHold"("holdCode");

-- CreateIndex
CREATE INDEX "SeatHold_showtimeId_seatId_status_idx" ON "SeatHold"("showtimeId", "seatId", "status");

-- CreateIndex
CREATE INDEX "SeatHold_userId_status_idx" ON "SeatHold"("userId", "status");

-- CreateIndex
CREATE INDEX "SeatHold_movieOrderId_idx" ON "SeatHold"("movieOrderId");

-- CreateIndex
CREATE INDEX "SeatHold_status_expiresAt_idx" ON "SeatHold"("status", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Combo_code_key" ON "Combo"("code");

-- CreateIndex
CREATE INDEX "Combo_cinemaId_idx" ON "Combo"("cinemaId");

-- CreateIndex
CREATE INDEX "Combo_brand_idx" ON "Combo"("brand");

-- CreateIndex
CREATE INDEX "Combo_isActive_idx" ON "Combo"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Voucher_code_key" ON "Voucher"("code");

-- CreateIndex
CREATE INDEX "Voucher_code_status_idx" ON "Voucher"("code", "status");

-- CreateIndex
CREATE INDEX "Voucher_validFrom_validUntil_idx" ON "Voucher"("validFrom", "validUntil");

-- CreateIndex
CREATE INDEX "Voucher_cinemaBrand_idx" ON "Voucher"("cinemaBrand");

-- CreateIndex
CREATE INDEX "Voucher_cinemaId_idx" ON "Voucher"("cinemaId");

-- CreateIndex
CREATE INDEX "Voucher_movieId_idx" ON "Voucher"("movieId");

-- CreateIndex
CREATE UNIQUE INDEX "VoucherUsage_movieOrderId_key" ON "VoucherUsage"("movieOrderId");

-- CreateIndex
CREATE INDEX "VoucherUsage_voucherId_userId_idx" ON "VoucherUsage"("voucherId", "userId");

-- CreateIndex
CREATE INDEX "VoucherUsage_userId_idx" ON "VoucherUsage"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MovieOrder_orderCode_key" ON "MovieOrder"("orderCode");

-- CreateIndex
CREATE UNIQUE INDEX "MovieOrder_idempotencyKey_key" ON "MovieOrder"("idempotencyKey");

-- CreateIndex
CREATE INDEX "MovieOrder_userId_createdAt_idx" ON "MovieOrder"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "MovieOrder_showtimeId_idx" ON "MovieOrder"("showtimeId");

-- CreateIndex
CREATE INDEX "MovieOrder_cinemaId_idx" ON "MovieOrder"("cinemaId");

-- CreateIndex
CREATE INDEX "MovieOrder_movieId_idx" ON "MovieOrder"("movieId");

-- CreateIndex
CREATE INDEX "MovieOrder_status_idx" ON "MovieOrder"("status");

-- CreateIndex
CREATE INDEX "MovieOrder_expiresAt_idx" ON "MovieOrder"("expiresAt");

-- CreateIndex
CREATE INDEX "MovieOrderItem_movieOrderId_idx" ON "MovieOrderItem"("movieOrderId");

-- CreateIndex
CREATE INDEX "MovieOrderItem_itemType_idx" ON "MovieOrderItem"("itemType");

-- CreateIndex
CREATE INDEX "MovieOrderItem_seatId_idx" ON "MovieOrderItem"("seatId");

-- CreateIndex
CREATE INDEX "MovieOrderItem_comboId_idx" ON "MovieOrderItem"("comboId");

-- CreateIndex
CREATE UNIQUE INDEX "MovieBooking_bookingCode_key" ON "MovieBooking"("bookingCode");

-- CreateIndex
CREATE UNIQUE INDEX "MovieBooking_movieOrderId_key" ON "MovieBooking"("movieOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "MovieBooking_externalBookingId_key" ON "MovieBooking"("externalBookingId");

-- CreateIndex
CREATE INDEX "MovieBooking_cinemaId_idx" ON "MovieBooking"("cinemaId");

-- CreateIndex
CREATE INDEX "MovieBooking_showtimeId_idx" ON "MovieBooking"("showtimeId");

-- CreateIndex
CREATE INDEX "MovieBooking_status_idx" ON "MovieBooking"("status");

-- CreateIndex
CREATE INDEX "MovieBooking_externalBookingId_idx" ON "MovieBooking"("externalBookingId");

-- CreateIndex
CREATE UNIQUE INDEX "MovieTicket_ticketCode_key" ON "MovieTicket"("ticketCode");

-- CreateIndex
CREATE UNIQUE INDEX "MovieTicket_barcode_key" ON "MovieTicket"("barcode");

-- CreateIndex
CREATE INDEX "MovieTicket_bookingId_idx" ON "MovieTicket"("bookingId");

-- CreateIndex
CREATE INDEX "MovieTicket_movieId_idx" ON "MovieTicket"("movieId");

-- CreateIndex
CREATE INDEX "MovieTicket_cinemaId_idx" ON "MovieTicket"("cinemaId");

-- CreateIndex
CREATE INDEX "MovieTicket_showtimeId_idx" ON "MovieTicket"("showtimeId");

-- CreateIndex
CREATE INDEX "MovieTicket_status_idx" ON "MovieTicket"("status");

-- CreateIndex
CREATE INDEX "MovieTicket_barcode_idx" ON "MovieTicket"("barcode");

-- CreateIndex
CREATE INDEX "Payment_movieOrderId_idx" ON "Payment"("movieOrderId");

-- CreateIndex
CREATE INDEX "Refund_movieOrderId_idx" ON "Refund"("movieOrderId");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_movieOrderId_fkey" FOREIGN KEY ("movieOrderId") REFERENCES "MovieOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_movieOrderId_fkey" FOREIGN KEY ("movieOrderId") REFERENCES "MovieOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cinema" ADD CONSTRAINT "Cinema_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "CinemaIntegration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cinema" ADD CONSTRAINT "Cinema_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Auditorium" ADD CONSTRAINT "Auditorium_cinemaId_fkey" FOREIGN KEY ("cinemaId") REFERENCES "Cinema"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seat" ADD CONSTRAINT "Seat_auditoriumId_fkey" FOREIGN KEY ("auditoriumId") REFERENCES "Auditorium"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Showtime" ADD CONSTRAINT "Showtime_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Showtime" ADD CONSTRAINT "Showtime_cinemaId_fkey" FOREIGN KEY ("cinemaId") REFERENCES "Cinema"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Showtime" ADD CONSTRAINT "Showtime_auditoriumId_fkey" FOREIGN KEY ("auditoriumId") REFERENCES "Auditorium"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShowtimeSeat" ADD CONSTRAINT "ShowtimeSeat_showtimeId_fkey" FOREIGN KEY ("showtimeId") REFERENCES "Showtime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShowtimeSeat" ADD CONSTRAINT "ShowtimeSeat_seatId_fkey" FOREIGN KEY ("seatId") REFERENCES "Seat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeatHold" ADD CONSTRAINT "SeatHold_showtimeId_fkey" FOREIGN KEY ("showtimeId") REFERENCES "Showtime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeatHold" ADD CONSTRAINT "SeatHold_seatId_fkey" FOREIGN KEY ("seatId") REFERENCES "Seat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeatHold" ADD CONSTRAINT "SeatHold_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeatHold" ADD CONSTRAINT "SeatHold_movieOrderId_fkey" FOREIGN KEY ("movieOrderId") REFERENCES "MovieOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Combo" ADD CONSTRAINT "Combo_cinemaId_fkey" FOREIGN KEY ("cinemaId") REFERENCES "Cinema"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Voucher" ADD CONSTRAINT "Voucher_cinemaId_fkey" FOREIGN KEY ("cinemaId") REFERENCES "Cinema"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Voucher" ADD CONSTRAINT "Voucher_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Voucher" ADD CONSTRAINT "Voucher_showtimeId_fkey" FOREIGN KEY ("showtimeId") REFERENCES "Showtime"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoucherUsage" ADD CONSTRAINT "VoucherUsage_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "Voucher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoucherUsage" ADD CONSTRAINT "VoucherUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoucherUsage" ADD CONSTRAINT "VoucherUsage_movieOrderId_fkey" FOREIGN KEY ("movieOrderId") REFERENCES "MovieOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovieOrder" ADD CONSTRAINT "MovieOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovieOrder" ADD CONSTRAINT "MovieOrder_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovieOrder" ADD CONSTRAINT "MovieOrder_cinemaId_fkey" FOREIGN KEY ("cinemaId") REFERENCES "Cinema"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovieOrder" ADD CONSTRAINT "MovieOrder_showtimeId_fkey" FOREIGN KEY ("showtimeId") REFERENCES "Showtime"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovieOrder" ADD CONSTRAINT "MovieOrder_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "Voucher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovieOrderItem" ADD CONSTRAINT "MovieOrderItem_movieOrderId_fkey" FOREIGN KEY ("movieOrderId") REFERENCES "MovieOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovieOrderItem" ADD CONSTRAINT "MovieOrderItem_seatId_fkey" FOREIGN KEY ("seatId") REFERENCES "Seat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovieOrderItem" ADD CONSTRAINT "MovieOrderItem_showtimeSeatId_fkey" FOREIGN KEY ("showtimeSeatId") REFERENCES "ShowtimeSeat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovieOrderItem" ADD CONSTRAINT "MovieOrderItem_comboId_fkey" FOREIGN KEY ("comboId") REFERENCES "Combo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovieBooking" ADD CONSTRAINT "MovieBooking_movieOrderId_fkey" FOREIGN KEY ("movieOrderId") REFERENCES "MovieOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovieBooking" ADD CONSTRAINT "MovieBooking_cinemaId_fkey" FOREIGN KEY ("cinemaId") REFERENCES "Cinema"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovieBooking" ADD CONSTRAINT "MovieBooking_showtimeId_fkey" FOREIGN KEY ("showtimeId") REFERENCES "Showtime"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovieTicket" ADD CONSTRAINT "MovieTicket_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "MovieBooking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovieTicket" ADD CONSTRAINT "MovieTicket_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovieTicket" ADD CONSTRAINT "MovieTicket_cinemaId_fkey" FOREIGN KEY ("cinemaId") REFERENCES "Cinema"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovieTicket" ADD CONSTRAINT "MovieTicket_showtimeId_fkey" FOREIGN KEY ("showtimeId") REFERENCES "Showtime"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- Partial Unique Index: Prevent concurrent active SeatHold on the same (showtimeId, seatId)
CREATE UNIQUE INDEX "SeatHold_showtimeId_seatId_active_held_key" ON "SeatHold"("showtimeId", "seatId") WHERE ("status" = 'HELD');