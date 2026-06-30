import type { TagOption } from "@/services/frontend/tags.client";

export function mergeOptions(
  selected: TagOption[],
  fetched: TagOption[],
): TagOption[] {
  const selectedSlugs = new Set(selected.map((t) => t.slug));
  const uniqueFetched = fetched.filter((t) => !selectedSlugs.has(t.slug));
  return [...selected, ...uniqueFetched];
}
