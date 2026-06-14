/** Well-known tag slugs used by import and card defaults. */
export const TAG_USER = "user" as const;

export const SYSTEM_TAGS = [
  { slug: TAG_USER, label: "user" },
  { slug: "daf-lek-1", label: "daf lek. 1" },
  { slug: "daf-lek-2", label: "daf lek. 2" },
] as const;

/** Slug prefix for DaF lesson community decks (importable bundles). */
export const DAF_LEK_TAG_PREFIX = "daf-lek-" as const;

export function lektionToDafTagSlug(lektion: number): string {
  return `${DAF_LEK_TAG_PREFIX}${lektion}`;
}

export function lektionToDafTagLabel(lektion: number): string {
  return `daf lek. ${lektion}`;
}

export function isDafLekTagSlug(slug: string): boolean {
  return slug.startsWith(DAF_LEK_TAG_PREFIX);
}

/** System tag slug for a deck published to the community catalog. */
export const PUBLISHED_DECK_TAG_PREFIX = "deck-" as const;

export function isPublishedDeckTagSlug(slug: string): boolean {
  return slug.startsWith(PUBLISHED_DECK_TAG_PREFIX);
}
