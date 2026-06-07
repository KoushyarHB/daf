# -*- coding: utf-8 -*-
"""Build canonical ``pluralRule`` + full ``plural`` noun phrase from head + textbook suffix."""

from __future__ import annotations

import re
from typing import Any

_PLURAL_ARTICLE = "die"
_RE_IPA_TOKEN = re.compile(r" /(?=[^/]*[ˈˌɪʊəɐ̯ːʃçɡɪɛɔʁ̩ʔ.])[^/]+/")

_LEGACY_LEMMA_PLURAL_TO_SUFFIX: dict[tuple[str, str], str] = {
    ("die W-Frage", "die W-Fragen"): "-n",
    ("die Antwort", "die Antworten"): "-en",
    ("die Tabelle", "die Tabellen"): "-n",
    ("die Verbform", "die Verbformen"): "-en",
    ("die Grammatik", "die Grammatiken"): "-en",
    ("der Blick", "die Blicke"): "-e",
    ("das Verb", "die Verben"): "-en",
    ("die Sekretärin", "die Sekretärinnen"): "-nen",
    ("Frau", "die Frauen"): "-en",
    ("die Frau", "die Frauen"): "-en",
    ("die Person", "die Personen"): "-en",
    ("das Foto", "die Fotos"): "-s",
    ("das Gespräch", "die Gespräche"): "-e",
    ("der Praktikant", "die Praktikanten"): "-en / -nen",
}

# Full plural NP when legacy manifest stored the word instead of a suffix rule.
_IRREGULAR_PLURAL_RULE: dict[tuple[str, str], str] = {
    ("das Land", "Länder"): "-¨er",
    ("das Land", "die Länder"): "-¨er",
}

# Gender-pair cards where the masculine lemma is not embedded in ``head``.
_PAIR_MASCULINE_FROM_RULE: dict[str, str] = {
    "die Argentinierin": "der Argentinier",
}


def _strip_head(head: str) -> str:
    s = head.strip()
    m = _RE_IPA_TOKEN.search(s)
    if m:
        s = s[: m.start()].rstrip()
    # Legacy pseudo-IPA without phonetic markers (e.g. ``/lant/``).
    s = re.sub(r" /[a-zA-Z]+/$", "", s).strip()
    return s


def canonicalize_plural_rule(head: str, raw: str) -> str:
    s = str(raw).strip()
    if not s:
        return ""
    lemma_key = _strip_head(head)

    if s.startswith("-"):
        return s

    for legacy_sep in (" \u2192 ", " → "):
        if legacy_sep in s:
            left, right = [x.strip() for x in s.split(legacy_sep, 1)]
            if left == lemma_key and right:
                return canonicalize_plural_rule(head, right)

    if s.startswith("die ") or s.startswith("der ") or s.startswith("das "):
        key = (lemma_key, s)
        if key in _LEGACY_LEMMA_PLURAL_TO_SUFFIX:
            return _LEGACY_LEMMA_PLURAL_TO_SUFFIX[key]
    return s


def _parse_np(np: str) -> tuple[str, str]:
    s = np.strip()
    m = re.match(r"^(der|die|das)\s+(.+)$", s, re.IGNORECASE)
    if m:
        return m.group(1).lower(), m.group(2).strip()
    return "", s


def _umlaut_char(ch: str) -> str:
    return {"a": "ä", "o": "ö", "u": "ü", "A": "Ä", "O": "Ö", "U": "Ü"}.get(ch, ch)


def _umlaut_stem(stem: str) -> str:
    for i in range(len(stem) - 1, -1, -1):
        if stem[i] in "aouAOU":
            return stem[:i] + _umlaut_char(stem[i]) + stem[i + 1 :]
    return stem


def _split_gender_head(head: str) -> list[str]:
    parts = re.split(r" / (?=(?:der|die|das)\s)", head.strip())
    return [p.strip() for p in parts if p.strip()]


