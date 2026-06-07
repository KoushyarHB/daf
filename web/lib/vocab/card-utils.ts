import { normalizePluralFields } from "./plural-forms";
import type {
  EnrichedVocabCard,
  GrammarTable,
  VocabCard,
  VocabExample,
  VocabPos,
} from "./types";
import { normalizeVocabPos, VOCAB_POS_ORDER } from "./types";

const LEGACY_LEMMA_PLURAL_TO_SUFFIX: Record<string, string> = {

  "die W-Frage|die W-Fragen": "-n",

  "die Antwort|die Antworten": "-en",

  "die Tabelle|die Tabellen": "-n",

  "die Verbform|die Verbformen": "-en",

  "die Grammatik|die Grammatiken": "-en",

};



const RE_NEU_ADJ = /\b(neu)(en|em|es|er|e)\b/gi;



const IPA_MARKERS = "ˈˌɪʊəɐ̯ːʃçɡɪɛɔʁ̩ʔ.";

const RE_IPA_TOKEN = new RegExp(

  ` /(?=[^/]*[${IPA_MARKERS.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")}])[^/]+/`,

  "g",

);



function ipaTokensToStorage(matches: string[]): string | null {

  const parts = matches

    .map((token) => token.trim().slice(1, -1).replace(/^\/+|\/+$/g, "").trim())

    .filter(Boolean);

  return parts.length > 0 ? parts.join(" ") : null;

}



export function normalizeIpaStorage(raw: string | null | undefined): string | null {

  if (!raw?.trim()) return null;

  const s = raw.trim();

  RE_IPA_TOKEN.lastIndex = 0;

  const matches = [...s.matchAll(RE_IPA_TOKEN)].map((m) => m[0]);

  if (matches.length > 0) {

    return ipaTokensToStorage(matches);

  }

  const bare = s.replace(/^\/+|\/+$/g, "").trim();

  return bare || null;

}



export function formatIpaDisplay(ipa: string | null | undefined): string | null {

  const bare = normalizeIpaStorage(ipa);

  if (!bare) return null;

  return " " + bare.split(/\s+/).map((part) => `/${part}/`).join(" ");

}



export function splitHeadAndIpa(combined: string): [string, string | null] {

  const s = combined.trim();

  if (!s) return ["", null];

  RE_IPA_TOKEN.lastIndex = 0;

  const first = RE_IPA_TOKEN.exec(s);

  if (!first) return [s, null];

  const lemma = s.slice(0, first.index).trimEnd();

  const tail = s.slice(first.index);

  RE_IPA_TOKEN.lastIndex = 0;

  const matches = [...tail.matchAll(RE_IPA_TOKEN)].map((m) => m[0]);

  return [lemma || s, ipaTokensToStorage(matches)];

}



export function normalizeHeadIpaFields(card: {

  head?: string;

  ipa?: string | null;

}): [string, string | null] {

  const rawHead = (card.head ?? "").trim();

  const explicit = normalizeIpaStorage(card.ipa);

  if (explicit) {

    const [lemma] = splitHeadAndIpa(rawHead);

    return [lemma, explicit];

  }

  return splitHeadAndIpa(rawHead);

}



/** Lemma only — IPA lives in ``card.ipa``. */

export function splitHead(head: string): [string, string | null] {

  const [lemma] = splitHeadAndIpa(head);

  return [lemma, null];

}



export function canonicalizePluralField(head: string, raw: string): string {

  const s = raw.trim();

  if (!s) return "";

  const [lemma] = splitHead(head.trim());

  const lemmaKey = lemma.trim();



  if (s.startsWith("-")) return s;



  for (const legacySep of [" \u2192 ", " → "]) {

    const idx = s.indexOf(legacySep);

    if (idx >= 0) {

      const left = s.slice(0, idx).trim();

      const right = s.slice(idx + legacySep.length).trim();

      if (left === lemmaKey && right) {

        return canonicalizePluralField(head, right);

      }

    }

  }



  if (s.startsWith("die ")) {

    const key = `${lemmaKey}|${s}`;

    if (LEGACY_LEMMA_PLURAL_TO_SUFFIX[key]) {

      return LEGACY_LEMMA_PLURAL_TO_SUFFIX[key];

    }

  }

  return s;

}



export function isoToMs(iso: string | null | undefined): number {

  if (!iso?.trim()) return 0;

  let s = iso.trim();

  if (s.endsWith("Z")) {

    s = s.slice(0, -1) + "+00:00";

  }

  const t = Date.parse(s);

  return Number.isNaN(t) ? 0 : t;

}



export function deckNumberForIndex(index: number, total: number): number {

  return total - index;

}



export function cardDomId(card: VocabCard, deckNo: number): string {

  const raw = (card.id ?? "").trim();

  return raw || `card-${deckNo}`;

}



export function cardListLabel(card: VocabCard): string {

  return (card.head ?? "").trim();

}



export function collectFilterOptions(cards: EnrichedVocabCard[]): {
  lektions: number[];
  levels: string[];
  posValues: VocabPos[];
} {
  const lektions = new Set<number>();
  const levels = new Set<string>();
  const posFound = new Set<VocabPos>();

  for (const card of cards) {
    if (typeof card.lektion === "number") {
      lektions.add(card.lektion);
    } else if (card.lektion != null) {
      const n = parseInt(String(card.lektion), 10);
      if (!Number.isNaN(n)) lektions.add(n);
    }

    const lvl = card.level?.trim();
    if (lvl) levels.add(lvl);

    posFound.add(normalizeVocabPos(card.pos));
  }

  return {
    lektions: [...lektions].sort((a, b) => a - b),
    levels: [...levels].sort(),
    posValues: VOCAB_POS_ORDER.filter((p) => posFound.has(p)),
  };
}



