import type { DeckDto, DeckOption } from "@/lib/api/dto";
import type { PaginatedResponse } from "@/lib/api/types";
import {
  apiDelete,
  apiGet,
  apiPost,
} from "@/services/frontend/http";

export type DeckRow = DeckDto;

export async function fetchDecks(
  params: Record<string, string> = { pageSize: "100" },
  signal?: AbortSignal,
): Promise<PaginatedResponse<DeckRow>> {
  const sp = new URLSearchParams(params);
  return apiGet(`/api/decks?${sp}`, signal);
}

export async function fetchDeckOptions(
  signal?: AbortSignal,
): Promise<DeckOption[]> {
  const data = await fetchDecks({ pageSize: "100" }, signal);
  return data.items.map((d) => ({ id: d.id, name: d.name }));
}

export async function createDeck(body: {
  name: string;
  level: string;
}): Promise<void> {
  await apiPost("/api/decks", body);
}

export async function deleteDeck(deckId: string): Promise<void> {
  await apiDelete(`/api/decks/${encodeURIComponent(deckId)}`);
}