def _split_gender_rule(rule: str) -> list[str]:
    if " / " not in rule:
        return [rule.strip()]
    return [p.strip() for p in rule.split(" / ", 1)]


def _compact_rule_fragment(fragment: str) -> str:
    """``die Kursteilnehmerin, -nen`` → ``-nen``; suffix-only fragments unchanged."""

    s = fragment.strip()
    if not s or s.startswith("-"):
        return s
    if ", " in s:
        left, right = s.split(", ", 1)
        if re.match(r"^(der|die|das)\s+", left.strip(), re.IGNORECASE):
            return right.strip()
    return s


def compact_plural_rule(rule: str) -> str:
    """Gender-pair rules: drop repeated singular NPs; keep suffix notation only."""

    s = rule.strip()
    if not s or " / " not in s:
        return s
    left, right = s.split(" / ", 1)
    return f"{_compact_rule_fragment(left.strip())} / {_compact_rule_fragment(right.strip())}"


def _parse_pair_rule_fragment(fragment: str) -> tuple[str, str]:
    """``die Kursteilnehmerin, -nen`` → (noun phrase, suffix rule)."""

    s = fragment.strip()
    if ", " in s:
        left, right = s.split(", ", 1)
        return left.strip(), right.strip()
    return s, "-"


def _apply_simple_rule(lemma: str, rule: str) -> str:
    r = rule.strip()
    if not r or r == "-":
        return lemma
    if r == "-n":
        return f"{lemma}n"
    if r == "-en":
        return f"{lemma}en"
    if r == "-e":
        return f"{lemma}e"
    if r == "-s":
        return f"{lemma}s"
    if r == "-nen":
        if lemma.endswith("in"):
            return f"{lemma}nen"
        return f"{lemma}nen"
    if r == "-¨er":
        return f"{_umlaut_stem(lemma)}er"
    if r == "-¨e":
        m = re.match(r"^(.+)au(m)$", lemma, re.IGNORECASE)
        if m:
            return f"{m.group(1)}äume"
        return f"{_umlaut_stem(lemma)}e"
    if r == "-bögen":
        if lemma.lower().endswith("bogen"):
            return lemma[: -len("bogen")] + "bögen"
        if lemma.lower().endswith("ogen"):
            return lemma[:-4] + "ögen"
        return _umlaut_stem(lemma) + "bögen"
    if r == "-ätze":
        if lemma.lower().endswith("satz"):
            return _umlaut_stem(lemma[:-1]) + "ze"
        return _umlaut_stem(lemma) + "tze"
    if r == "-äße":
        if lemma.endswith("ß"):
            return f"{lemma}e"
        if lemma.lower().endswith("ss"):
            return f"{lemma}e"
        return _umlaut_stem(lemma) + "ße"
    if r.startswith("-"):
        return lemma + r[1:]
    return lemma


def _plural_np(singular_np: str, rule: str) -> str:
    article, lemma = _parse_np(singular_np)
    plural_lemma = _apply_simple_rule(lemma, rule)
    return f"{_PLURAL_ARTICLE} {plural_lemma}"


