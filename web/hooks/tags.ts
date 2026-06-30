import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { TagRow } from "@/lib/api/dto";
import * as tagsClient from "@/services/frontend/tags.client";
import { cardKeys, tagKeys } from "@/hooks/query-keys";

export type { TagOption, TagRow } from "@/lib/api/dto";

export function useTagsQuery(options?: {
  enabled?: boolean;
  initialData?: TagRow[];
  params?: Record<string, string>;
}) {
  const params = options?.params ?? { counts: "true", pageSize: "100" };
  return useQuery({
    queryKey: tagKeys.list(params),
    queryFn: ({ signal }) => tagsClient.fetchTags(params, signal),
    enabled: options?.enabled ?? true,
    select: (data) => data.items as TagRow[],
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

export function useSaveTagMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tagsClient.saveTag,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: tagKeys.all });
      void queryClient.invalidateQueries({ queryKey: cardKeys.filterOptions() });
    },
  });
}

export function useDeleteTagMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tagsClient.deleteTag,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: tagKeys.all });
      void queryClient.invalidateQueries({ queryKey: cardKeys.filterOptions() });
    },
  });
}
