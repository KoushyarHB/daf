# -*- coding: utf-8 -*-
"""python-docx helpers for DaF vocab cards (+ JSON manifest rebuild)."""

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
IND = Inches(0.4)
NOTE_GRAY = RGBColor(0x40, 0x40, 0x40)
EXAMPLE_COLOR = RGBColor(0x30, 0x60, 0x8C)
# English gloss in parentheses after German in › lines (distinct from blue German):
EXAMPLE_TRANSLATION_COLOR = NOTE_GRAY

EXAMPLE_PREFIX = "\u203a "

DEFAULT_LEVEL = "A1"


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


def ordered_manifest_card(c: dict[str, Any]) -> dict[str, Any]:
    """Stable key order for JSON: content fields, then metadata."""

    od: dict[str, Any] = {
        "head": c["head"],
        "gloss": c["gloss"],
        "notes": c["notes"],
        "examples": c["examples"],
    }
    if "example_units" in c and c["example_units"]:
        od["example_units"] = c["example_units"]
    od["createdAt"] = c["createdAt"]
    od["updatedAt"] = c["updatedAt"]
    od["lektion"] = c["lektion"]
    od["level"] = c["level"]
    return od


def normalize_card_meta(card: dict[str, Any]) -> dict[str, Any]:
    """Fill required manifest metadata; coerce types. Word export code paths should call this before writing JSON."""

    now = utc_now_iso()
    head = (card.get("head") or "").strip()
    gloss = [x for x in (card.get("gloss") or []) if isinstance(x, str)]
    notes = [x for x in (card.get("notes") or []) if isinstance(x, str)]
    examples = [x for x in (card.get("examples") or []) if isinstance(x, str)]
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
    if isinstance(card.get("example_units"), list) and card["example_units"]:
        out["example_units"] = card["example_units"]
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
            "examples": list(c.get("examples") or []),
        }
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


def gloss_heuristic(text: str) -> bool:
    s = text.lstrip()
    prefixes = (
        "Good day",
        "The conversation",
        "To be",
        "To hear",
        "To fit",
        "To say",
        "New;",
        "New (",
        "Intern",
        "Separabl",
        "Which (",
        "Photo;",
        "Regional-polite",
        "Separable",
        "Conversation",
        "Polite",
        "To complete",
        "To read",
        "Interrogative",
        "Feminine singular",
        "How",
        "To be called",
        "Please",
        "From where",
        "And",
        "Secretary",
        "Ms.",
        "From;",
        "Argentina",
        "To come",
        "Everything",
        "Correct",
        "Grammar",
        "At a",
        "Glance",
        "Verb",
        "Collect",
        "Table (",
        "Verb form",
    )
    return s.startswith(prefixes)


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
    if t.lstrip().startswith("\u2022"):
        return "note"
    if gloss_heuristic(t):
        return "gloss"
    return "example"


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
            cur["gloss"].append(txt)
        elif rr == "note":
            cur["notes"].append(txt)
        else:
            cur.setdefault("examples", []).append(strip_example_surface(txt))

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


def add_example_line(doc: Document, *, body_without_prefix: str):
    """One or more indented › paragraphs: German in slate blue, ``(English)`` in gray. Chunks joined by `` / `` in JSON become separate lines."""

    body = body_without_prefix.strip()
    if not body:
        return
    chunks = split_example_body_units(body)
    if not chunks:
        return
    n = len(chunks)
    for idx, ch in enumerate(chunks):
        de, en = split_example_chunk_translation(ch)
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
            run_en = paragraph.add_run(" " + en)
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

    examples = []
    units = card.get("example_units")
    if isinstance(units, list) and units:
        flat: list[tuple[str, str]] = []
        for pair in units:
            if isinstance(pair, (list, tuple)) and len(pair) >= 2 and all(isinstance(x, str) for x in pair[:2]):
                flat.append((pair[0], pair[1]))
        if flat:
            examples.append(format_example_chunks(flat))
    for legacy in card.get("examples") or []:
        if isinstance(legacy, str) and legacy.strip():
            examples.append(legacy.strip())

    for raw in examples:
        add_example_line(doc, body_without_prefix=raw)


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
