import type { CardsListParams } from "@/lib/api/dto";

export function matchesInitialCardsQuery(
  params: CardsListParams,
  initialDeckId?: string,
): boolean {
  return (
    params.page === 1 &&
    params.pageSize === 25 &&
    params.sort === "deck-desc" &&
    (params.deckId ?? undefined) === (initialDeckId || undefined) &&
    !params.tag &&
    !params.level &&
    !params.pos &&
    !params.studied
  );
}
