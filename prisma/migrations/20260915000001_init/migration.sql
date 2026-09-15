CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'OWNER', 'MODERATOR');
CREATE TYPE "PrivacyLevel" AS ENUM ('PUBLIC', 'PIN_PROTECTED', 'PRIVATE');
CREATE TYPE "CondolenceStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE "GiftType" AS ENUM ('DIGITAL_CANDLE', 'FLOWER_BOUQUET', 'PREMIUM_HEADSTONE');

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "name" TEXT,
  "role" "UserRole" NOT NULL DEFAULT 'OWNER',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Family" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Family_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Memorial" (
  "id" TEXT NOT NULL,
  "ownerId" TEXT,
  "familyId" TEXT,
  "name" TEXT NOT NULL,
  "birthDate" TIMESTAMP(3),
  "deathDate" TIMESTAMP(3),
  "bio" TEXT,
  "photoUrl" TEXT,
  "audioUrl" TEXT,
  "headstoneType" TEXT NOT NULL DEFAULT 'classic',
  "privacy" "PrivacyLevel" NOT NULL DEFAULT 'PUBLIC',
  "pinCode" TEXT,
  "isPet" BOOLEAN NOT NULL DEFAULT false,
  "positionX" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "positionY" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "positionZ" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Memorial_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "TimelineEvent" (
  "id" TEXT NOT NULL,
  "memorialId" TEXT NOT NULL,
  "year" INTEGER NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "imageUrl" TEXT,
  CONSTRAINT "TimelineEvent_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "GiftTransaction" (
  "id" TEXT NOT NULL,
  "memorialId" TEXT NOT NULL,
  "giftType" "GiftType" NOT NULL,
  "stripeSessionId" TEXT,
  "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "activeUntil" TIMESTAMP(3) NOT NULL,
  "amount" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'eur',
  CONSTRAINT "GiftTransaction_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Condolence" (
  "id" TEXT NOT NULL,
  "memorialId" TEXT NOT NULL,
  "authorName" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "status" "CondolenceStatus" NOT NULL DEFAULT 'PENDING',
  "approvedById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Condolence_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "FamilyRelation" (
  "id" TEXT NOT NULL,
  "fromMemorialId" TEXT NOT NULL,
  "toMemorialId" TEXT NOT NULL,
  "relationType" TEXT NOT NULL,
  CONSTRAINT "FamilyRelation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "Memorial_positionX_positionZ_idx" ON "Memorial"("positionX", "positionZ");
CREATE INDEX "Memorial_familyId_idx" ON "Memorial"("familyId");
CREATE INDEX "TimelineEvent_memorialId_year_idx" ON "TimelineEvent"("memorialId", "year");
CREATE UNIQUE INDEX "GiftTransaction_stripeSessionId_key" ON "GiftTransaction"("stripeSessionId");
CREATE INDEX "GiftTransaction_memorialId_activeUntil_idx" ON "GiftTransaction"("memorialId", "activeUntil");
CREATE INDEX "Condolence_memorialId_status_idx" ON "Condolence"("memorialId", "status");
CREATE UNIQUE INDEX "FamilyRelation_fromMemorialId_toMemorialId_key" ON "FamilyRelation"("fromMemorialId", "toMemorialId");

ALTER TABLE "Memorial" ADD CONSTRAINT "Memorial_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Memorial" ADD CONSTRAINT "Memorial_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TimelineEvent" ADD CONSTRAINT "TimelineEvent_memorialId_fkey" FOREIGN KEY ("memorialId") REFERENCES "Memorial"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GiftTransaction" ADD CONSTRAINT "GiftTransaction_memorialId_fkey" FOREIGN KEY ("memorialId") REFERENCES "Memorial"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Condolence" ADD CONSTRAINT "Condolence_memorialId_fkey" FOREIGN KEY ("memorialId") REFERENCES "Memorial"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Condolence" ADD CONSTRAINT "Condolence_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "FamilyRelation" ADD CONSTRAINT "FamilyRelation_fromMemorialId_fkey" FOREIGN KEY ("fromMemorialId") REFERENCES "Memorial"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FamilyRelation" ADD CONSTRAINT "FamilyRelation_toMemorialId_fkey" FOREIGN KEY ("toMemorialId") REFERENCES "Memorial"("id") ON DELETE CASCADE ON UPDATE CASCADE;
