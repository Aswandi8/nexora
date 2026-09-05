-- CreateEnum
CREATE TYPE "XAccountStatus" AS ENUM ('CONNECTED', 'REVOKED', 'ERROR');

-- CreateEnum
CREATE TYPE "XPostType" AS ENUM ('VIDEO');

-- CreateEnum
CREATE TYPE "XPostStatus" AS ENUM ('DRAFT', 'PROCESSING', 'READY', 'PUBLISHED', 'FAILED');

-- CreateEnum
CREATE TYPE "XPostProvider" AS ENUM ('MOCK', 'LIVE');

-- CreateEnum
CREATE TYPE "XMediaCategory" AS ENUM ('AMPLIFY_VIDEO');

-- CreateEnum
CREATE TYPE "XMediaUploadStatus" AS ENUM ('PENDING', 'INITIALIZED', 'APPENDED', 'FINALIZED');

-- CreateEnum
CREATE TYPE "XMediaProcessingStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'SUCCEEDED', 'FAILED');

-- CreateEnum
CREATE TYPE "XMediaLibraryStatus" AS ENUM ('PENDING', 'REGISTERED', 'FAILED');

-- CreateEnum
CREATE TYPE "XCardType" AS ENUM ('VIDEO_WEBSITE');

-- CreateEnum
CREATE TYPE "XCardStatus" AS ENUM ('PENDING', 'CREATED', 'FAILED');

