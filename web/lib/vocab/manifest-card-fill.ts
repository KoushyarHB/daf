import { normalizeCefrLevel, type CefrLevel } from "@/lib/vocab/levels";
import { normalizeVocabPos, type VocabPos } from "@/lib/vocab/types";

/** Fields parsed from a vocab.manifest.json-style card object. */
export type ManifestCardFillResult = {
  head: string;
  ipa: string;
  gloss: string;
  notes: string;
  examples: { german: string; english: string }[];
  pos: VocabPos;
  level: CefrLevel;
  tagSlugs: string[];
};

const SAMPLE_MANIFEST_CARD = `{
  "head": "das Wort",
  "ipa": "/vɔʁt/",
  "pos": "noun",
  "plural": "die Wörter",
  "gloss": ["word; vocabulary item"],
  "notes": ["• neuter noun"],
  "examples": [
    {
      "german": "Ich lerne das Wort.",
      "english": "I am learning the word."
    }
  ],
  "level": "A1"
}`;

export function manifestCardSampleJson(): string {
  return SAMPLE_MANIFEST_CARD;
}

function linesFromManifestField(value: unknown): string {
  if (Array.isArray(value)) {
    return value
      .map((v) => String(v).trim())
      .filter(Boolean)
      .join("\n");
  }
  if (typeof value === "string") return value.trim();
  return "";
}

function examplesFromManifestField(
  value: unknown,
): { german: string; english: string }[] {
  if (!Array.isArray(value)) return [];
  const out: { german: string; english: string }[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    const german = String(rec.german ?? "").trim();
    if (!german) continue;
    const english =
      rec.english != null && rec.english !== ""
        ? String(rec.english).trim()
        : "";
    out.push({ german, english });
  }
  return out;
}

function tagSlugsFromManifestField(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map((t) => String(t).trim()).filter(Boolean))];
}

function extractCardRecord(parsed: unknown): Record<string, unknown> {
  if (Array.isArray(parsed)) {
    if (parsed.length === 0) {
      throw new Error("Array is empty — paste one card object.");
    }
    if (parsed.length > 1) {
      throw new Error(
        "Paste a single card object, not the full manifest array.",
      );
    }
    const first = parsed[0];
    if (!first || typeof first !== "object") {
      throw new Error("First array item is not a card object.");
    }
    return first as Record<string, unknown>;
  }
  if (parsed && typeof parsed === "object") {
    return parsed as Record<string, unknown>;
  }
  throw new Error("Expected a JSON object or a one-item array.");
}

/** Parse vocab.manifest.json-style card JSON into form fields. */
export function parseManifestCardJson(text: string): ManifestCardFillResult {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error("Paste a JSON card object.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    throw new Error("Invalid JSON — check commas and quotes.");
  }

  const card = extractCardRecord(parsed);
  const head = String(card.head ?? "").trim();
  if (!head) {
    throw new Error('Card object needs a non-empty "head" field.');
  }

  const examples = examplesFromManifestField(card.examples);
  const tagSlugs = tagSlugsFromManifestField(card.tags);

  return {
    head,
    ipa: String(card.ipa ?? "").trim(),
    gloss: linesFromManifestField(card.gloss),
    notes: linesFromManifestField(card.notes),
    examples,
    pos: normalizeVocabPos(
      typeof card.pos === "string" ? card.pos : undefined,
    ),
    level: normalizeCefrLevel(
      typeof card.level === "string" ? card.level : "A1",
    ),
    tagSlugs,
  };
}

/** Serialize current form values as a manifest-style card object (for copy/edit). */
export function formFieldsToManifestCardJson(fields: {
  head: string;
  ipa: string;
  gloss: string;
  notes: string;
  examples: { german: string; english: string }[];
  pos: VocabPos;
  level: CefrLevel;
  tagSlugs: string[];
}): string {
  const gloss = fields.gloss
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const notes = fields.notes
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const examples = fields.examples
    .map((ex) => ({
      german: ex.german.trim(),
      english: ex.english.trim() || null,
    }))
    .filter((ex) => ex.german.length > 0);

  const obj: Record<string, unknown> = {
    head: fields.head.trim(),
  };
  if (fields.ipa.trim()) obj.ipa = fields.ipa.trim();
  if (fields.pos !== "other") obj.pos = fields.pos;
  if (gloss.length > 0) obj.gloss = gloss;
  if (notes.length > 0) obj.notes = notes;
  if (examples.length > 0) obj.examples = examples;
  if (fields.level !== "A1") obj.level = fields.level;
  if (fields.tagSlugs.length > 0) obj.tags = fields.tagSlugs;

  return JSON.stringify(obj, null, 2);
}
