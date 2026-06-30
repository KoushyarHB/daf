import type {
  CardSuggestResult,
  CardsListParams,
  FilterOptions,
  ImportStatus,
  SaveCardBody,
} from "@/lib/api/dto";
import type { PaginatedResponse } from "@/lib/api/types";
import type { EnrichedVocabCard } from "@/lib/vocab/types";
import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
} from "@/services/frontend/http";

export type {
  CardSuggestResult,
  CardsListParams,
  FilterOptions,
  ImportStatus,
  SaveCardBody,
};

function cardsSearchParams(params: CardsListParams): string {
  const sp = new URLSearchParams();
  sp.set("page", String(params.page));
  sp.set("pageSize", String(params.pageSize));
  if (params.deckId) sp.set("deckId", params.deckId);
  if (params.tag) sp.set("tag", params.tag);
  if (params.level) sp.set("level", params.level);
  if (params.pos) sp.set("pos", params.pos);
  if (params.studied) sp.set("studied", params.studied);
  sp.set("sort", params.sort);
  return sp.toString();
}

export async function fetchCards(
  params: CardsListParams,
  signal?: AbortSignal,
): Promise<PaginatedResponse<EnrichedVocabCard>> {
  return apiGet(`/api/cards?${cardsSearchParams(params)}`, signal);
}

export async function fetchFilterOptions(
  signal?: AbortSignal,
): Promise<FilterOptions> {
  return apiGet("/api/cards/filter-options", signal);
}

export async function fetchImportStatus(
  signal?: AbortSignal,
): Promise<ImportStatus> {
  return apiGet("/api/cards/import-status", signal);
}

export async function updateCardProgress(
  domId: string,
  studied: boolean,
): Promise<void> {
  await apiPatch(`/api/cards/${encodeURIComponent(domId)}/progress`, {
    studied,
  });
}

export async function deleteCard(domId: string): Promise<void> {
  await apiDelete(`/api/cards/${encodeURIComponent(domId)}`);
}

export async function importCommunityTag(slug: string): Promise<void> {
  await apiPost("/api/cards/import-tag", { slug });
}

export async function deimportCommunityTag(slug: string): Promise<void> {
  await apiPost("/api/cards/deimport-tag", { slug });
}

export async function generateCardAudio(body: {
  text?: string;
  head?: string;
}): Promise<{ audio?: string }> {
  return apiPost("/api/cards/generate-audio", body);
}

export async function suggestCard(head: string): Promise<CardSuggestResult> {
  return apiPost("/api/cards/suggest", { head });
}

export async function saveCard(input: {
  mode: "create" | "edit";
  domId?: string;
  adminDeckId?: string;
  body: SaveCardBody;
}): Promise<EnrichedVocabCard> {
  const { mode, domId, adminDeckId, body } = input;
  const url =
    mode === "edit" && domId
      ? adminDeckId
        ? `/api/admin/decks/${encodeURIComponent(adminDeckId)}/cards/${encodeURIComponent(domId)}`
        : `/api/cards/${encodeURIComponent(domId)}`
      : "/api/cards";
  return mode === "edit"
    ? apiPatch<EnrichedVocabCard>(url, body)
    : apiPost<EnrichedVocabCard>(url, body);
}
