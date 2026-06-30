import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { AdminDeckDto, AdminUserRow } from "@/lib/api/dto";
import type { UserRole } from "@/lib/auth/roles";
import { adminKeys, cardKeys } from "@/lib/api/query-keys";
import * as adminClient from "@/services/frontend/admin.client";

export type { AdminDeckDto, AdminUserRow };

export function useAdminUsersQuery(
  q: string,
  options?: { enabled?: boolean; initialData?: AdminUserRow[] },
) {
  return useQuery({
    queryKey: adminKeys.users(q),
    queryFn: ({ signal }) => adminClient.fetchAdminUsers(q, signal),
    enabled: options?.enabled ?? true,
    initialData: options?.initialData,
    staleTime: 30_000,
  });
}

export function useAdminDecksQuery(
  q: string,
  options?: { enabled?: boolean; initialData?: AdminDeckDto[] },
) {
  return useQuery({
    queryKey: adminKeys.decks(q),
    queryFn: ({ signal }) => adminClient.fetchAdminDecks(q, signal),
    enabled: options?.enabled ?? true,
    initialData: options?.initialData,
    staleTime: 30_000,
  });
}

export function useAdminDeckQuery(
  deckId: string,
  options?: { enabled?: boolean; initialData?: AdminDeckDto },
) {
  return useQuery({
    queryKey: adminKeys.deck(deckId),
    queryFn: ({ signal }) => adminClient.fetchAdminDeck(deckId, signal),
    enabled: options?.enabled ?? true,
    initialData: options?.initialData,
    staleTime: 30_000,
  });
}

export function useUpdateAdminUserRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: UserRole }) =>
      adminClient.updateAdminUserRole(userId, role),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useDeleteAdminUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminClient.deleteAdminUser,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useCreateAdminUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminClient.createAdminUser,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useUpdateAdminDeckMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ deckId, name }: { deckId: string; name: string }) =>
      adminClient.updateAdminDeck(deckId, name),
    onSuccess: (_data, { deckId }) => {
      void queryClient.invalidateQueries({ queryKey: adminKeys.deck(deckId) });
      void queryClient.invalidateQueries({ queryKey: ["admin", "decks"] });
    },
  });
}

export function usePublishAdminDeckMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminClient.publishAdminDeck,
    onSuccess: (_data, deckId) => {
      void queryClient.invalidateQueries({ queryKey: adminKeys.deck(deckId) });
      void queryClient.invalidateQueries({ queryKey: ["admin", "decks"] });
      void queryClient.invalidateQueries({ queryKey: cardKeys.all });
    },
  });
}

export function useUnpublishAdminDeckMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminClient.unpublishAdminDeck,
    onSuccess: (_data, deckId) => {
      void queryClient.invalidateQueries({ queryKey: adminKeys.deck(deckId) });
      void queryClient.invalidateQueries({ queryKey: ["admin", "decks"] });
      void queryClient.invalidateQueries({ queryKey: cardKeys.all });
    },
  });
}
