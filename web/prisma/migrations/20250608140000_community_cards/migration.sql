-- Fork link: personal copy of a community card
ALTER TABLE "cards" ADD COLUMN "source_card_id" TEXT;

CREATE INDEX "cards_source_card_id_idx" ON "cards"("source_card_id");

ALTER TABLE "cards" ADD CONSTRAINT "cards_source_card_id_fkey"
  FOREIGN KEY ("source_card_id") REFERENCES "cards"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- User hid a community card from their deck (does not delete the card)
CREATE TABLE "user_card_hidden" (
    "user_id" TEXT NOT NULL,
    "card_id" TEXT NOT NULL,
    "hidden_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_card_hidden_pkey" PRIMARY KEY ("user_id", "card_id")
);

CREATE INDEX "user_card_hidden_user_id_idx" ON "user_card_hidden"("user_id");

ALTER TABLE "user_card_hidden" ADD CONSTRAINT "user_card_hidden_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_card_hidden" ADD CONSTRAINT "user_card_hidden_card_id_fkey"
  FOREIGN KEY ("card_id") REFERENCES "cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;
