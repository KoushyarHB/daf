-- Tags, card_tags, user_tag_imports; migrate from user_lektion_imports

CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "tags_slug_key" ON "tags"("slug");

CREATE TABLE "card_tags" (
    "card_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,

    CONSTRAINT "card_tags_pkey" PRIMARY KEY ("card_id","tag_id")
);

CREATE INDEX "card_tags_tag_id_idx" ON "card_tags"("tag_id");

CREATE TABLE "user_tag_imports" (
    "user_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,
    "imported_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_tag_imports_pkey" PRIMARY KEY ("user_id","tag_id")
);

CREATE INDEX "user_tag_imports_user_id_idx" ON "user_tag_imports"("user_id");

ALTER TABLE "card_tags" ADD CONSTRAINT "card_tags_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "card_tags" ADD CONSTRAINT "card_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_tag_imports" ADD CONSTRAINT "user_tag_imports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_tag_imports" ADD CONSTRAINT "user_tag_imports_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed system tags
INSERT INTO "tags" ("id", "slug", "label", "created_at", "updated_at") VALUES
    ('tag-user', 'user', 'user', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('tag-daf-lek-1', 'daf-lek-1', 'daf lek. 1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('tag-daf-lek-2', 'daf-lek-2', 'daf lek. 2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Community cards: tag by lektion (daf-lek-N)
INSERT INTO "card_tags" ("card_id", "tag_id")
SELECT c."id", t."id"
FROM "cards" c
JOIN "users" u ON u."id" = c."user_id" AND u."email" = 'system@import.local'
JOIN "tags" t ON t."slug" = 'daf-lek-' || c."lektion"::text
WHERE c."lektion" IS NOT NULL
ON CONFLICT DO NOTHING;

-- User-owned cards (non-community): user tag
INSERT INTO "card_tags" ("card_id", "tag_id")
SELECT c."id", 'tag-user'
FROM "cards" c
JOIN "users" u ON u."id" = c."user_id" AND u."email" <> 'system@import.local'
ON CONFLICT DO NOTHING;

-- Migrate lektion imports → tag imports
INSERT INTO "user_tag_imports" ("user_id", "tag_id", "imported_at")
SELECT uli."user_id", t."id", uli."imported_at"
FROM "user_lektion_imports" uli
JOIN "tags" t ON t."slug" = 'daf-lek-' || uli."lektion"::text
ON CONFLICT DO NOTHING;

DROP TABLE "user_lektion_imports";
