export const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

export type CefrLevel = (typeof CEFR_LEVELS)[number];

export function normalizeCefrLevel(
  level: string | undefined | null,
): CefrLevel {
  const key = (level ?? "A1").trim().toUpperCase();
  return (CEFR_LEVELS as readonly string[]).includes(key)
    ? (key as CefrLevel)
    : "A1";
}
