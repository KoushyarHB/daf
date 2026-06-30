import type { StudiedFilter } from "@/lib/vocab/types";

export function studiedParam(studied: StudiedFilter): string | undefined {
  if (studied === "studied") return "true";
  if (studied === "unstudied") return "false";
  return undefined;
}
