const PLURAL_ARTICLE = "die";
const RE_IPA_TOKEN = / \/(?=[^/]*[ˈˌɪʊəɐ̯ːʃçɡɪɛɔʁ̩ʔ.])[^/]+/g;

const PAIR_MASCULINE_FROM_RULE: Record<string, string> = {
  "die Argentinierin": "der Argentinier",
};

function stripHead(head: string): string {
  const s = head.trim();
  const m = RE_IPA_TOKEN.exec(s);
  RE_IPA_TOKEN.lastIndex = 0;
  let out = m ? s.slice(0, m.index).trimEnd() : s;
  out = out.replace(/ \/[\w-]+\/$/, "").trim();
  return out;
}

function parseNp(np: string): [string, string] {
  const s = np.trim();
  const m = s.match(/^(der|die|das)\s+(.+)$/i);
  if (m) return [m[1].toLowerCase(), m[2].trim()];
  return ["", s];
}

function umlautChar(ch: string): string {
  return ({ a: "ä", o: "ö", u: "ü", A: "Ä", O: "Ö", U: "Ü" } as Record<string, string>)[ch] ?? ch;
}

function umlautStem(stem: string): string {
  for (let i = stem.length - 1; i >= 0; i--) {
    if ("aouAOU".includes(stem[i])) {
      return stem.slice(0, i) + umlautChar(stem[i]) + stem.slice(i + 1);
    }
  }
  return stem;
}

