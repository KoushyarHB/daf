import type { EnrichedVocabCard } from "./types";

/** Shared community import, not yet forked by this user */
export function isPristineCommunityCard(card: EnrichedVocabCard): boolean {
  return Boolean(card.isCommunity && !card.isCustomized);
}

export function cardEditLabel(card: EnrichedVocabCard): string {
  return isPristineCommunityCard(card) ? "Customize" : "Edit";
}

export function cardRemoveLabel(card: EnrichedVocabCard): string {
  return isPristineCommunityCard(card) ? "Remove" : "Delete";
}
