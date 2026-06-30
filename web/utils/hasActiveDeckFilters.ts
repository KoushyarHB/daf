import {
  DEFAULT_DECK_FILTER_VALUES,
  type DeckFilters,
} from "@/utils/deckFilters";

export function hasActiveDeckFilters(
  filters: DeckFilters,
  options?: { includeStudied?: boolean },
): boolean {
  const includeStudied = options?.includeStudied ?? true;
  return (
    filters.deckId !== DEFAULT_DECK_FILTER_VALUES.deckId ||
    filters.tag !== DEFAULT_DECK_FILTER_VALUES.tag ||
    filters.level !== DEFAULT_DECK_FILTER_VALUES.level ||
    filters.pos !== DEFAULT_DECK_FILTER_VALUES.pos ||
    (includeStudied &&
      filters.studied !== DEFAULT_DECK_FILTER_VALUES.studied) ||
    filters.sort !== DEFAULT_DECK_FILTER_VALUES.sort
  );
}
