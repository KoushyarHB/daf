import type { TagOption } from "@/services/frontend/tags.client";

export function buildLabelMap(
  knownTags: TagOption[],
  options: TagOption[],
): Map<string, string> {
  const m = new Map<string, string>();
  for (const t of knownTags) m.set(t.slug, t.label);
  for (const t of options) m.set(t.slug, t.label);
  return m;
}
