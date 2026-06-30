import type { TagOption, TagRow } from "@/lib/api/dto";
import type { PaginatedResponse } from "@/lib/api/types";
import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
} from "@/services/frontend/http";

export type { TagOption, TagRow };

export async function fetchTags(
  params: Record<string, string>,
  signal?: AbortSignal,
): Promise<PaginatedResponse<TagOption>> {
  const sp = new URLSearchParams(params);
  return apiGet(`/api/tags?${sp}`, signal);
}

export async function saveTag(input: {
  mode: "create" | "edit";
  tagId?: string;
  body: { label: string; slug?: string };
}): Promise<void> {
  const { mode, tagId, body } = input;
  const url =
    mode === "create"
      ? "/api/tags"
      : `/api/tags/${encodeURIComponent(tagId ?? "")}`;
  if (mode === "create") {
    await apiPost(url, body);
  } else {
    await apiPatch(url, body);
  }
}

export async function deleteTag(tagId: string): Promise<void> {
  await apiDelete(`/api/tags/${encodeURIComponent(tagId)}`);
}
