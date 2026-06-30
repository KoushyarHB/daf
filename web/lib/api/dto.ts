import type { UserRole } from "@/lib/auth/roles";
import type { VocabPos } from "@/lib/vocab/types";

/** JSON shapes returned by API routes — safe for client and server UI code. */

export type DeckDto = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  level: string;
  isSystem: boolean;
  cardCount: number;
  publishedAt: string | null;
  publishedTagSlug: string | null;
  publishedTagLabel: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminDeckDto = DeckDto & {
  ownerEmail: string;
  ownerName: string | null;
};

export type DeckOption = { id: string; name: string };

export type TagOption = { slug: string; label: string };

export type TagRow = {
  id: string;
  slug: string;
  label: string;
  isSystem: boolean;
  createdById: string | null;
  cardCount?: number;
};

export type AdminUserRow = {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  createdAt: string;
};

export type CardsListParams = {
  page: number;
  pageSize: number;
  deckId?: string;
  tag?: string;
  level?: string;
  pos?: string;
  studied?: string;
  sort: string;
};

export type FilterOptions = {
  tags: { slug: string; label: string }[];
  levels: string[];
  posValues: VocabPos[];
};

export type ImportStatus = {
  importedTagSlugs: string[];
  availableTags: {
    slug: string;
    label: string;
    level: string;
    cardCount: number;
    imported: boolean;
  }[];
  hasUserCreatedCard: boolean;
  showImportOnHome: boolean;
};

export type CardSuggestResult = {
  head?: string;
  ipa?: string;
  gloss?: string;
  notes?: string;
  examples?: { german: string; english: string }[];
  pos?: VocabPos;
  level?: string;
};

export type SaveCardBody = {
  head: string;
  ipa?: string;
  audio?: string;
  gloss: string[];
  notes: string[];
  examples: { german: string; english: string | null; audio?: string }[];
  tags: string[];
  deckId?: string;
  level: string;
  pos: VocabPos;
};
