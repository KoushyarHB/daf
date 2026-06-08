-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "VocabPos" AS ENUM ('noun', 'verb', 'adjective', 'adverb', 'phrase', 'grammar', 'other');

-- CreateEnum
CREATE TYPE "LessonPageKind" AS ENUM ('word', 'grammar');

-- CreateTable
CREATE TABLE "cards" (
    "id" TEXT NOT NULL,
    "head" TEXT NOT NULL,
    "ipa" TEXT,
    "pos" "VocabPos" NOT NULL DEFAULT 'other',
    "plural_rule" TEXT,
    "plural_form" TEXT,
    "image_path" TEXT,
    "audio_path" TEXT,
    "lektion" INTEGER,
    "level" TEXT NOT NULL DEFAULT 'A1',
    "sort_order" INTEGER NOT NULL,
    "grammar_table" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "card_glosses" (
    "id" TEXT NOT NULL,
    "card_id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL,

    CONSTRAINT "card_glosses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "card_notes" (
    "id" TEXT NOT NULL,
    "card_id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL,

    CONSTRAINT "card_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "card_examples" (
    "id" TEXT NOT NULL,
    "card_id" TEXT NOT NULL,
    "german" TEXT NOT NULL,
    "english" TEXT,
    "audio_path" TEXT,
    "sort_order" INTEGER NOT NULL,

    CONSTRAINT "card_examples_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lessons" (
    "lektion" INTEGER NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "lessons_pkey" PRIMARY KEY ("lektion")
);

-- CreateTable
CREATE TABLE "lesson_pages" (
    "id" TEXT NOT NULL,
    "lesson_id" INTEGER NOT NULL,
    "kind" "LessonPageKind" NOT NULL,
    "label" TEXT NOT NULL,
    "image_path" TEXT NOT NULL,

    CONSTRAINT "lesson_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_card_progress" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "card_id" TEXT NOT NULL,
    "studied" BOOLEAN NOT NULL DEFAULT true,
    "studied_at" TIMESTAMPTZ,

    CONSTRAINT "user_card_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cards_sort_order_key" ON "cards"("sort_order");

-- CreateIndex
CREATE INDEX "cards_lektion_idx" ON "cards"("lektion");

-- CreateIndex
CREATE INDEX "cards_pos_idx" ON "cards"("pos");

-- CreateIndex
CREATE INDEX "cards_level_idx" ON "cards"("level");

-- CreateIndex
CREATE INDEX "cards_sort_order_idx" ON "cards"("sort_order");

-- CreateIndex
CREATE INDEX "card_glosses_card_id_idx" ON "card_glosses"("card_id");

-- CreateIndex
CREATE INDEX "card_notes_card_id_idx" ON "card_notes"("card_id");

-- CreateIndex
CREATE INDEX "card_examples_card_id_idx" ON "card_examples"("card_id");

-- CreateIndex
CREATE UNIQUE INDEX "lesson_pages_lesson_id_kind_key" ON "lesson_pages"("lesson_id", "kind");

-- CreateIndex
CREATE INDEX "user_card_progress_session_id_idx" ON "user_card_progress"("session_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_card_progress_session_id_card_id_key" ON "user_card_progress"("session_id", "card_id");

-- AddForeignKey
ALTER TABLE "card_glosses" ADD CONSTRAINT "card_glosses_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card_notes" ADD CONSTRAINT "card_notes_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card_examples" ADD CONSTRAINT "card_examples_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_pages" ADD CONSTRAINT "lesson_pages_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("lektion") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_card_progress" ADD CONSTRAINT "user_card_progress_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

