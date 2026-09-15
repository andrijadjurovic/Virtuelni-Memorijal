-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'OWNER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Family" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Memorial" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerId" TEXT,
    "familyId" TEXT,
    "name" TEXT NOT NULL,
    "birthDate" DATETIME,
    "deathDate" DATETIME,
    "bio" TEXT,
    "photoUrl" TEXT,
    "audioUrl" TEXT,
    "headstoneType" TEXT NOT NULL DEFAULT 'classic',
    "privacy" TEXT NOT NULL DEFAULT 'PUBLIC',
    "pinCode" TEXT,
    "isPet" BOOLEAN NOT NULL DEFAULT false,
    "positionX" REAL NOT NULL DEFAULT 0,
    "positionY" REAL NOT NULL DEFAULT 0,
    "positionZ" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Memorial_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Memorial_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TimelineEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "memorialId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT,
    CONSTRAINT "TimelineEvent_memorialId_fkey" FOREIGN KEY ("memorialId") REFERENCES "Memorial" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GiftTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "memorialId" TEXT NOT NULL,
    "giftType" TEXT NOT NULL,
    "stripeSessionId" TEXT,
    "purchasedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activeUntil" DATETIME NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'eur',
    CONSTRAINT "GiftTransaction_memorialId_fkey" FOREIGN KEY ("memorialId") REFERENCES "Memorial" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Condolence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "memorialId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "approvedById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Condolence_memorialId_fkey" FOREIGN KEY ("memorialId") REFERENCES "Memorial" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Condolence_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FamilyRelation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fromMemorialId" TEXT NOT NULL,
    "toMemorialId" TEXT NOT NULL,
    "relationType" TEXT NOT NULL,
    CONSTRAINT "FamilyRelation_fromMemorialId_fkey" FOREIGN KEY ("fromMemorialId") REFERENCES "Memorial" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FamilyRelation_toMemorialId_fkey" FOREIGN KEY ("toMemorialId") REFERENCES "Memorial" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Memorial_positionX_positionZ_idx" ON "Memorial"("positionX", "positionZ");

-- CreateIndex
CREATE INDEX "Memorial_familyId_idx" ON "Memorial"("familyId");

-- CreateIndex
CREATE INDEX "TimelineEvent_memorialId_year_idx" ON "TimelineEvent"("memorialId", "year");

-- CreateIndex
CREATE UNIQUE INDEX "GiftTransaction_stripeSessionId_key" ON "GiftTransaction"("stripeSessionId");

-- CreateIndex
CREATE INDEX "GiftTransaction_memorialId_activeUntil_idx" ON "GiftTransaction"("memorialId", "activeUntil");

-- CreateIndex
CREATE INDEX "Condolence_memorialId_status_idx" ON "Condolence"("memorialId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "FamilyRelation_fromMemorialId_toMemorialId_key" ON "FamilyRelation"("fromMemorialId", "toMemorialId");
