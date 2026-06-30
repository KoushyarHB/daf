import { TAG_USER } from "@/lib/tags/constants";
import type { CardFormState } from "@/utils/cardFormTypes";
import { emptyExample } from "@/utils/emptyExample";

export function emptyForm(deckId = ""): CardFormState {
  return {
    head: "",
    ipa: "",
    gloss: "",
    notes: "",
    audio: "",
    examples: [emptyExample()],
    tagSlugs: [TAG_USER],
    deckId,
    level: "A1",
    pos: "other",
  };
}
