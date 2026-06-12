import { z } from "zod";

import { VOCAB_POS_ORDER, normalizeVocabPos } from "@/lib/vocab/types";
import type { VocabPos } from "@/lib/vocab/types";

const posValues = VOCAB_POS_ORDER as [VocabPos, ...VocabPos[]];

const suggestResponseSchema = z.object({
  head: z.string().min(1),
  ipa: z.string().optional(),
  gloss: z.string().min(1),
  notes: z.string().optional(),
  examples: z
    .array(
      z.object({
        german: z.string().min(1),
        english: z.string().min(1),
      }),
    )
    .min(1)
    .max(4),
  pos: z.enum(posValues).optional(),
  level: z.string().optional(),
});

export type CardSuggestResult = {
  head: string;
  ipa: string;
  gloss: string;
  notes: string;
  examples: { german: string; english: string }[];
  pos: VocabPos;
  level: string;
};

export class AiSuggestError extends Error {
  constructor(
    message: string,
    readonly code: "NOT_CONFIGURED" | "UPSTREAM" | "PARSE",
  ) {
    super(message);
    this.name = "AiSuggestError";
  }
}

function buildPrompt(headword: string): string {
  return `You are building a German "Deutsch als Fremdsprache" vocabulary flashcard (learner level A1 unless the word is clearly advanced).

Headword input from the user: ${headword.trim()}

Return JSON only with these fields:
- "head": German lemma as on a flashcard — nouns MUST include der/die/das; verbs as infinitive; fixed phrases as-is. Do NOT put IPA in head.
- "ipa": IPA transcription without surrounding slashes (e.g. ˈvɔʁt).
- "gloss": ONE short English gloss line (flashcard back, under ~12 words).
- "notes": optional single grammar/usage note starting with "•", or empty string if unnecessary.
- "examples": array of 2–3 objects, each with "german" (natural German sentence using the word) and "english" (full natural English translation, not word-by-word).
- "pos": one of: ${posValues.join(", ")}.
- "level": CEFR label (default A1).

Use correct German spelling (ß, umlauts, capitalization).`;
}

function geminiModel(): string {
  // gemini-2.0-flash often has 0 free-tier RPM; 2.5-flash is the current free-tier default.
  return process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";
}

export async function suggestCardFromHeadword(
  headword: string,
): Promise<CardSuggestResult> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new AiSuggestError(
      "AI is not configured. Set GEMINI_API_KEY (free at aistudio.google.com).",
      "NOT_CONFIGURED",
    );
  }

  const trimmed = headword.trim();
  if (!trimmed) {
    throw new AiSuggestError("Enter a headword first.", "PARSE");
  }

  const model = geminiModel();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: buildPrompt(trimmed) }] }],
      generationConfig: {
        temperature: 0.35,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    if (res.status === 429) {
      throw new AiSuggestError(
        `Gemini quota exceeded for model "${model}". In AI Studio check your key’s rate limits, try GEMINI_MODEL=gemini-2.5-flash in .env, or enable billing on the Google Cloud project.`,
        "UPSTREAM",
      );
    }
    throw new AiSuggestError(
      detail ? `AI request failed: ${detail.slice(0, 200)}` : `AI request failed (${res.status})`,
      "UPSTREAM",
    );
  }

  const payload = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = payload.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!text) {
    throw new AiSuggestError("AI returned an empty response.", "UPSTREAM");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new AiSuggestError("AI returned invalid JSON.", "PARSE");
  }

  const validated = suggestResponseSchema.safeParse(parsed);
  if (!validated.success) {
    throw new AiSuggestError("AI response did not match the expected shape.", "PARSE");
  }

  const data = validated.data;
  return {
    head: data.head.trim(),
    ipa: (data.ipa ?? "").trim(),
    gloss: data.gloss.trim(),
    notes: (data.notes ?? "").trim(),
    examples: data.examples.map((ex) => ({
      german: ex.german.trim(),
      english: ex.english.trim(),
    })),
    pos: normalizeVocabPos(data.pos),
    level: (data.level ?? "A1").trim() || "A1",
  };
}
