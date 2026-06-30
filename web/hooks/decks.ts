import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { DeckDto } from "@/lib/api/dto";
import * as decksClient from "@/services/frontend/decks.client";
import { cardKeys, deckKeys } from "@/hooks/query-keys";

export type DeckRow = DeckDto;
export type { DeckOption } from "@/lib/api/dto";

export function useDecksQuery(options?: {
  enabled?: boolean;
  initialData?: DeckRow[];
  params?: Record<string, string>;
}) {
  const params = options?.params ?? { pageSize: "100" };
  return useQuery({
    queryKey: deckKeys.list(params),
    queryFn: ({ signal }) => decksClient.fetchDecks(params, signal),
    enabled: options?.enabled ?? true,
    select: (data) => data.items,
    initialData: options?.initialData
      ? {
          page: 1,
          pageSize: 100,
          totalItems: options.initialData.length,
          totalPages: 1,
          items: options.initialData,
        }
      : undefined,
    staleTime: 60_000,
  });
}

export function useDeckOptionsQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: deckKeys.list({ pageSize: "100", scope: "options" }),
    queryFn: ({ signal }) => decksClient.fetchDeckOptions(signal),
    enabled: options?.enabled ?? true,
    staleTime: 60_000,
  });
}

export function useCreateDeckMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: decksClient.createDeck,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: deckKeys.all });
      void queryClient.invalidateQueries({ queryKey: cardKeys.all });
    },
  });
}

export function useDeleteDeckMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: decksClient.deleteDeck,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: deckKeys.all });
      void queryClient.invalidateQueries({ queryKey: cardKeys.all });
    },
  });
}
