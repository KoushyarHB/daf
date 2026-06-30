import type { CefrLevel } from "@/lib/vocab/levels";
import type { VocabPos } from "@/lib/vocab/types";

export type ExampleRow = {
  key: string;
  german: string;
  english: string;
  audio: string;
};

export type CardFormState = {
  head: string;
  ipa: string;
  gloss: string;
  notes: string;
  audio: string;
  examples: ExampleRow[];
  tagSlugs: string[];
  deckId: string;
  level: CefrLevel;
  pos: VocabPos;
};
