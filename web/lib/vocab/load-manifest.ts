import { readFileSync } from "fs";
import path from "path";

import { enrichCards, validCards } from "./card-utils";
import type { EnrichedVocabCard, LessonPageEntry } from "./types";

function repoRoot(): string {
  return path.join(process.cwd(), "..");
}

function readJsonFile<T>(filename: string): T {
  const filePath = path.join(repoRoot(), filename);
  const raw = readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

const DEFAULT_LESSONS: LessonPageEntry[] = [
  {
    lektion: 1,
    title: "Lektion 1",
    wordPage: {
      label: "Words page",
      image: "/lesson-pages/kursbuch-page-16.png",
    },
    grammarPage: {
      label: "Grammar page",
      image: "/lesson-pages/kursbuch-page-17.png",
    },
  },
];

function parseLessonManifest(blob: unknown): LessonPageEntry[] {
  if (!Array.isArray(blob)) return DEFAULT_LESSONS;
  const out: LessonPageEntry[] = [];
  for (const item of blob) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    let lek = rec.lektion;
    if (typeof lek !== "number") {
      const n = parseInt(String(lek), 10);
      if (Number.isNaN(n)) continue;
      lek = n;
    }
    const title =
      String(rec.title ?? `Lektion ${lek}`).trim() || `Lektion ${lek}`;
    const wp = rec.wordPage;
    const gp = rec.grammarPage;
    if (!wp || typeof wp !== "object" || !gp || typeof gp !== "object") {
      continue;
    }
    const wpRec = wp as Record<string, unknown>;
    const gpRec = gp as Record<string, unknown>;
    const wpImg = String(wpRec.image ?? "").trim();
    const gpImg = String(gpRec.image ?? "").trim();
    if (!wpImg || !gpImg) continue;
    out.push({
      lektion: lek as number,
      title,
      wordPage: {
        label:
          String(wpRec.label ?? "Words page").trim() || "Words page",
        image: wpImg,
      },
      grammarPage: {
        label:
          String(gpRec.label ?? "Grammar page").trim() || "Grammar page",
        image: gpImg,
      },
    });
  }
  const sorted = out.sort((a, b) => a.lektion - b.lektion);
  return sorted.length > 0 ? sorted : DEFAULT_LESSONS;
}

export function loadVocabCards(): EnrichedVocabCard[] {
  const blob = readJsonFile<unknown[]>("vocab.manifest.json");
  return enrichCards(validCards(blob));
}

export function loadLessonPages(): LessonPageEntry[] {
  try {
    const blob = readJsonFile<unknown>("lesson-pages.manifest.json");
    return parseLessonManifest(blob);
  } catch {
    return DEFAULT_LESSONS;
  }
}
