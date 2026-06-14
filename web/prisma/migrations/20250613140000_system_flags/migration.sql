-- AlterTable
ALTER TABLE "tags" ADD COLUMN IF NOT EXISTS "is_system" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "tags" ADD COLUMN IF NOT EXISTS "created_by_id" TEXT;

-- AlterTable
ALTER TABLE "decks" ADD COLUMN IF NOT EXISTS "is_system" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "tags_created_by_id_idx" ON "tags"("created_by_id");

-- AddForeignKey (idempotent via DO block)
DO $$ BEGIN
  ALTER TABLE "tags" ADD CONSTRAINT "tags_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Mark well-known import tags as system
UPDATE "tags" SET "is_system" = true WHERE "slug" IN ('user', 'daf-lek-1', 'daf-lek-2');

-- Published community tags (deck publish flow)
UPDATE "tags" SET "is_system" = true WHERE "slug" LIKE 'deck-%';
