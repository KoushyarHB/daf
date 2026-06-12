-- Per-user opt-in: which Lektion community decks are visible when signed in.
CREATE TABLE "user_lektion_imports" (
    "user_id" TEXT NOT NULL,
    "lektion" INTEGER NOT NULL,
    "imported_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_lektion_imports_pkey" PRIMARY KEY ("user_id", "lektion")
);

CREATE INDEX "user_lektion_imports_user_id_idx" ON "user_lektion_imports"("user_id");

ALTER TABLE "user_lektion_imports" ADD CONSTRAINT "user_lektion_imports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