export function normalizeGrammarTable(raw: unknown): GrammarTable | null {

  if (!raw || typeof raw !== "object") return null;

  const obj = raw as Record<string, unknown>;

  const colsRaw = obj.columns;

  const rowsRaw = obj.rows;

  if (!Array.isArray(colsRaw) || colsRaw.length === 0) return null;

  if (!Array.isArray(rowsRaw) || rowsRaw.length === 0) return null;

  const columns = colsRaw.map((c) => (c == null ? "" : String(c).trim()));

  const n = columns.length;

  if (!n) return null;

  const rows: string[][] = [];

  for (const row of rowsRaw) {

    if (!Array.isArray(row)) return null;

    const cells: string[] = [];

    for (let i = 0; i < n; i++) {

      const v = i < row.length ? row[i] : null;

      cells.push(v == null ? "" : String(v).trim());

    }

    rows.push(cells);

  }

  return { columns, rows };

}



export function* iterGrammarAdjSuffixRuns(

  text: string,

): Generator<[string, boolean]> {

  if (!text) return;

  let last = 0;

  let matched = false;

  RE_NEU_ADJ.lastIndex = 0;

  let m: RegExpExecArray | null;

  while ((m = RE_NEU_ADJ.exec(text)) !== null) {

    matched = true;

    if (m.index > last) {

      yield [text.slice(last, m.index), false];

    }

    yield [m[1], false];

    yield [m[2], true];

    last = m.index + m[0].length;

  }

  if (!matched) {

    yield [text, false];

  } else if (last < text.length) {

    yield [text.slice(last), false];

  }

}



function englishGlossInner(raw: string): string | null {

  const s = raw.trim();

  if (!s) return null;

  if (s.startsWith("(") && s.endsWith(")")) {

    return s.slice(1, -1).trim() || null;

  }

  return s;

}



export function normalizeExamplesFromCard(

  card: Record<string, unknown>,

): VocabExample[] {

  const out: VocabExample[] = [];

  const units = card.example_units;

  if (Array.isArray(units) && units.length > 0) {

    for (const pair of units) {

      if (!Array.isArray(pair) || pair.length < 2) continue;

      const g = String(pair[0]).trim();

      const rawE = pair[1] != null ? String(pair[1]).trim() : "";

      const e = rawE ? englishGlossInner(rawE) : null;

      if (g || e) out.push({ german: g, english: e });

    }

  }

  const examples = card.examples;

  if (Array.isArray(examples)) {

    for (const item of examples) {

      if (typeof item === "object" && item !== null) {

        const ex = item as Record<string, unknown>;

        const g = String(ex.german ?? "").trim();

        const eRaw = ex.english;

        let enOut: string | null = null;

        if (eRaw != null) {

          enOut = englishGlossInner(String(eRaw));

        }

        if (g || enOut) {

          const blob: VocabExample = { german: g, english: enOut };

          const aud = ex.audio;

          if (typeof aud === "string" && aud.trim()) {

            blob.audio = aud.trim();

          }

          out.push(blob);

        }

      }

    }

  }

  return out;

}



export function validCards(raw: unknown[]): VocabCard[] {

  return raw.filter(

    (c): c is VocabCard =>

      typeof c === "object" &&

      c !== null &&

      typeof (c as VocabCard).head === "string" &&

      (c as VocabCard).head.trim().length > 0,

  );

}



export function enrichCards(cards: VocabCard[]): EnrichedVocabCard[] {

  const total = cards.length;

  return cards.map((card, index) => {

    const deckNo = deckNumberForIndex(index, total);

    const [head, ipa] = normalizeHeadIpaFields(card);

    const domId = cardDomId({ ...card, head }, deckNo);

    const created = card.createdAt ?? card.updatedAt;

    const pluralMeta = normalizePluralFields({
      head,
      pluralRule: card.pluralRule,
      plural: card.plural,
    });

    return {

      ...card,

      head,

      ipa: ipa ?? undefined,

      pluralRule: pluralMeta.pluralRule ?? undefined,

      plural: pluralMeta.plural ?? undefined,

      deckNo,

      domId,

      listLabel: cardListLabel({ ...card, head }),

      createdMs: isoToMs(created),

      pluralLine: pluralMeta.pluralLine,

      grammarTable: normalizeGrammarTable(card.grammarTable),

      examples: normalizeExamplesFromCard(

        card as unknown as Record<string, unknown>,

      ),

      lektion:

        typeof card.lektion === "number"

          ? card.lektion

          : card.lektion != null

            ? parseInt(String(card.lektion), 10) || null

            : null,

      level: (card.level ?? "A1").trim() || "A1",

      pos: normalizeVocabPos(card.pos),

    };

  });

}



export function pluralDiagram(
  pluralRule: string,
  pluralForm: string,
): string | null {
  if (!pluralRule.trim() || !pluralForm.trim()) return null;
  return `${pluralRule.trim()} · ${pluralForm.trim()}`;
}


