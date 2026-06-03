# -*- coding: utf-8 -*-
"""Stable card IDs and TTS speak text for vocabulary pronunciation audio."""

from __future__ import annotations

import re
from typing import Any

ID_PREFIX = "v-"
MAX_ID_SLUG = 48

_RE_ARTICLE_PAIR = re.compile(
    r"^(.+?)\s*/\s*((?:der|die|das)\s+.+)$",
    re.IGNORECASE,
)


def normalize_card_id(raw: Any) -> str | None:
    """Canonical ``id``: ``v-…`` (letters, digits, hyphens, underscores)."""

    if raw is None:
        return None
    s = str(raw).strip()
    if not s:
        return None
    if not s.startswith(ID_PREFIX):
        s = ID_PREFIX + s.lstrip("-")
    s = re.sub(r"[^\w-]", "-", s, flags=re.ASCII)
    s = re.sub(r"-+", "-", s).strip("-")
    return s if len(s) > len(ID_PREFIX) else None


def _segment_is_ipa(part: str) -> bool:
    p = part.strip()
    if not p:
        return True
    if p.startswith("/") or p.startswith("ˈ") or p.startswith("ˌ"):
        return True
    if "|" in p and not re.search(r"[a-zA-ZäöüÄÖÜß]{3}", p.split("|", 1)[0]):
        return True
    ipa_markers = "/ˈˌ|̩ʊəɪʁɐ̯ːʃçɡnxz"
    marked = sum(1 for c in p if c in ipa_markers)
    if len(p) >= 4 and marked / len(p) > 0.28:
        return True
    return False


def speak_text_for_head(head: str) -> str:
    """German phrase for head TTS: lemmas without IPA; pairs and phrases kept."""

    h = head.strip()
    if not h:
        return ""
    chunks: list[str] = []
    for part in h.split(" /"):
        part = part.strip()
        if not part:
            continue
        if _segment_is_ipa(part):
            break
        chunks.append(part)
    if not chunks:
        return h.split("/")[0].strip()
    text = ", ".join(chunks) if len(chunks) > 1 else chunks[0]
    return text.replace(" · ", ", ").strip()


def slug_for_card_id(head: str) -> str:
    """Readable slug from speakable head text (may be a full sentence)."""

    speak = speak_text_for_head(head)
    s = speak.lower()
    s = re.sub(r"[^\wäöüß]+", "-", s, flags=re.UNICODE)
    s = re.sub(r"-+", "-", s).strip("-")
    if len(s) > MAX_ID_SLUG:
        s = s[:MAX_ID_SLUG].rstrip("-")
    return s or "card"


def allocate_card_id(head: str, used: set[str]) -> str:
    base = slug_for_card_id(head)
    cand = f"{ID_PREFIX}{base}"
    if cand not in used:
        used.add(cand)
        return cand
    n = 2
    while True:
        suffix = f"-{n}"
        trim = MAX_ID_SLUG - len(suffix)
        cand = f"{ID_PREFIX}{base[:trim].rstrip('-')}{suffix}"
        if cand not in used:
            used.add(cand)
            return cand
        n += 1


def ensure_card_id(card: dict[str, Any], used: set[str]) -> str:
    existing = normalize_card_id(card.get("id"))
    if existing:
        used.add(existing)
        card["id"] = existing
        return existing
    head = str(card.get("head") or "").strip()
    cid = allocate_card_id(head or "card", used)
    card["id"] = cid
    return cid


def assign_ids_to_deck(cards: list[dict[str, Any]]) -> None:
    used: set[str] = set()
    for card in cards:
        if isinstance(card, dict):
            ensure_card_id(card, used)


def head_audio_url(card_id: str) -> str:
    return f"/audio/{card_id}.mp3"


def example_audio_url(card_id: str, index: int) -> str:
    return f"/audio/{card_id}-ex{index:02d}.mp3"


def legacy_audio_slug(head: str) -> str:
    """Old slug-based filenames (pre-id migration)."""

    speak = speak_text_for_head(head)
    s = speak.replace("!", "").replace("?", "").strip()
    s = re.sub(r"\s*/\s*", "_", s)
    s = re.sub(r"[^\wäöüÄÖÜß]+", "_", s)
    s = re.sub(r"_+", "_", s).strip("_")
    return s or "card"
