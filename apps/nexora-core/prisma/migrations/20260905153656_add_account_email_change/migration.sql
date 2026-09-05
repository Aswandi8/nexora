-- CreateTable
CREATE TABLE "account_email_change" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "newEmail" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_email_change_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "account_email_change_userId_key" ON "account_email_change"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "account_email_change_tokenHash_key" ON "account_email_change"("tokenHash");

-- CreateIndex
CREATE INDEX "account_email_change_newEmail_idx" ON "account_email_change"("newEmail");

-- CreateIndex
CREATE INDEX "account_email_change_expiresAt_idx" ON "account_email_change"("expiresAt");

-- AddForeignKey
ALTER TABLE "account_email_change" ADD CONSTRAINT "account_email_change_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
