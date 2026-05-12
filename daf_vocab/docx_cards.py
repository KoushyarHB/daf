# -*- coding: utf-8 -*-
"""python-docx helpers for DaF vocab cards.

``vocab.manifest.json`` holds canonical deck content. ``export_manifest_file`` (``manual-edit-from-docx`` / legacy ``pull``, ``export``)
merges a Word snapshot into the manifest.
``build_vocab_from_manifest_file`` (``manual-edit-from-manifest`` / legacy ``sync``,
``build``) regenerates Word from the manifest and rewrites normalized JSON.
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from docx import Document
from docx.shared import Inches, Pt, RGBColor

DEFAULT_VOCAB_PATH = Path(__file__).resolve().parent.parent / "vocab.docx"
MANIFEST_PATH = Path(__file__).resolve().parent.parent / "vocab.manifest.json"

TITLE = "daf — vocabulary"
HEADING_BLUE = RGBColor(0x2F, 0x6F, 0xB8)
# Plural line: textbook ``die Antwort, -en`` (roman, same size as gloss).
IND = Inches(0.4)
NOTE_GRAY = RGBColor(0x40, 0x40, 0x40)
EXAMPLE_COLOR = RGBColor(0x30, 0x60, 0x8C)
# English gloss in parentheses after German in › lines (distinct from blue German):
EXAMPLE_TRANSLATION_COLOR = NOTE_GRAY

EXAMPLE_PREFIX = "\u203a "

DEFAULT_LEVEL = "A1"

# Legacy manifests used full ``die …`` NPs; map (lemma, plural NP) to textbook suffix fragment.
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
    ("der Praktikant", "die Praktikanten"): "-en / die Praktikantin, -nen",
}


def parse_plural_field_from_word_line(text: str, head_line: str | None) -> str | None:
    """If an indented line is plural metadata, return the stored ``plural`` field (suffix side).

    Accepts textbook ``{lemma}, -en`` round-trip, shorthand ``→ -en``, or legacy ``lemma → die Plural`` from older Word.
    """

    s = (text or "").strip()
    if not s or not head_line:
        return None
    lemma_guess, _ipa = split_head(head_line.strip())
    lemma_key = lemma_guess.strip()

    arrow = "\u2192"
    if s.startswith(arrow):
        rhs = s[len(arrow) :].strip()
        return rhs or None
    if s.startswith("->"):
        rhs = s[2:].lstrip()
        return rhs or None

    for legacy_sep in (" \u2192 ", " → "):
        if legacy_sep in s:
            left, right = [x.strip() for x in s.split(legacy_sep, 1)]
            if left == lemma_key and right:
                return right

    if not lemma_key:
        return None
    for pref in (lemma_key + ", ", lemma_key + " , "):
        if s.startswith(pref):
            frag = s[len(pref) :].strip()
            return frag or None
    return None


def canonicalize_plural_field(head: str, raw: str) -> str:
    """Normalize ``plural`` JSON to textbook suffix notation (possibly with `` / …`` pairs)."""

    s = str(raw).strip()
    if not s:
        return ""
    lemma, _ = split_head(head.strip())
    lemma_key = lemma.strip()

    if s.startswith("-"):
        return s

    for legacy_sep in (" \u2192 ", " → "):
        if legacy_sep in s:
            left, right = [x.strip() for x in s.split(legacy_sep, 1)]
            if left == lemma_key and right:
                return canonicalize_plural_field(head, right)

    if s.startswith("die "):
        key = (lemma_key, s)
        if key in _LEGACY_LEMMA_PLURAL_TO_SUFFIX:
            return _LEGACY_LEMMA_PLURAL_TO_SUFFIX[key]
    return s


def utc_now_iso() -> str:
    """UTC timestamp for manifest metadata (ISO 8601, Z suffix)."""

    return datetime.now(timezone.utc).replace(microsecond=0).strftime("%Y-%m-%dT%H:%M:%SZ")


def _coerce_lektion(value: Any) -> int | None:
    if value is None or value is False:
        return None
    if isinstance(value, bool):
        return None
    if isinstance(value, int):
        return value
    if isinstance(value, float) and value == int(value):
        return int(value)
    if isinstance(value, str) and not str(value).strip():
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def ordered_example_object(ex: dict[str, Any]) -> dict[str, Any]:
    """Stable keys: ``german``, ``english`` (null when no gloss)."""

    g = (ex.get("german") or "").strip()
    e = ex.get("english")
    if e is None:
        en_out: str | None = None
    elif isinstance(e, str):
        en_out = e.strip() or None
    else:
        en_out = str(e).strip() or None
    return {"german": g, "english": en_out}


def ordered_manifest_card(c: dict[str, Any]) -> dict[str, Any]:
    """Stable key order for JSON: content fields, then metadata."""

    ex_raw = c.get("examples") or []
    examples_ord = [ordered_example_object(x) for x in ex_raw if isinstance(x, dict)]
    plural = (c.get("plural") or "").strip()
    od: dict[str, Any] = {"head": c["head"]}
    if plural:
        od["plural"] = plural
    od["gloss"] = c["gloss"]
    od["notes"] = c["notes"]
    od["examples"] = examples_ord
    od["createdAt"] = c["createdAt"]
    od["updatedAt"] = c["updatedAt"]
    od["lektion"] = c["lektion"]
    od["level"] = c["level"]
    return od


def english_gloss_inner(en: str | None) -> str | None:
    """Canonical manifest stores English without wrapping parentheses; migrate legacy ``(English)``."""

    if en is None:
        return None
    s = str(en).strip()
    if not s:
        return None
    if len(s) >= 2 and s[0] == "(" and s[-1] == ")":
        return s[1:-1].strip() or None
    return s


def _examples_from_legacy_string(s: str) -> list[dict[str, Any]]:
    """One legacy manifest string (possibly with `` / `` between units) → example objects."""

    s = s.strip()
    if not s:
        return []
    out: list[dict[str, Any]] = []
    for chunk in split_example_body_units(s):
        de, en = split_example_chunk_translation(chunk)
        de = (de or "").strip()
        en_in = english_gloss_inner(en) if en else None
        if de or en_in:
            out.append({"german": de, "english": en_in})
    return out


def normalize_examples_from_card(card: dict[str, Any]) -> list[dict[str, Any]]:
    """Canonical ``examples``: ``[{ \"german\", \"english\" }, ...]``; migrate strings and ``example_units``."""

    out: list[dict[str, Any]] = []
    units = card.get("example_units")
    if isinstance(units, list) and units:
        for pair in units:
            if not isinstance(pair, (list, tuple)) or len(pair) < 2:
                continue
            g = str(pair[0]).strip()
            raw_e = str(pair[1]).strip() if pair[1] is not None else ""
            e = english_gloss_inner(raw_e) if raw_e else None
            if g or e:
                out.append({"german": g, "english": e})
    for item in card.get("examples") or []:
        if isinstance(item, dict):
            g = (item.get("german") or "").strip()
            e = item.get("english")
            if e is None:
                en_out = None
            elif isinstance(e, str):
                en_out = english_gloss_inner(e)
            else:
                en_out = english_gloss_inner(str(e))
            if g or en_out:
                out.append({"german": g, "english": en_out})
        elif isinstance(item, str):
            out.extend(_examples_from_legacy_string(item))
    return out


def normalize_card_meta(card: dict[str, Any]) -> dict[str, Any]:
    """Fill required manifest metadata; coerce types. Word export code paths should call this before writing JSON."""

    now = utc_now_iso()
    head = (card.get("head") or "").strip()
    gloss = [x for x in (card.get("gloss") or []) if isinstance(x, str)]
    notes = [x for x in (card.get("notes") or []) if isinstance(x, str)]
    examples = normalize_examples_from_card(card)
    created = card.get("createdAt")
    updated = card.get("updatedAt")
    if not created:
        created = updated if updated else now
    if not updated:
        updated = created if created else now
    level_raw = card.get("level")
    level = str(level_raw).strip() if level_raw else DEFAULT_LEVEL
    if not level:
        level = DEFAULT_LEVEL
    plural_raw = card.get("plural")
    plural_str = str(plural_raw).strip() if plural_raw else ""
    if plural_str:
        plural_str = canonicalize_plural_field(head, plural_str)
    out: dict[str, Any] = {
        "head": head,
        "gloss": gloss,
        "notes": notes,
        "examples": examples,
        "createdAt": str(created),
        "updatedAt": str(updated),
        "lektion": _coerce_lektion(card.get("lektion")),
        "level": level,
    }
    if plural_str:
        out["plural"] = plural_str
    return ordered_manifest_card(out)


def merge_parsed_cards_with_previous_manifest(
    parsed: list[dict[str, Any]],
    previous: list[dict[str, Any]] | None,
) -> list[dict[str, Any]]:
    """Attach metadata from an existing manifest (matched by ``head``). New heads get fresh timestamps and defaults."""

    now = utc_now_iso()
    prev_by_head: dict[str, dict[str, Any]] = {}
    if previous:
        for c in previous:
            if isinstance(c, dict) and c.get("head"):
                prev_by_head[str(c["head"]).strip()] = c
    out: list[dict[str, Any]] = []
    for c in parsed:
        h = (c.get("head") or "").strip()
        prev = prev_by_head.get(h)
        merged: dict[str, Any] = {
            "head": h,
            "gloss": list(c.get("gloss") or []),
            "notes": list(c.get("notes") or []),
            "examples": normalize_examples_from_card(c),
        }
        pl_new = (c.get("plural") or "").strip()
        if pl_new:
            merged["plural"] = pl_new
        elif prev:
            pl_keep = (prev.get("plural") or "").strip()
            if pl_keep:
                merged["plural"] = pl_keep
        if prev:
            merged["createdAt"] = prev.get("createdAt") or now
            merged["updatedAt"] = now
            merged["lektion"] = _coerce_lektion(prev.get("lektion"))
            merged["level"] = str(prev.get("level") or DEFAULT_LEVEL).strip() or DEFAULT_LEVEL
        else:
            merged["createdAt"] = now
            merged["updatedAt"] = now
            merged["lektion"] = None
            merged["level"] = DEFAULT_LEVEL
        out.append(normalize_card_meta(merged))
    return out


def indented(p) -> bool:
    return bool(p.paragraph_format.left_indent)


def _is_example_paragraph(text: str) -> bool:
    """Examples are indented lines that begin with ``›`` (U+203A); glosses never use this marker."""

    s = text.lstrip()
    if not s:
        return False
    if s.startswith("\u203a"):
        return True
    return s.startswith("›")


def role(p) -> str:
    """Classify paragraphs for vocabulary cards (titles + separators ignored upstream)."""

    if p.style and p.style.name == "Heading 1":
        return "title"
    t = p.text or ""
    if not t.strip():
        return "blank"
    if t.strip() == TITLE:
        return "title"
    if not indented(p):
        return "head"
    tl = t.lstrip()
    if tl.startswith("\u2022") or tl.startswith("•"):
        return "note"
    if _is_example_paragraph(t):
        return "example"
    return "gloss"


def parse_vocab_document(doc_path: Path) -> list[dict[str, Any]]:
    """Turn an existing vocab Word file into normalized dict cards for JSON export."""

    doc = Document(str(doc_path))
    cards: list[dict[str, Any]] = []
    cur: dict[str, Any] | None = None

    for p in doc.paragraphs:
        rr = role(p)
        if rr in {"blank", "title"}:
            continue
        if rr == "head":
            if cur:
                cards.append(cur)
            cur = {"head": (p.text or "").strip(), "gloss": [], "notes": [], "examples": []}
            continue
        if cur is None:
            continue
        txt = (p.text or "").strip()
        if rr == "gloss":
            pl_try = parse_plural_field_from_word_line(txt, cur.get("head"))
            if pl_try:
                cur["plural"] = pl_try
                continue
            cur["gloss"].append(txt)
        elif rr == "note":
            cur["notes"].append(txt)
        else:
            body = strip_example_surface(txt)
            for chunk in split_example_body_units(body):
                de, en = split_example_chunk_translation(chunk)
                de = (de or "").strip()
                en_in = english_gloss_inner(en) if en else None
                if de or en_in:
                    cur.setdefault("examples", []).append({"german": de, "english": en_in})

    if cur:
        cards.append(cur)
    return cards


def strip_example_surface(text: str) -> str:
    """Keep only the textual body following the leading › marker."""

    s = text.lstrip()
    if s.startswith("\u203a"):
        return s[len("\u203a") :].lstrip()
    if s.startswith("›"):
        return s[1:].lstrip()
    return text


def format_example_chunks(pairs: list[tuple[str, str]]) -> str:
    """`(de, en)` → `DE (English) / DE2 (English2)` respecting the project's example rule."""

    parts: list[str] = []
    for de_raw, en_raw in pairs:
        chunk = f"{de_raw.strip()} ({en_raw.strip()})"
        parts.append(chunk)
    return " / ".join(parts)


def split_head(head: str) -> tuple[str, str | None]:
    parts = head.split(" /", 1)
    if len(parts) != 2:
        return head, None
    return parts[0], "/" + parts[1]


def _new_base_document():
    doc = Document()
    doc.styles["Normal"].font.name = "Calibri"
    doc.styles["Normal"].font.size = Pt(11)

    h = doc.add_heading(TITLE, level=1)
    h.paragraph_format.space_after = Pt(12)
    for run in h.runs:
        run.font.color.rgb = HEADING_BLUE
    return doc


def split_example_chunk_translation(chunk: str) -> tuple[str, str | None]:
    """Split ``German (English)`` into German text and ``(English)``, or return whole chunk as German."""

    chunk = chunk.strip()
    if not chunk:
        return "", None
    if chunk.endswith(")") and " (" in chunk:
        i = chunk.rfind(" (")
        if i >= 0:
            return chunk[:i].strip(), chunk[i + 1 :].strip()
    return chunk, None


def split_example_body_units(body: str) -> list[str]:
    """Split merged example text on `` / `` only outside ``(...)``.

    English inside parentheses may contain `` / `` (e.g. *Good afternoon / hello*).
    """

    s = body.strip()
    if not s:
        return []
    units: list[str] = []
    start = 0
    depth = 0
    n = len(s)
    i = 0
    while i < n:
        c = s[i]
        if c == "(":
            depth += 1
        elif c == ")":
            depth = max(0, depth - 1)
        elif depth == 0 and i + 3 <= n and s[i : i + 3] == " / ":
            units.append(s[start:i].strip())
            start = i + 3
            i += 3
            continue
        i += 1
    units.append(s[start:].strip())
    return [u for u in units if u]


def add_example_objects(doc: Document, objects: list[dict[str, Any]]) -> None:
    """One indented ``›`` paragraph per example (German slate blue; optional ``(English)`` gray)."""

    objs: list[dict[str, Any]] = []
    for obj in objects:
        de = (obj.get("german") or "").strip()
        e = obj.get("english")
        if e is None:
            en: str | None = None
        elif isinstance(e, str):
            en = e.strip() or None
        else:
            en = str(e).strip() or None
        if de or en:
            objs.append({"german": de, "english": en})
    n = len(objs)
    if not n:
        return
    for idx, obj in enumerate(objs):
        de = obj["german"]
        en = obj["english"]
        paragraph = doc.add_paragraph()
        paragraph.paragraph_format.left_indent = IND
        paragraph.paragraph_format.space_before = Pt(2) if idx == 0 else Pt(0)
        paragraph.paragraph_format.space_after = Pt(6) if idx == n - 1 else Pt(3)

        for piece, color in (
            (EXAMPLE_PREFIX, EXAMPLE_COLOR),
            (de, EXAMPLE_COLOR),
        ):
            run = paragraph.add_run(piece)
            run.font.size = Pt(10.5)
            run.font.italic = True
            run.font.color.rgb = color
        if en:
            run_en = paragraph.add_run(" (" + en + ")")
            run_en.font.size = Pt(10.5)
            run_en.font.italic = True
            run_en.font.color.rgb = EXAMPLE_TRANSLATION_COLOR


def write_card(doc: Document, card: dict[str, Any], *, is_first: bool):
    if not is_first:
        spacer = doc.add_paragraph("")
        spacer.paragraph_format.space_before = Pt(0)
        spacer.paragraph_format.space_after = Pt(0)

    head = (card.get("head") or "").strip()
    lemma, ipa = split_head(head)
    head_p = doc.add_paragraph()
    head_p.paragraph_format.space_after = Pt(6)
    head_p.add_run(lemma).bold = True
    if ipa:
        head_p.add_run(" " + ipa)

    plural = (card.get("plural") or "").strip()
    if plural:
        plural_line = f"{lemma}, {plural}"
        pl_p = doc.add_paragraph()
        pl_p.paragraph_format.left_indent = IND
        pl_p.paragraph_format.space_after = Pt(4)
        r_pl = pl_p.add_run(plural_line)
        r_pl.font.size = Pt(11)

    for g in card.get("gloss") or []:
        g_p = doc.add_paragraph(g)
        g_p.paragraph_format.left_indent = IND
        g_p.paragraph_format.space_after = Pt(4)

    for n in card.get("notes") or []:
        note_p = doc.add_paragraph()
        note_p.paragraph_format.left_indent = IND
        note_p.paragraph_format.space_after = Pt(4)
        r = note_p.add_run(n)
        r.font.size = Pt(10)
        r.font.italic = True
        r.font.color.rgb = NOTE_GRAY

    add_example_objects(doc, normalize_examples_from_card(card))


def build_vocab_document(cards: list[dict[str, Any]]) -> Document:
    doc = _new_base_document()
    for idx, card in enumerate(cards):
        write_card(doc, card, is_first=idx == 0)
    return doc


def rebuild_vocab_layout(source_path: Path, destination_path: Path | None = None) -> Path:
    """Parse + rewrite to normalize spacing/example styling."""

    dst = destination_path or source_path
    cards = parse_vocab_document(source_path)
    doc = build_vocab_document(cards)
    doc.save(str(dst))
    return dst


def export_manifest_file(
    vocab_path: Path = DEFAULT_VOCAB_PATH,
    manifest_path: Path = MANIFEST_PATH,
) -> Path:
    """Merge a Word snapshot into ``manifest_path`` (canonical JSON on disk)."""

    parsed = parse_vocab_document(vocab_path)
    previous: list[dict[str, Any]] | None = None
    if manifest_path.exists():
        try:
            raw = json.loads(manifest_path.read_text(encoding="utf-8"))
            if isinstance(raw, list):
                previous = raw
        except (json.JSONDecodeError, OSError):
            previous = None
    data = merge_parsed_cards_with_previous_manifest(parsed, previous)
    manifest_path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return manifest_path


def build_vocab_from_manifest_file(
    manifest_path: Path = MANIFEST_PATH,
    vocab_path: Path = DEFAULT_VOCAB_PATH,
) -> Path:
    blob = json.loads(manifest_path.read_text(encoding="utf-8"))
    if not isinstance(blob, list):
        raise ValueError("Manifest must be a JSON array of card objects")
    cards = [normalize_card_meta(c) for c in blob if isinstance(c, dict)]
    if len(cards) != len(blob):
        raise ValueError("Manifest must contain only JSON objects (card dicts)")
    doc = build_vocab_document(cards)
    doc.save(str(vocab_path))
    manifest_path.write_text(json.dumps(cards, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return vocab_path