function splitGenderHead(head: string): string[] {
  return head
    .trim()
    .split(/ \/ (?=(?:der|die|das) )/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function compactRuleFragment(fragment: string): string {
  const s = fragment.trim();
  if (!s || s.startsWith("-")) return s;
  const idx = s.indexOf(", ");
  if (idx >= 0) {
    const left = s.slice(0, idx).trim();
    if (/^(der|die|das)\s+/i.test(left)) return s.slice(idx + 2).trim();
  }
  return s;
}

function compactPluralRule(rule: string): string {
  const s = rule.trim();
  if (!s || !s.includes(" / ")) return s;
  const idx = s.indexOf(" / ");
  const left = compactRuleFragment(s.slice(0, idx));
  const right = compactRuleFragment(s.slice(idx + 3));
  return `${left} / ${right}`;
}

function splitGenderRule(rule: string): string[] {
  if (!rule.includes(" / ")) return [rule.trim()];
  const idx = rule.indexOf(" / ");
  return [rule.slice(0, idx).trim(), rule.slice(idx + 3).trim()];
}

function parsePairRuleFragment(fragment: string): [string, string] {
  const s = fragment.trim();
  const idx = s.indexOf(", ");
  if (idx >= 0) return [s.slice(0, idx).trim(), s.slice(idx + 2).trim()];
  return [s, "-"];
}

function applySimpleRule(lemma: string, rule: string): string {
  const r = rule.trim();
  if (!r || r === "-") return lemma;
  if (r === "-n") return `${lemma}n`;
  if (r === "-en") return `${lemma}en`;
  if (r === "-e") return `${lemma}e`;
  if (r === "-s") return `${lemma}s`;
  if (r === "-nen") return `${lemma}nen`;
  if (r === "-¨er") return `${umlautStem(lemma)}er`;
  if (r === "-¨e") {
    const m = lemma.match(/^(.+)au(m)$/i);
    if (m) return `${m[1]}äume`;
    return `${umlautStem(lemma)}e`;
  }
  if (r === "-bögen") {
    if (lemma.toLowerCase().endsWith("bogen")) {
      return lemma.slice(0, -"bogen".length) + "bögen";
    }
    return umlautStem(lemma) + "bögen";
  }
  if (r === "-ätze") {
    if (lemma.toLowerCase().endsWith("satz")) {
      return umlautStem(lemma.slice(0, -1)) + "ze";
    }
    return umlautStem(lemma) + "tze";
  }
  if (r === "-äße") {
    if (lemma.endsWith("ß")) return `${lemma}e`;
    return umlautStem(lemma) + "ße";
  }
  if (r.startsWith("-")) return lemma + r.slice(1);
  return lemma;
}

function pluralNp(singularNp: string, rule: string): string {
  const [, lemma] = parseNp(singularNp);
  return `${PLURAL_ARTICLE} ${applySimpleRule(lemma, rule)}`;
}

export function buildPluralForm(head: string, pluralRule: string): string | null {
  const headClean = stripHead(head);
  const rule = pluralRule.trim();
  if (!rule) return null;

  const headParts = splitGenderHead(headClean);
  const ruleParts = splitGenderRule(rule);

  if (headParts.length === 1 && ruleParts.length === 1) {
    return pluralNp(headParts[0], ruleParts[0]);
  }

  if (headParts.length === 1 && ruleParts.length === 2) {
    const femNp = headParts[0];
    const mascNp = PAIR_MASCULINE_FROM_RULE[femNp];
    const resolvedMasc =
      mascNp ??
      (() => {
        const [, femLemma] = parseNp(femNp);
        return femLemma.endsWith("in") ? `der ${femLemma.slice(0, -2)}` : null;
      })();
    const [, secondRule] = parsePairRuleFragment(ruleParts[1]);
    const plurals = [pluralNp(femNp, ruleParts[0])];
    if (resolvedMasc) plurals.push(pluralNp(resolvedMasc, secondRule));
    return plurals.join(", ");
  }

  if (headParts.length >= 2 && ruleParts.length >= 2) {
    const [, femRule] = parsePairRuleFragment(ruleParts[1]);
    return [pluralNp(headParts[0], ruleParts[0]), pluralNp(headParts[1], femRule)].join(
      ", ",
    );
  }

  if (headParts.length >= 2 && ruleParts.length === 1) {
    return headParts.map((np) => pluralNp(np, ruleParts[0])).join(", ");
  }

  return pluralNp(headParts[0], ruleParts[0]);
}

export function formatPluralLine(pluralRule: string, pluralForm: string): string {
  return `${pluralRule.trim()} · ${pluralForm.trim()}`;
}

export function normalizePluralFields(card: {
  head?: string;
  pluralRule?: string | null;
  plural?: string | null;
}): { pluralRule: string | null; plural: string | null; pluralLine: string | null } {
  const headClean = stripHead(card.head ?? "");
  const rawRule = (card.pluralRule ?? "").trim();
  const rawPlural = (card.plural ?? "").trim();

  if (rawRule) {
    const rule = compactPluralRule(rawRule);
    const form = rawPlural || buildPluralForm(headClean, rule) || "";
    return {
      pluralRule: rule,
      plural: form || null,
      pluralLine: form ? formatPluralLine(rule, form) : null,
    };
  }

  if (!rawPlural) {
    return { pluralRule: null, plural: null, pluralLine: null };
  }

  if (rawPlural.startsWith("-")) {
    const form = buildPluralForm(headClean, rawPlural);
    return {
      pluralRule: rawPlural,
      plural: form,
      pluralLine: form ? formatPluralLine(rawPlural, form) : null,
    };
  }

  if (rawPlural.startsWith("die ") || rawPlural.startsWith("der ") || rawPlural.startsWith("das ")) {
    const inferred = inferPluralRuleFromForm(headClean, rawPlural);
    if (inferred) {
      return {
        pluralRule: inferred,
        plural: rawPlural,
        pluralLine: formatPluralLine(inferred, rawPlural),
      };
    }
    return { pluralRule: null, plural: rawPlural, pluralLine: rawPlural };
  }

  const form = `die ${rawPlural}`;
  const inferred = inferPluralRuleFromForm(headClean, form);
  if (inferred) {
    return {
      pluralRule: inferred,
      plural: form,
      pluralLine: formatPluralLine(inferred, form),
    };
  }
  return { pluralRule: null, plural: form, pluralLine: form };
}

function inferPluralRuleFromForm(head: string, pluralForm: string): string | null {
  const [, lemma] = parseNp(stripHead(head));
  const [, plLemma] = parseNp(pluralForm);
  if (plLemma === lemma) return "-";
  if (plLemma === `${lemma}n`) return "-n";
  if (plLemma === `${lemma}en`) return "-en";
  if (plLemma === `${lemma}e`) return "-e";
  if (plLemma === `${lemma}s`) return "-s";
  if (plLemma === `${umlautStem(lemma)}er`) return "-¨er";
  if (plLemma === `${umlautStem(lemma)}e`) return "-¨e";
  if (lemma.endsWith("in") && plLemma === `${lemma}nen`) return "-nen";
  if (lemma.toLowerCase().endsWith("satz") && plLemma === `${umlautStem(lemma.slice(0, -1))}ze`) {
    return "-ätze";
  }
  if (lemma.endsWith("ß") && plLemma === `${lemma}e`) {
    return "-äße";
  }
  if (lemma.toLowerCase().endsWith("bogen") && plLemma === lemma.slice(0, -"bogen".length) + "bögen") {
    return "-bögen";
  }
  return null;
}
