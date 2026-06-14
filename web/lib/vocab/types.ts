export type VocabPos =
  | "noun"
  | "verb"
  | "adjective"
  | "adverb"
  | "phrase"
  | "grammar"
  | "other";

export const VOCAB_POS_ORDER: VocabPos[] = [
  "noun",
  "verb",
  "adjective",
  "adverb",
  "phrase",
  "grammar",
  "other",
];

const POS_LABELS: Record<VocabPos, string> = {
  noun: "Noun",
  verb: "Verb",
  adjective: "Adjective",
  adverb: "Adverb",
  phrase: "Phrase",
  grammar: "Grammar",
  other: "Other",
};

export function posLabel(pos: VocabPos | string | undefined | null): string {
  const key = (pos ?? "other").trim().toLowerCase() as VocabPos;
  return POS_LABELS[key] ?? key.charAt(0).toUpperCase() + key.slice(1);
}

export function normalizeVocabPos(
  pos: VocabPos | string | undefined | null,
): VocabPos {
  const key = (pos ?? "other").trim().toLowerCase();
  return (VOCAB_POS_ORDER as readonly string[]).includes(key)
    ? (key as VocabPos)
    : "other";
}

export type VocabExample = {
  german: string;
  english: string | null;
  audio?: string;
};

export type GrammarTable = {
  columns: string[];
  rows: string[][];
};

export type CardTagRef = {
  slug: string;
  label: string;
};

export type VocabCard = {
  head: string;
  ipa?: string;
  id?: string;
  pos?: VocabPos;
  gloss: string[];
  notes: string[];
  examples: VocabExample[];
  pluralRule?: string;
  plural?: string;
  grammarTable?: GrammarTable | null;
  image?: string;
  audio?: string;
  createdAt?: string;
  updatedAt?: string;
  /** @deprecated Use tags; kept for manifest import compatibility. */
  lektion?: number | null;
  level: string;
  tags: CardTagRef[];
  deckId?: string | null;
};

export type EnrichedVocabCard = VocabCard & {
  deckNo: number;
  domId: string;
  listLabel: string;
  createdMs: number;
  pluralLine: string | null;
  grammarTable: GrammarTable | null;
  examples: VocabExample[];
  studied?: boolean;
  /** Community deck card (shared import or personal fork of one) */
  isCommunity?: boolean;
  /** Personal fork of a community card */
  isCustomized?: boolean;
  /** Signed-in user owns this row (personal or fork) */
  isOwned?: boolean;
  sourceCardId?: string | null;
};

export type LessonPageRef = {
  label: string;
  image: string;
};

export type LessonPageEntry = {
  lektion: number;
  title: string;
  wordPage: LessonPageRef;
  grammarPage: LessonPageRef;
};

export type SortOrder = "deck-desc" | "deck-asc" | "date-desc" | "date-asc";
export type ViewMode = "cards" | "list";
export type StudiedFilter = "all" | "studied" | "unstudied";
