-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('man', 'vrouw', 'anders', 'prefer_not_to_say');
CREATE TYPE "UserRole" AS ENUM ('volunteer', 'help_seeker', 'organisation');
CREATE TYPE "ListingType" AS ENUM ('help_request', 'volunteer_offer');
CREATE TYPE "ListingStatus" AS ENUM ('draft', 'active', 'closed');
CREATE TYPE "Frequency" AS ENUM ('once', 'recurring', 'flexible');
CREATE TYPE "ContactPreference" AS ENUM ('in_app', 'email', 'both');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "gender" "Gender" NOT NULL,
    "postcode" TEXT NOT NULL,
    "neighbourhood" TEXT NOT NULL,
    "phone" TEXT,
    "profilePhoto" TEXT,
    "bio" TEXT,
    "roles" "UserRole"[],
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "availability" TEXT[],
    "interests" TEXT[],
    "verifyToken" TEXT,
    "verifyTokenExpiry" TIMESTAMP(3),
    "resetToken" TEXT,
    "resetTokenExpiry" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "ListingType" NOT NULL,
    "status" "ListingStatus" NOT NULL DEFAULT 'draft',
    "categoryId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "neighbourhood" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "frequency" "Frequency" NOT NULL,
    "contactPreference" "ContactPreference" NOT NULL,
    "showPhone" BOOLEAN NOT NULL DEFAULT false,
    "showEmail" BOOLEAN NOT NULL DEFAULT false,
    "images" TEXT[],
    "authorId" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),
    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageView" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "userId" TEXT,
    "ipHash" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PageView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingView" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "ipHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ListingView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "User_isActive_isVerified_idx" ON "User"("isActive", "isVerified");
CREATE INDEX "Listing_status_type_idx" ON "Listing"("status", "type");
CREATE INDEX "Listing_categoryId_idx" ON "Listing"("categoryId");
CREATE INDEX "Listing_neighbourhood_idx" ON "Listing"("neighbourhood");
CREATE INDEX "Listing_authorId_idx" ON "Listing"("authorId");
CREATE INDEX "Message_receiverId_isRead_idx" ON "Message"("receiverId", "isRead");
CREATE INDEX "Message_listingId_idx" ON "Message"("listingId");
CREATE INDEX "Message_senderId_receiverId_idx" ON "Message"("senderId", "receiverId");
CREATE INDEX "PageView_path_idx" ON "PageView"("path");
CREATE INDEX "PageView_createdAt_idx" ON "PageView"("createdAt");
CREATE INDEX "ListingView_listingId_idx" ON "ListingView"("listingId");
CREATE INDEX "ListingView_createdAt_idx" ON "ListingView"("createdAt");

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Message" ADD CONSTRAINT "Message_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Message" ADD CONSTRAINT "Message_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PageView" ADD CONSTRAINT "PageView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ListingView" ADD CONSTRAINT "ListingView_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
