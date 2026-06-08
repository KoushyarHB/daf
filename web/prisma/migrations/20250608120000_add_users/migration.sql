-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- Default manifest-import owner (password not for login)
INSERT INTO "users" ("id", "email", "password_hash", "name", "created_at")
VALUES (
    'default-import-user',
    'system@import.local',
    '$2a$12$invalidhashplaceholderonlyforimportowner0000000000000000000',
    'Manifest import',
    CURRENT_TIMESTAMP
);

-- Add owner column (nullable until backfill)
ALTER TABLE "cards" ADD COLUMN "user_id" TEXT;

UPDATE "cards" SET "user_id" = 'default-import-user' WHERE "user_id" IS NULL;

ALTER TABLE "cards" ALTER COLUMN "user_id" SET NOT NULL;

CREATE INDEX "cards_user_id_idx" ON "cards"("user_id");

ALTER TABLE "cards" ADD CONSTRAINT "cards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Replace session-based progress with user-based progress
DROP TABLE IF EXISTS "user_card_progress";

CREATE TABLE "user_card_progress" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "card_id" TEXT NOT NULL,
    "studied" BOOLEAN NOT NULL DEFAULT true,
    "studied_at" TIMESTAMPTZ,

    CONSTRAINT "user_card_progress_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "user_card_progress_user_id_idx" ON "user_card_progress"("user_id");

CREATE UNIQUE INDEX "user_card_progress_user_id_card_id_key" ON "user_card_progress"("user_id", "card_id");

ALTER TABLE "user_card_progress" ADD CONSTRAINT "user_card_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_card_progress" ADD CONSTRAINT "user_card_progress_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;
