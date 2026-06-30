import type { AdminDeckDto, AdminUserRow } from "@/lib/api/dto";
import type { UserRole } from "@/lib/auth/roles";
import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
} from "@/services/frontend/http";

export type { AdminDeckDto, AdminUserRow };

export async function fetchAdminUsers(
  q: string,
  signal?: AbortSignal,
): Promise<AdminUserRow[]> {
  const params = new URLSearchParams({ pageSize: "100" });
  if (q.trim()) params.set("q", q.trim());
  const data = await apiGet<{ items?: AdminUserRow[] }>(
    `/api/admin/users?${params}`,
    signal,
  );
  return data.items ?? [];
}

export async function fetchAdminDecks(
  q: string,
  signal?: AbortSignal,
): Promise<AdminDeckDto[]> {
  const params = new URLSearchParams({ pageSize: "50" });
  if (q.trim()) params.set("q", q.trim());
  const data = await apiGet<{ items?: AdminDeckDto[] }>(
    `/api/admin/decks?${params}`,
    signal,
  );
  return data.items ?? [];
}

export async function fetchAdminDeck(
  deckId: string,
  signal?: AbortSignal,
): Promise<AdminDeckDto> {
  return apiGet(`/api/admin/decks/${encodeURIComponent(deckId)}`, signal);
}

export async function updateAdminUserRole(
  userId: string,
  role: UserRole,
): Promise<void> {
  await apiPatch(`/api/admin/users/${encodeURIComponent(userId)}`, { role });
}

export async function deleteAdminUser(userId: string): Promise<void> {
  await apiDelete(`/api/admin/users/${encodeURIComponent(userId)}`);
}

export async function createAdminUser(body: {
  email: string;
  password: string;
  name?: string;
  role: UserRole;
}): Promise<void> {
  await apiPost("/api/admin/users", body);
}

export async function updateAdminDeck(
  deckId: string,
  name: string,
): Promise<AdminDeckDto> {
  return apiPatch(`/api/admin/decks/${encodeURIComponent(deckId)}`, { name });
}

export async function publishAdminDeck(deckId: string): Promise<{
  tag?: { slug: string; label: string };
  cardCount?: number;
  republished?: boolean;
}> {
  return apiPost(`/api/admin/decks/${encodeURIComponent(deckId)}/publish`, {});
}

export async function unpublishAdminDeck(deckId: string): Promise<{
  removedCardCount?: number;
}> {
  return apiPost(`/api/admin/decks/${encodeURIComponent(deckId)}/unpublish`);
}
