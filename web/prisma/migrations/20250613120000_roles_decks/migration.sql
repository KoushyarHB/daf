-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('user', 'admin', 'super_admin');

-- AlterTable
ALTER TABLE "users" ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'user';

-- CreateTable
CREATE TABLE "decks" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "level" TEXT NOT NULL DEFAULT 'A1',
    "published_at" TIMESTAMPTZ,
    "published_tag_id" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "decks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deck_publishes" (
    "id" TEXT NOT NULL,
    "source_deck_id" TEXT NOT NULL,
    "published_by_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,
    "card_count" INTEGER NOT NULL,
    "published_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deck_publishes_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "cards" ADD COLUMN "deck_id" TEXT;
ALTER TABLE "cards" ADD COLUMN "published_from_card_id" TEXT;

-- CreateIndex
CREATE INDEX "decks_user_id_idx" ON "decks"("user_id");
CREATE UNIQUE INDEX "decks_user_id_slug_key" ON "decks"("user_id", "slug");

-- CreateIndex
CREATE INDEX "deck_publishes_source_deck_id_idx" ON "deck_publishes"("source_deck_id");

-- CreateIndex
CREATE INDEX "cards_deck_id_idx" ON "cards"("deck_id");
CREATE INDEX "cards_published_from_card_id_idx" ON "cards"("published_from_card_id");

-- AddForeignKey
ALTER TABLE "decks" ADD CONSTRAINT "decks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "decks" ADD CONSTRAINT "decks_published_tag_id_fkey" FOREIGN KEY ("published_tag_id") REFERENCES "tags"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deck_publishes" ADD CONSTRAINT "deck_publishes_source_deck_id_fkey" FOREIGN KEY ("source_deck_id") REFERENCES "decks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "deck_publishes" ADD CONSTRAINT "deck_publishes_published_by_id_fkey" FOREIGN KEY ("published_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "deck_publishes" ADD CONSTRAINT "deck_publishes_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cards" ADD CONSTRAINT "cards_deck_id_fkey" FOREIGN KEY ("deck_id") REFERENCES "decks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "cards" ADD CONSTRAINT "cards_published_from_card_id_fkey" FOREIGN KEY ("published_from_card_id") REFERENCES "cards"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill: one default deck per user with personal cards (not community import user)
INSERT INTO "decks" ("id", "user_id", "name", "slug", "level", "created_at", "updated_at")
SELECT
    'deck-default-' || u."id",
    u."id",
    'My deck',
    'my-deck',
    'A1',
    NOW(),
    NOW()
FROM "users" u
WHERE u."email" <> 'system@import.local'
  AND EXISTS (
    SELECT 1 FROM "cards" c
    WHERE c."user_id" = u."id"
      AND c."source_card_id" IS NULL
  )
  AND NOT EXISTS (
    SELECT 1 FROM "decks" d WHERE d."user_id" = u."id"
  );

UPDATE "cards" c
SET "deck_id" = 'deck-default-' || c."user_id"
WHERE c."deck_id" IS NULL
  AND c."source_card_id" IS NULL
  AND c."user_id" IN (SELECT "id" FROM "users" WHERE "email" <> 'system@import.local')
  AND EXISTS (SELECT 1 FROM "decks" d WHERE d."id" = 'deck-default-' || c."user_id");
