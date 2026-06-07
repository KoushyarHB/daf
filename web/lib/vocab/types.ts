export type VocabExample = {
  german: string;
  english: string | null;
  audio?: string;
};

export type GrammarTable = {
  columns: string[];
  rows: string[][];
};

export type VocabCard = {
  head: string;
  id?: string;
  gloss: string[];
  notes: string[];
  examples: VocabExample[];
  plural?: string;
  grammarTable?: GrammarTable | null;
  image?: string;
  audio?: string;
  createdAt?: string;
  updatedAt?: string;
  lektion: number | null;
  level: string;
};

export type EnrichedVocabCard = VocabCard & {
  deckNo: number;
  domId: string;
  listLabel: string;
  createdMs: number;
  pluralLine: string | null;
  grammarTable: GrammarTable | null;
  examples: VocabExample[];
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

export type SortOrder = "deck" | "date-desc" | "date-asc";
export type ViewMode = "cards" | "list";
