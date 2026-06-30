import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";

import type {
  CardsListParams,
  FilterOptions,
  ImportStatus,
} from "@/lib/api/dto";
import type { PaginatedResponse } from "@/lib/api/types";
import type { EnrichedVocabCard } from "@/lib/vocab/types";
import * as cardsClient from "@/services/frontend/cards.client";
import { cardKeys, CARDS_STALE_TIME_MS } from "@/hooks/query-keys";

export type {
  CardSuggestResult,
  CardsListParams,
  FilterOptions,
  ImportStatus,
  SaveCardBody,
} from "@/lib/api/dto";

export function invalidateCardQueries(queryClient: QueryClient): Promise<void> {
  return queryClient.invalidateQueries({ queryKey: cardKeys.all });
}

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

export function useCardsQuery(
  params: CardsListParams,
  options?: {
    enabled?: boolean;
    initialData?: PaginatedResponse<EnrichedVocabCard>;
    initialDeckId?: string;
  },
) {
  const initialData =
    options?.initialData &&
    matchesInitialCardsQuery(params, options.initialDeckId)
      ? options.initialData
      : undefined;

  return useQuery({
    queryKey: cardKeys.list(params),
    queryFn: ({ signal }) => cardsClient.fetchCards(params, signal),
    enabled: options?.enabled ?? true,
    initialData,
    staleTime: CARDS_STALE_TIME_MS,
    placeholderData: (previous) => previous,
  });
}

export function useFilterOptionsQuery(options?: {
  enabled?: boolean;
  initialData?: FilterOptions;
}) {
  return useQuery({
    queryKey: cardKeys.filterOptions(),
    queryFn: ({ signal }) => cardsClient.fetchFilterOptions(signal),
    enabled: options?.enabled ?? true,
    initialData: options?.initialData,
    staleTime: CARDS_STALE_TIME_MS,
  });
}

export function useImportStatusQuery(options?: {
  enabled?: boolean;
  initialData?: ImportStatus;
}) {
  return useQuery({
    queryKey: cardKeys.importStatus(),
    queryFn: ({ signal }) => cardsClient.fetchImportStatus(signal),
    enabled: options?.enabled ?? true,
    initialData: options?.initialData,
    staleTime: 60_000,
  });
}

export function useUpdateCardProgressMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ domId, studied }: { domId: string; studied: boolean }) =>
      cardsClient.updateCardProgress(domId, studied),
    onMutate: async ({ domId, studied }) => {
      await queryClient.cancelQueries({ queryKey: cardKeys.lists() });
      const snapshots = queryClient.getQueriesData<PaginatedResponse<EnrichedVocabCard>>({
        queryKey: cardKeys.lists(),
      });
      for (const [key, data] of snapshots) {
        if (!data) continue;
        queryClient.setQueryData(key, {
          ...data,
          items: data.items.map((c) =>
            c.domId === domId ? { ...c, studied } : c,
          ),
        });
      }
      return { snapshots };
    },
    onError: (_err, _vars, context) => {
      for (const [key, data] of context?.snapshots ?? []) {
        queryClient.setQueryData(key, data);
      }
    },
    onSettled: () => invalidateCardQueries(queryClient),
  });
}

export function useDeleteCardMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (domId: string) => cardsClient.deleteCard(domId),
    onSuccess: () => invalidateCardQueries(queryClient),
  });
}

export function useImportTagMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => cardsClient.importCommunityTag(slug),
    onSuccess: () => invalidateCardQueries(queryClient),
  });
}

export function useDeimportTagMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => cardsClient.deimportCommunityTag(slug),
    onSuccess: () => invalidateCardQueries(queryClient),
  });
}

export function useGenerateCardAudioMutation() {
  return useMutation({
    mutationFn: cardsClient.generateCardAudio,
  });
}

export function useSuggestCardMutation() {
  return useMutation({
    mutationFn: (head: string) => cardsClient.suggestCard(head),
  });
}

export function useSaveCardMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cardsClient.saveCard,
    onSuccess: () => invalidateCardQueries(queryClient),
  });
}