def build_plural_form(head: str, plural_rule: str) -> str | None:
    """Full plural noun phrase(s) from head line + ``pluralRule`` suffix notation."""

    head_clean = _strip_head(head)
    rule = canonicalize_plural_rule(head_clean, plural_rule.strip())
    if not rule:
        return None

    head_parts = _split_gender_head(head_clean)
    rule_parts = _split_gender_rule(rule)

    if len(head_parts) == 1 and len(rule_parts) == 1:
        return _plural_np(head_parts[0], rule_parts[0])

    if len(head_parts) == 1 and len(rule_parts) == 2:
        # e.g. die Argentinierin | -nen / der Argentinier, -
        fem_np = head_parts[0]
        masc_np = _PAIR_MASCULINE_FROM_RULE.get(fem_np)
        if not masc_np:
            _, fem_lemma = _parse_np(fem_np)
            if fem_lemma.endswith("in"):
                masc_np = f"der {fem_lemma[:-2]}"
        first_rule, second_frag = rule_parts[0], rule_parts[1]
        _, second_rule = _parse_pair_rule_fragment(second_frag)
        plurals: list[str] = []
        if first_rule:
            plurals.append(_plural_np(fem_np, first_rule))
        if masc_np:
            plurals.append(_plural_np(masc_np, second_rule))
        return ", ".join(plurals) if plurals else None

    if len(head_parts) >= 2 and len(rule_parts) >= 2:
        masc_np, fem_np = head_parts[0], head_parts[1]
        masc_rule, fem_frag = rule_parts[0], rule_parts[1]
        _, fem_rule = _parse_pair_rule_fragment(fem_frag)
        return ", ".join(
            [
                _plural_np(masc_np, masc_rule),
                _plural_np(fem_np, fem_rule),
            ]
        )

    if len(head_parts) >= 2 and len(rule_parts) == 1:
        return ", ".join(_plural_np(np, rule_parts[0]) for np in head_parts)

    return _plural_np(head_parts[0], rule_parts[0])


def format_plural_line(plural_rule: str, plural_form: str) -> str:
    return f"{plural_rule.strip()} · {plural_form.strip()}"


def _infer_plural_rule_from_form(head: str, plural_form: str) -> str | None:
    _, lemma = _parse_np(_strip_head(head))
    _, pl_lemma = _parse_np(plural_form)
    if pl_lemma == lemma:
        return "-"
    if pl_lemma == f"{lemma}n":
        return "-n"
    if pl_lemma == f"{lemma}en":
        return "-en"
    if pl_lemma == f"{lemma}e":
        return "-e"
    if pl_lemma == f"{lemma}s":
        return "-s"
    if pl_lemma == f"{_umlaut_stem(lemma)}er":
        return "-¨er"
    if pl_lemma == f"{_umlaut_stem(lemma)}e":
        return "-¨e"
    if lemma.endswith("in") and pl_lemma == f"{lemma}nen":
        return "-nen"
    if lemma.lower().endswith("satz") and pl_lemma == f"{_umlaut_stem(lemma[:-1])}ze":
        return "-ätze"
    if lemma.endswith("ß") and pl_lemma == f"{lemma}e":
        return "-äße"
    if lemma.lower().endswith("bogen") and pl_lemma == lemma[: -len("bogen")] + "bögen":
        return "-bögen"
    return None


def normalize_plural_fields(
    card: dict[str, Any],
    head: str | None = None,
) -> tuple[str | None, str | None]:
    """Return canonical ``(pluralRule, plural)``; migrate legacy suffix-only ``plural``."""

    head_clean = _strip_head(head or str(card.get("head") or ""))
    raw_rule = str(card.get("pluralRule") or "").strip()
    raw_plural = str(card.get("plural") or "").strip()

    if raw_rule:
        rule = compact_plural_rule(canonicalize_plural_rule(head_clean, raw_rule))
        form = raw_plural or build_plural_form(head_clean, rule) or ""
        return rule, form or None

    if not raw_plural:
        return None, None

    if raw_plural.startswith("-"):
        rule = compact_plural_rule(canonicalize_plural_rule(head_clean, raw_plural))
        form = build_plural_form(head_clean, rule)
        return rule, form

    key = (head_clean, raw_plural)
    if key in _IRREGULAR_PLURAL_RULE:
        rule = _IRREGULAR_PLURAL_RULE[key]
        form = build_plural_form(head_clean, rule) or f"die {raw_plural}"
        return rule, form

    if raw_plural.startswith("die ") or raw_plural.startswith("der ") or raw_plural.startswith("das "):
        inferred = _infer_plural_rule_from_form(head_clean, raw_plural)
        if inferred:
            return inferred, raw_plural
        return None, raw_plural

    # Bare plural lemma (e.g. Länder)
    rule = _IRREGULAR_PLURAL_RULE.get((head_clean, raw_plural))
    if rule:
        return rule, f"die {raw_plural}"
    return None, f"die {raw_plural}"
