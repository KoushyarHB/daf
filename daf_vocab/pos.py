# -*- coding: utf-8 -*-
"""Part-of-speech enum and inference for vocabulary cards."""

from __future__ import annotations

import re
from typing import Any

POS_NOUN = "noun"
POS_VERB = "verb"
POS_ADJECTIVE = "adjective"
POS_ADVERB = "adverb"
POS_PHRASE = "phrase"
POS_GRAMMAR = "grammar"
POS_OTHER = "other"

VALID_POS = frozenset(
    {
        POS_NOUN,
        POS_VERB,
        POS_ADJECTIVE,
        POS_ADVERB,
        POS_PHRASE,
        POS_GRAMMAR,
        POS_OTHER,
    }
)

DEFAULT_POS = POS_OTHER

POS_ORDER: tuple[str, ...] = (
    POS_NOUN,
    POS_VERB,
    POS_ADJECTIVE,
    POS_ADVERB,
    POS_PHRASE,
    POS_GRAMMAR,
    POS_OTHER,
)

_POS_LABELS: dict[str, str] = {
    POS_NOUN: "Noun",
    POS_VERB: "Verb",
    POS_ADJECTIVE: "Adjective",
    POS_ADVERB: "Adverb",
    POS_PHRASE: "Phrase",
    POS_GRAMMAR: "Grammar",
    POS_OTHER: "Other",
}

_RE_ARTICLE_HEAD = re.compile(r"^(der|die|das)\s", re.IGNORECASE)
_RE_VERB_INFINITIVE = re.compile(
    r"^(?:sich\s+)?[a-zäöüß]+(?:en|eln|ern)$",
    re.IGNORECASE,
)

# Explicit card ids where inference would be wrong.
_POS_BY_ID: dict[str, str] = {
    "v-die-zahlen-ab-11": POS_GRAMMAR,
    "v-l-nder-sprachen-nationalit-ten": POS_GRAMMAR,
    "v-der-neue-praktikant": POS_GRAMMAR,
    "v-personalpronomen": POS_GRAMMAR,
    "v-reflexivpronomen": POS_GRAMMAR,
    "v-welcher-welche-welches": POS_GRAMMAR,
    "v-ihr": POS_GRAMMAR,
    "v-k-nnen": POS_VERB,
    "v-argentinien": POS_NOUN,
    "v-e-mail-adressen-sprechen": POS_PHRASE,
    "v-von-a-bis-z-f-n-a-b-s-ts-t": POS_PHRASE,
    "v-auf-einen-blick": POS_PHRASE,
    "v-fast-fast": POS_ADVERB,
    "v-dann": POS_ADVERB,
    "v-sein": POS_VERB,
    "v-was-vas": POS_OTHER,
}

_ADJECTIVE_HEADS = frozenset({"langsam", "neu", "richtig", "genau"})

_ADVERB_HEADS = frozenset(
    {
        "immer",
        "dann",
        "heute",
        "wieder",
        "gern",
        "zusammen",
        "auch",
        "bis",
        "später",
        "mehr",
        "viel",
        "alles",
        "später",
    }
)

_OTHER_HEADS = frozenset(
    {
        "wer",
        "was",
        "woher",
        "in",
        "von",
        "aus",
        "zum",
        "aber",
        "gern",
    }
)

_PHRASE_MARKERS = ("!", "?", "…", "...")


def _strip_head_for_pos(head: str) -> str:
    s = head.strip()
    s = re.sub(r" /[a-zA-Z]+/$", "", s).strip()
    s = re.sub(r" / (?=(?:der|die|das)\s)", " / ", s)
    return s.split(" / ")[0].strip()


def _lemma_token(head: str) -> str:
    s = _strip_head_for_pos(head)
    s = re.sub(r"^(der|die|das)\s+", "", s, flags=re.IGNORECASE).strip()
    return s.lower()


def infer_pos(card: dict[str, Any]) -> str:
    """Guess POS from card shape; prefer explicit ``pos`` when valid."""

    explicit = str(card.get("pos") or "").strip().lower()
    if explicit in VALID_POS:
        return explicit

    cid = str(card.get("id") or "").strip()
    if cid in _POS_BY_ID:
        return _POS_BY_ID[cid]

    if card.get("grammarTable"):
        return POS_GRAMMAR

    head = _strip_head_for_pos(str(card.get("head") or ""))
    if not head:
        return DEFAULT_POS

    if _RE_ARTICLE_HEAD.match(head):
        return POS_NOUN

    lower = head.lower()
    lemma = _lemma_token(head)

    if lemma in _ADJECTIVE_HEADS:
        return POS_ADJECTIVE
    if lemma in _ADVERB_HEADS:
        return POS_ADVERB
    if lemma in _OTHER_HEADS or head in {"Ihr-", "welcher · welche · welches"}:
        return POS_OTHER

    if any(ch in head for ch in _PHRASE_MARKERS):
        return POS_PHRASE
    if " " in head and not _RE_VERB_INFINITIVE.match(head):
        return POS_PHRASE

    if _RE_VERB_INFINITIVE.match(head):
        return POS_VERB

    if head[0].isupper() and len(head.split()) == 1:
        # Tschüss, Servus, Hoi, Entschuldigung without punct yet
        if lemma not in _ADJECTIVE_HEADS:
            return POS_PHRASE

    return DEFAULT_POS


def pos_label(pos: str) -> str:
    """Human-readable POS label for UI."""

    key = str(pos or "").strip().lower()
    return _POS_LABELS.get(key, key.capitalize() if key else "Other")


def collect_pos_options(cards: list[Any]) -> list[str]:
    """Distinct POS values present in ``cards``, in canonical order."""

    found: set[str] = set()
    for card in cards:
        if not isinstance(card, dict):
            continue
        found.add(normalize_pos(card))
    return [p for p in POS_ORDER if p in found]


def normalize_pos(card: dict[str, Any]) -> str:
    """Return canonical POS string for manifest storage."""

    return infer_pos(card)