-- CreateTable
CREATE TABLE "x_account" (
    "id" TEXT NOT NULL,
    "xUserId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "profileImageUrl" TEXT,
    "status" "XAccountStatus" NOT NULL DEFAULT 'CONNECTED',
    "adsAccountId" TEXT,
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastVerifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "x_account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "x_credential" (
    "id" TEXT NOT NULL,
    "xAccountId" TEXT NOT NULL,
    "accessTokenEncrypted" TEXT NOT NULL,
    "accessTokenSecretEncrypted" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "x_credential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "x_post" (
    "id" TEXT NOT NULL,
    "xAccountId" TEXT NOT NULL,
    "type" "XPostType" NOT NULL DEFAULT 'VIDEO',
    "text" TEXT,
    "mediaUrl" TEXT NOT NULL,
    "destinationUrl" TEXT,
    "mediaWidth" INTEGER NOT NULL,
    "mediaHeight" INTEGER NOT NULL,
    "durationMs" INTEGER NOT NULL,
    "displayDurationMs" INTEGER NOT NULL DEFAULT 15000,
    "mimeType" TEXT,
    "contentLength" BIGINT,
    "status" "XPostStatus" NOT NULL DEFAULT 'DRAFT',
    "provider" "XPostProvider" NOT NULL DEFAULT 'MOCK',
    "externalDraftId" TEXT,
    "externalPostId" TEXT,
    "externalUrl" TEXT,
    "previewUrl" TEXT,
    "publicUrl" TEXT,
    "draftCreatedAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "x_post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "x_media" (
    "id" TEXT NOT NULL,
    "xAccountId" TEXT NOT NULL,
    "xPostId" TEXT NOT NULL,
    "provider" "XPostProvider" NOT NULL DEFAULT 'MOCK',
    "category" "XMediaCategory" NOT NULL DEFAULT 'AMPLIFY_VIDEO',
    "uploadStatus" "XMediaUploadStatus" NOT NULL DEFAULT 'PENDING',
    "processingStatus" "XMediaProcessingStatus" NOT NULL DEFAULT 'PENDING',
    "libraryStatus" "XMediaLibraryStatus" NOT NULL DEFAULT 'PENDING',
    "lastAppendedSegment" INTEGER,
    "sourceUrl" TEXT NOT NULL,
    "xMediaId" TEXT,
    "mediaKey" TEXT,
    "mimeType" TEXT,
    "contentLength" BIGINT,
    "width" INTEGER,
    "height" INTEGER,
    "durationMs" INTEGER,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "x_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "x_card" (
    "id" TEXT NOT NULL,
    "xAccountId" TEXT NOT NULL,
    "xPostId" TEXT NOT NULL,
    "xMediaId" TEXT NOT NULL,
    "provider" "XPostProvider" NOT NULL DEFAULT 'MOCK',
    "type" "XCardType" NOT NULL DEFAULT 'VIDEO_WEBSITE',
    "status" "XCardStatus" NOT NULL DEFAULT 'PENDING',
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "destinationUrl" TEXT NOT NULL,
    "xCardId" TEXT,
    "cardUri" TEXT,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "x_card_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "x_oauth_transaction" (
    "id" TEXT NOT NULL,
    "oauthToken" TEXT NOT NULL,
    "oauthTokenSecretEncrypted" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "x_oauth_transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "actorUserId" TEXT,
    "actorName" TEXT,
    "actorEmail" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" TEXT,
    "requestId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "changedFields" TEXT[],
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "x_account_xUserId_key" ON "x_account"("xUserId");

-- CreateIndex
CREATE INDEX "x_account_status_idx" ON "x_account"("status");

-- CreateIndex
CREATE INDEX "x_account_username_idx" ON "x_account"("username");

-- CreateIndex
CREATE INDEX "x_account_adsAccountId_idx" ON "x_account"("adsAccountId");

-- CreateIndex
CREATE INDEX "x_account_createdAt_idx" ON "x_account"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "x_credential_xAccountId_key" ON "x_credential"("xAccountId");

-- CreateIndex
CREATE INDEX "x_post_xAccountId_idx" ON "x_post"("xAccountId");

-- CreateIndex
CREATE INDEX "x_post_status_idx" ON "x_post"("status");

-- CreateIndex
CREATE INDEX "x_post_provider_idx" ON "x_post"("provider");

-- CreateIndex
CREATE INDEX "x_post_createdAt_idx" ON "x_post"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "x_media_xPostId_key" ON "x_media"("xPostId");

-- CreateIndex
CREATE INDEX "x_media_xAccountId_idx" ON "x_media"("xAccountId");

-- CreateIndex
CREATE INDEX "x_media_provider_idx" ON "x_media"("provider");

-- CreateIndex
CREATE INDEX "x_media_uploadStatus_idx" ON "x_media"("uploadStatus");

-- CreateIndex
CREATE INDEX "x_media_processingStatus_idx" ON "x_media"("processingStatus");

-- CreateIndex
CREATE INDEX "x_media_libraryStatus_idx" ON "x_media"("libraryStatus");

-- CreateIndex
CREATE INDEX "x_media_xMediaId_idx" ON "x_media"("xMediaId");

-- CreateIndex
CREATE INDEX "x_media_mediaKey_idx" ON "x_media"("mediaKey");

-- CreateIndex
CREATE UNIQUE INDEX "x_card_xPostId_key" ON "x_card"("xPostId");

-- CreateIndex
CREATE UNIQUE INDEX "x_card_xMediaId_key" ON "x_card"("xMediaId");

-- CreateIndex
CREATE INDEX "x_card_xAccountId_idx" ON "x_card"("xAccountId");

-- CreateIndex
CREATE INDEX "x_card_provider_idx" ON "x_card"("provider");

-- CreateIndex
CREATE INDEX "x_card_status_idx" ON "x_card"("status");

-- CreateIndex
CREATE INDEX "x_card_xCardId_idx" ON "x_card"("xCardId");

-- CreateIndex
CREATE INDEX "x_card_cardUri_idx" ON "x_card"("cardUri");

-- CreateIndex
CREATE UNIQUE INDEX "x_oauth_transaction_oauthToken_key" ON "x_oauth_transaction"("oauthToken");

-- CreateIndex
CREATE INDEX "x_oauth_transaction_expiresAt_idx" ON "x_oauth_transaction"("expiresAt");

-- CreateIndex
CREATE INDEX "audit_logs_actorUserId_idx" ON "audit_logs"("actorUserId");

-- CreateIndex
CREATE INDEX "audit_logs_resource_resourceId_idx" ON "audit_logs"("resource", "resourceId");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_requestId_idx" ON "audit_logs"("requestId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "x_credential" ADD CONSTRAINT "x_credential_xAccountId_fkey" FOREIGN KEY ("xAccountId") REFERENCES "x_account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "x_post" ADD CONSTRAINT "x_post_xAccountId_fkey" FOREIGN KEY ("xAccountId") REFERENCES "x_account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "x_media" ADD CONSTRAINT "x_media_xAccountId_fkey" FOREIGN KEY ("xAccountId") REFERENCES "x_account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "x_media" ADD CONSTRAINT "x_media_xPostId_fkey" FOREIGN KEY ("xPostId") REFERENCES "x_post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "x_card" ADD CONSTRAINT "x_card_xAccountId_fkey" FOREIGN KEY ("xAccountId") REFERENCES "x_account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "x_card" ADD CONSTRAINT "x_card_xPostId_fkey" FOREIGN KEY ("xPostId") REFERENCES "x_post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "x_card" ADD CONSTRAINT "x_card_xMediaId_fkey" FOREIGN KEY ("xMediaId") REFERENCES "x_media"("id") ON DELETE CASCADE ON UPDATE CASCADE;
