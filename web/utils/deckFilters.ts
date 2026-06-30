import type { SortOrder, StudiedFilter, ViewMode } from "@/lib/vocab/types";

export type DeckFilters = {
  deckId: string;
  tag: string;
  level: string;
  pos: string;
  studied: StudiedFilter;
  sort: SortOrder;
  view: ViewMode;
  pageSize: string;
};

export const DEFAULT_DECK_FILTER_VALUES = {
  deckId: "all",
  tag: "all",
  level: "all",
  pos: "all",
  studied: "all" as StudiedFilter,
  sort: "deck-desc" as SortOrder,
};
