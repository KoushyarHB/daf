import { normalizeCefrLevel } from "@/lib/vocab/levels";
import type { EnrichedVocabCard } from "@/lib/vocab/types";
import type { CardFormState } from "@/utils/cardFormTypes";
import { emptyExample } from "@/utils/emptyExample";
import { newExampleKey } from "@/utils/newExampleKey";

export function cardToForm(card: EnrichedVocabCard): CardFormState {
  const examples =
    card.examples.length > 0
      ? card.examples.map((ex) => ({
          key: newExampleKey(),
          german: ex.german ?? "",
          english: ex.english ?? "",
          audio: ex.audio ?? "",
        }))
      : [emptyExample()];

  return {
    head: card.head,
    ipa: card.ipa ?? "",
    audio: card.audio ?? "",
    gloss: (card.gloss ?? []).join("\n").trim(),
    notes: (card.notes ?? []).join("\n").trim(),
    examples,
    tagSlugs: (card.tags ?? []).map((t) => t.slug),
    deckId: card.deckId ?? "",
    level: normalizeCefrLevel(card.level),
    pos: card.pos ?? "other",
  };
}
