import type { CardsListParams } from "@/lib/api/dto";

export const CARDS_STALE_TIME_MS = 5 * 60 * 1000;

export const cardKeys = {
  all: ["cards"] as const,
  lists: () => [...cardKeys.all, "list"] as const,
  list: (params: CardsListParams) => [...cardKeys.lists(), params] as const,
  filterOptions: () => [...cardKeys.all, "filter-options"] as const,
  importStatus: () => [...cardKeys.all, "import-status"] as const,
};

export const deckKeys = {
  all: ["decks"] as const,
  list: (params: Record<string, string>) => [...deckKeys.all, "list", params] as const,
};

export const tagKeys = {
  all: ["tags"] as const,
  list: (params: Record<string, string>) => [...tagKeys.all, "list", params] as const,
};

export const adminKeys = {
  users: (q: string) => ["admin", "users", q] as const,
  decks: (q: string) => ["admin", "decks", q] as const,
  deck: (id: string) => ["admin", "decks", id] as const,
};
