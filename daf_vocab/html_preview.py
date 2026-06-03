# -*- coding: utf-8 -*-
"""Render ``vocab.manifest.json`` to a static HTML page for local preview in a browser."""

from __future__ import annotations

import html
import json
import shutil
from datetime import datetime
from pathlib import Path
from typing import Any

from .docx_cards import (
    canonicalize_plural_field,
    iter_grammar_adj_suffix_runs,
    normalize_examples_from_card,
    normalize_grammar_table,
    split_head,
)


TITLE_PAGE = "daf — vocabulary"

CSS = """\
:root {
  --blue: rgb(48, 96, 140);
  --gray-en: rgb(64, 64, 64);
  --head-blue: rgb(47, 111, 184);
  --border: #e0e0e0;
  --site-content-max: 44rem;
  --site-pad-x: 1rem;
}
* { box-sizing: border-box; }
html {
  margin: 0;
}
body {
  font-family: Calibri, "Segoe UI", Roboto, sans-serif;
  font-size: 11pt;
  line-height: 1.45;
  max-width: var(--site-content-max);
  margin: 0 auto;
  padding: 0 var(--site-pad-x) 3rem;
  color: #111;
  background: #fafafa;
}
.site-header + * {
  margin-top: 1.25rem;
}
h1 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--head-blue);
  border-bottom: 2px solid var(--head-blue);
  padding-bottom: 0.35rem;
  margin-bottom: 1.25rem;
}
.card {
  border-bottom: 1px solid var(--border);
  padding: 0.9rem 0;
}
.card:first-of-type { padding-top: 0; }
.head-line {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex-wrap: wrap;
  margin-bottom: 0.35rem;
}
.head-line .head {
  margin-bottom: 0;
}
.head {
  font-weight: 700;
  margin-bottom: 0.35rem;
}
.pronounce-btn {
  width: 1.65rem;
  height: 1.65rem;
  border-radius: 50%;
  border: 1px solid rgba(47, 111, 184, 0.32);
  background: rgba(241, 246, 252, 0.95);
  color: var(--head-blue);
  cursor: pointer;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  line-height: 1;
  transition: background 0.15s, border-color 0.15s, transform 0.1s;
}
.pronounce-btn:hover {
  background: #e8f0fa;
  border-color: rgba(47, 111, 184, 0.55);
}
.pronounce-btn:focus-visible {
  outline: 2px solid rgba(47, 111, 184, 0.45);
  outline-offset: 2px;
}
.pronounce-btn:active {
  transform: scale(0.92);
}
.pronounce-btn svg {
  width: 0.62rem;
  height: 0.62rem;
  margin-left: 0.05rem;
  fill: currentColor;
}
.meta {
  font-size: 0.75rem;
  color: #666;
  margin-bottom: 0.5rem;
}
.meta span { margin-right: 0.75rem; }
.gloss, .gloss p {
  margin: 0.35rem 0;
  padding-left: 0.6rem;
  border-left: 3px solid #ddd;
}
.notes {
  font-size: 10pt;
  font-style: italic;
  color: #404040;
  padding-left: 0.6rem;
  margin: 0.35rem 0;
}
.ex-block { margin-top: 0.45rem; padding-left: 0.6rem; }
.ex-line {
  font-size: 10.5pt;
  font-style: italic;
  margin: 0.25rem 0;
}
.ex-de { color: var(--blue); }
.ex-en { color: var(--gray-en); }
.chevr { color: var(--blue); margin-right: 0.15em; }
.plural-diagram {
  margin: 0.25rem 0 0.35rem 0;
  padding-left: 0.6rem;
  border-left: 3px solid #ddd;
  font-size: 11pt;
  color: #111;
}
.card-image {
  margin-top: 0.6rem;
  padding-left: 0.6rem;
}
.card-image img {
  display: block;
  max-width: 100%;
  height: auto;
  border: 1px solid var(--border);
  border-radius: 4px;
}
.grammar-table-wrap {
  margin: 0.35rem 0 0.65rem 0;
  padding-left: 0.6rem;
  border-left: 3px solid transparent;
}
.grammar-table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  margin: 0;
  font-size: 9.5pt;
}
.grammar-col-case {
  width: 3.25rem;
}
.grammar-adj-sfx {
  color: var(--blue);
  font-weight: 700;
}
.grammar-table th,
.grammar-table td {
  border: 1px solid var(--border);
  padding: 0.35rem 0.45rem;
  text-align: left;
  vertical-align: top;
}
.grammar-table th {
  font-weight: 600;
  background: #f1f6fc;
  color: #333;
}
footer {
  margin-top: 2rem;
  font-size: 0.8rem;
  color: #888;
}
.deck-controls {
  margin: 0 0 1.25rem;
  padding: 0.85rem 0.9rem;
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 6px;
}
.deck-controls-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem 1rem;
  align-items: flex-end;
}
.deck-controls label {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  font-size: 0.72rem;
  font-weight: 600;
  color: #555;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
.deck-controls select {
  font: inherit;
  font-size: 0.95rem;
  font-weight: 400;
  text-transform: none;
  letter-spacing: normal;
  color: #111;
  padding: 0.35rem 0.5rem;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: #fafafa;
  min-width: 8.5rem;
}
.deck-count {
  margin: 0.55rem 0 0;
  font-size: 0.8rem;
  color: #666;
}
.card.is-hidden {
  display: none;
}
#deck .card:first-of-type {
  padding-top: 0;
}
.site-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #fff;
  border-bottom: 1px solid var(--border);
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.04);
  width: 100vw;
  margin-left: calc(50% - 50vw);
  margin-right: calc(50% - 50vw);
  margin-top: 0;
  margin-bottom: 0;
  padding: 0.85rem 0;
}
.site-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.2rem;
  flex-wrap: wrap;
  max-width: var(--site-content-max);
  margin: 0 auto;
  width: 100%;
  padding: 0 var(--site-pad-x);
  box-sizing: border-box;
}
.site-brand {
  display: flex;
  align-items: center;
}
.site-brand img {
  display: block;
  height: 52px;
  width: auto;
  max-width: min(56vw, 420px);
}
.site-nav {
  display: flex;
  align-items: center;
  gap: 2.25rem;
  flex-wrap: wrap;
}
.site-nav a {
  font-size: 0.92rem;
  font-weight: 600;
  color: #2b64b8;
  text-decoration: none;
}
.site-nav a:hover {
  color: #1a4f99;
}
.site-nav a.is-active {
  text-decoration: underline;
  text-decoration-color: rgba(43, 100, 184, 0.45);
  text-underline-offset: 4px;
  text-decoration-thickness: 1.5px;
}
.nav-links {
  margin: 0 0 1rem;
  font-size: 0.95rem;
}
.nav-links a {
  color: var(--head-blue);
  text-decoration: none;
  font-weight: 600;
}
.nav-links a:hover {
  text-decoration: underline;
}
.lesson-list {
  margin: 0.8rem 0 0;
  padding: 0;
  list-style: none;
}
.lesson-item {
  border: 1px solid var(--border);
  border-radius: 6px;
  background: #fff;
  padding: 0.75rem;
  margin-bottom: 0.9rem;
}
.lesson-item a {
  color: var(--head-blue);
}
.lesson-item img {
  display: block;
  width: 100%;
  max-width: 100%;
  height: auto;
  margin-top: 0.6rem;
  border: 1px solid var(--border);
  border-radius: 4px;
}
.lesson-header {
  background: #ffffff;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0.9rem 1rem;
  margin-bottom: 1rem;
}
.lesson-header h1 {
  margin: 0 0 0.4rem 0;
  border-bottom: none;
  padding-bottom: 0;
}
.lesson-links {
  margin: 0 0 1.25rem;
  padding: 0.85rem 1rem;
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 8px;
}
.lesson-links h2 {
  margin: 0 0 0.6rem 0;
  font-size: 1.05rem;
  color: #222;
}
.lesson-links ul {
  margin: 0;
  padding-left: 1.1rem;
}
.lesson-links li {
  margin: 0.28rem 0;
}
.lesson-preview-title {
  margin: 0 0 0.65rem;
  font-size: 1.05rem;
  color: #222;
}
"""

PRONOUNCE_JS = """\
(function () {
  var player = new Audio();
  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".pronounce-btn");
    if (!btn) return;
    var src = btn.getAttribute("data-audio");
    if (!src) return;
    e.preventDefault();
    player.pause();
    player.src = src;
    player.play().catch(function () {});
  });
})();
"""

FILTER_SORT_JS = """\
(function () {
  var deck = document.getElementById("deck");
  if (!deck) return;
  var cards = Array.from(deck.querySelectorAll(".card"));
  var countEl = document.getElementById("deck-count");
  var lektionSel = document.getElementById("filter-lektion");
  var levelSel = document.getElementById("filter-level");
  var sortSel = document.getElementById("sort-order");
  if (!countEl || !lektionSel || !levelSel || !sortSel) return;

  var deckOrder = cards.slice();

  function deckIndex(card) {
    return deckOrder.indexOf(card);
  }

  function apply() {
    var lek = lektionSel.value;
    var lvl = levelSel.value;
    var sort = sortSel.value;
    var visible = cards.filter(function (card) {
      if (lek !== "all" && card.dataset.lektion !== lek) return false;
      if (lvl !== "all" && card.dataset.level !== lvl) return false;
      return true;
    });

    if (sort === "date-asc") {
      visible.sort(function (a, b) {
        return (Number(a.dataset.createdMs) || 0) - (Number(b.dataset.createdMs) || 0);
      });
    } else if (sort === "date-desc") {
      visible.sort(function (a, b) {
        return (Number(b.dataset.createdMs) || 0) - (Number(a.dataset.createdMs) || 0);
      });
    } else {
      visible.sort(function (a, b) {
        return deckIndex(a) - deckIndex(b);
      });
    }

    cards.forEach(function (card) {
      card.classList.add("is-hidden");
    });
    visible.forEach(function (card) {
      card.classList.remove("is-hidden");
      deck.appendChild(card);
    });

    countEl.textContent = visible.length + " of " + cards.length + " cards";
  }

  lektionSel.addEventListener("change", apply);
  levelSel.addEventListener("change", apply);
  sortSel.addEventListener("change", apply);
  apply();
})();
"""


def iso_to_ms(iso: str | None) -> int:
    """Parse ISO 8601 UTC timestamps for client-side date sort."""

    if not iso or not str(iso).strip():
        return 0
    s = str(iso).strip()
    if s.endswith("Z"):
        s = s[:-1] + "+00:00"
    try:
        return int(datetime.fromisoformat(s).timestamp() * 1000)
    except ValueError:
        return 0


def collect_filter_options(cards: list[dict[str, Any]]) -> tuple[list[int], list[str]]:
    lektions: set[int] = set()
    levels: set[str] = set()
    for card in cards:
        if not isinstance(card, dict):
            continue
        lek = card.get("lektion")
        if isinstance(lek, int):
            lektions.add(lek)
        elif lek is not None:
            try:
                lektions.add(int(lek))
            except (TypeError, ValueError):
                pass
        lvl = card.get("level")
        if isinstance(lvl, str) and lvl.strip():
            levels.add(lvl.strip())
    return sorted(lektions), sorted(levels)


def card_data_attrs(card: dict[str, Any]) -> str:
    lek = card.get("lektion")
    lek_attr = ""
    if lek is not None:
        lek_attr = str(int(lek)) if isinstance(lek, int) else html.escape(str(lek).strip())
    level = card.get("level")
    level_attr = html.escape(str(level).strip()) if level else ""
    created = card.get("createdAt") or card.get("updatedAt")
    created_ms = iso_to_ms(str(created) if created else None)
    return (
        f' data-lektion="{lek_attr}"'
        f' data-level="{level_attr}"'
        f' data-created-ms="{created_ms}"'
    )


def pronounce_button_html(audio_path: str | None) -> str:
    """Small round play button; ``audio_path`` like ``/audio/lemma.mp3``."""

    audio = str(audio_path or "").strip()
    if not audio:
        return ""
    src_path = audio.lstrip("/") if audio.startswith("/") else audio
    src = html.escape(src_path, quote=True)
    return (
        '<button type="button" class="pronounce-btn" data-audio="'
        + src
        + '" aria-label="Play pronunciation" title="Listen">'
        '<svg viewBox="0 0 12 12" aria-hidden="true">'
        '<path d="M3 2.5v7l6.5-3.5L3 2.5z"/>'
        "</svg></button>"
    )


def card_image_block_html(card: dict[str, Any]) -> str:
    image = str(card.get("image") or "").strip()
    if not image:
        return ""
    src_path = image.lstrip("/") if image.startswith("/") else image
    src = html.escape(src_path, quote=True)
    alt = html.escape(f"{str(card.get('head') or '').strip()} image")
    return (
        '<div class="card-image">'
        f'<img src="{src}" alt="{alt}" loading="lazy" />'
        "</div>"
    )


def deck_controls_html(lektions: list[int], levels: list[str]) -> str:
    lek_opts = ['<option value="all">All</option>']
    for n in lektions:
        lek_opts.append(f'<option value="{n}">Lektion {n}</option>')
    lvl_opts = ['<option value="all">All</option>']
    for lv in levels:
        esc = html.escape(lv)
        lvl_opts.append(f'<option value="{esc}">{esc}</option>')
    return (
        '<div class="deck-controls" role="region" aria-label="Filter and sort">'
        '<div class="deck-controls-row">'
        '<label>Lektion <select id="filter-lektion">'
        + "".join(lek_opts)
        + "</select></label>"
        '<label>Level <select id="filter-level">'
        + "".join(lvl_opts)
        + "</select></label>"
        '<label>Sort <select id="sort-order">'
        '<option value="deck">Deck order</option>'
        '<option value="date-desc">Date: newest first</option>'
        '<option value="date-asc">Date: oldest first</option>'
        "</select></label>"
        "</div>"
        '<p class="deck-count" id="deck-count" aria-live="polite"></p>'
        "</div>"
    )


def format_grammar_phrase_cell_html(text: str) -> str:
    parts: list[str] = []
    for chunk, is_suffix in iter_grammar_adj_suffix_runs(text):
        if chunk == "":
            continue
        esc = html.escape(chunk)
        if is_suffix:
            parts.append(f'<strong class="grammar-adj-sfx">{esc}</strong>')
        else:
            parts.append(esc)
    return "".join(parts)


def grammar_table_block_html(gt: dict[str, Any]) -> str:
    cols = gt["columns"]
    rows = gt["rows"]
    nc = len(cols)
    narrow_first_col = nc > 0 and str(cols[0]).strip() == ""
    cg_bits = ["<colgroup>"]
    if narrow_first_col:
        cg_bits.append('<col class="grammar-col-case" />')
        if nc > 1:
            cg_bits.append(f'<col span="{nc - 1}" />')
    elif nc:
        cg_bits.append(f'<col span="{nc}" />')
    cg_bits.append("</colgroup>")
    thead = "<thead><tr>" + "".join(f"<th>{html.escape(str(c))}</th>" for c in cols) + "</tr></thead>"
    tbody_parts = ["<tbody>"]
    for row in rows:
        tbody_parts.append("<tr>")
        for j in range(nc):
            raw = row[j] if j < len(row) else ""
            inner = html.escape(str(raw)) if j == 0 else format_grammar_phrase_cell_html(str(raw))
            tbody_parts.append(f"<td>{inner}</td>")
        tbody_parts.append("</tr>")
    tbody_parts.append("</tbody>")
    inner_tbl = "".join(cg_bits) + thead + "".join(tbody_parts)
    return f'<div class="grammar-table-wrap"><table class="grammar-table">{inner_tbl}</table></div>'


def render_preview_page_html(*, title: str, active: str, body: list[str]) -> str:
    """Full HTML document with shared site header and stylesheet."""

    parts: list[str] = [
        "<!DOCTYPE html>",
        '<html lang="de">',
        "<head>",
        '<meta charset="utf-8"/>',
        '<meta name="viewport" content="width=device-width, initial-scale=1"/>',
        f"<title>{html.escape(title)}</title>",
        "<style>",
        CSS,
        "</style>",
        "</head>",
        "<body>",
        site_header_html(active=active),
        *body,
        "</body></html>",
    ]
    return "\n".join(parts)


def render_vocab_html(cards: list[dict[str, Any]]) -> str:
    valid_cards = [c for c in cards if isinstance(c, dict) and str(c.get("head") or "").strip()]
    lektions, levels = collect_filter_options(valid_cards)

    parts: list[str] = [
        deck_controls_html(lektions, levels),
        '<div id="deck">',
    ]

    for card in valid_cards:
        head = html.escape(str(card.get("head") or "").strip())

        lektion = card.get("lektion")
        level = card.get("level")
        meta_parts = []
        if lektion is not None:
            meta_parts.append(f"Lektion {html.escape(str(lektion))}")
        if level:
            meta_parts.append(html.escape(str(level)))
        meta_html = ""
        if meta_parts:
            spans = "".join(f"<span>{p}</span>" for p in meta_parts)
            meta_html = f'<div class="meta">{spans}</div>'

        parts.append(f'<article class="card"{card_data_attrs(card)}>')
        audio_btn = pronounce_button_html(str(card.get("audio") or ""))
        if audio_btn:
            parts.append(f'<div class="head-line"><div class="head">{head}</div>{audio_btn}</div>')
        else:
            parts.append(f'<div class="head">{head}</div>')
        parts.append(meta_html)

        plural_raw = (card.get("plural") or "").strip()
        if plural_raw:
            head_plain = str(card.get("head") or "").strip()
            frag = canonicalize_plural_field(head_plain, plural_raw)
            if frag:
                lemma_only, _ipa = split_head(head_plain)
                diag = f"{lemma_only}, {frag}"
                parts.append(f'<div class="plural-diagram">{html.escape(diag)}</div>')

        for g in card.get("gloss") or []:
            if isinstance(g, str) and g.strip():
                parts.append(f'<p class="gloss">{html.escape(g.strip())}</p>')

        img_block = card_image_block_html(card)
        if img_block:
            parts.append(img_block)

        for n in card.get("notes") or []:
            if isinstance(n, str) and n.strip():
                parts.append(f'<div class="notes">{html.escape(n.strip())}</div>')

        gt_render = normalize_grammar_table(card.get("grammarTable"))
        if gt_render:
            parts.append(grammar_table_block_html(gt_render))

        examples = normalize_examples_from_card(card)
        if examples:
            parts.append('<div class="ex-block">')
            for ex in examples:
                de = (ex.get("german") or "").strip()
                en = ex.get("english")
                if not de and not en:
                    continue
                parts.append('<div class="ex-line">')
                parts.append('<span class="chevr">›</span>')
                parts.append(f'<span class="ex-de">{html.escape(de)}</span>')
                if en:
                    parts.append(" ")
                    inner = str(en).strip()
                    parts.append(f'<span class="ex-en">({html.escape(inner)})</span>')
                parts.append("</div>")
            parts.append("</div>")

        parts.append("</article>")

    parts.append("</div>")
    parts.append(
        '<footer>Static preview from vocab.manifest.json — run <code>python -m daf_vocab serve</code> to refresh.</footer>'
    )
    parts.append("<script>")
    parts.append(PRONOUNCE_JS)
    parts.append(FILTER_SORT_JS)
    parts.append("</script>")
    return render_preview_page_html(title=TITLE_PAGE, active="vocab", body=parts)


LESSON_PAGES_TITLE = "daf — lesson pages"


def render_lesson_pages_html(pages: list[tuple[str, str]]) -> str:
    items: list[str] = ['<ul class="lesson-list">']
    for label, src in pages:
        esc_label = html.escape(label)
        esc_src = html.escape(src, quote=True)
        items.extend(
            [
                '<li class="lesson-item">',
                f'<div><a href="{esc_src}" target="_blank" rel="noopener">{esc_label} — open full image</a></div>',
                f'<img src="{esc_src}" alt="{esc_label}" loading="lazy" />',
                "</li>",
            ]
        )
    items.append("</ul>")
    return render_preview_page_html(title=LESSON_PAGES_TITLE, active="lessons", body=items)


def site_header_html(*, active: str) -> str:
    """Shared top header for all preview pages."""

    vocab_cls = "is-active" if active == "vocab" else ""
    lesson_cls = "is-active" if active == "lessons" else ""
    return (
        '<header class="site-header" role="banner">'
        '<div class="site-header-row">'
        '<div class="site-brand">'
        '<img src="images/header-title.png" alt="DaF kompakt — Deutsch als Fremdsprache" />'
        "</div>"
        '<nav class="site-nav" aria-label="Preview pages">'
        f'<a class="{vocab_cls}" href="index.html">Vocabulary</a>'
        f'<a class="{lesson_cls}" href="lesson-pages.html">Lesson Pages</a>'
        "</nav>"
        "</div>"
        "</header>"
    )


def default_lesson_pages_manifest() -> list[dict[str, Any]]:
    """Fallback lesson-page structure when no manifest exists yet."""

    return [
        {
            "lektion": 1,
            "title": "Lektion 1",
            "wordPage": {
                "label": "Words page",
                "image": "/lesson-pages/kursbuch-page-16.png",
            },
            "grammarPage": {
                "label": "Grammar page",
                "image": "/lesson-pages/kursbuch-page-17.png",
            },
        }
    ]


def load_lesson_pages_manifest(repo_root: Path) -> list[dict[str, Any]]:
    """Read lesson page metadata for scalable per-lesson rendering."""

    manifest_path = repo_root / "lesson-pages.manifest.json"
    if not manifest_path.exists():
        return default_lesson_pages_manifest()
    try:
        blob = json.loads(manifest_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return default_lesson_pages_manifest()
    if not isinstance(blob, list):
        return default_lesson_pages_manifest()
    out: list[dict[str, Any]] = []
    for item in blob:
        if not isinstance(item, dict):
            continue
        lek = item.get("lektion")
        if not isinstance(lek, int):
            try:
                lek = int(lek)
            except (TypeError, ValueError):
                continue
        title = str(item.get("title") or f"Lektion {lek}").strip() or f"Lektion {lek}"
        wp = item.get("wordPage")
        gp = item.get("grammarPage")
        if not isinstance(wp, dict) or not isinstance(gp, dict):
            continue
        wp_img = str(wp.get("image") or "").strip()
        gp_img = str(gp.get("image") or "").strip()
        if not wp_img or not gp_img:
            continue
        out.append(
            {
                "lektion": lek,
                "title": title,
                "wordPage": {
                    "label": str(wp.get("label") or "Words page").strip() or "Words page",
                    "image": wp_img,
                },
                "grammarPage": {
                    "label": str(gp.get("label") or "Grammar page").strip() or "Grammar page",
                    "image": gp_img,
                },
            }
        )
    return sorted(out, key=lambda x: int(x["lektion"])) or default_lesson_pages_manifest()


def render_lesson_hub_html(lessons: list[dict[str, Any]]) -> str:
    link_items: list[str] = []
    cards: list[str] = []
    for lesson in lessons:
        title = html.escape(str(lesson.get("title") or "").strip())
        lek = html.escape(str(lesson.get("lektion")))
        wp = lesson["wordPage"]
        gp = lesson["grammarPage"]
        wp_src = html.escape(str(wp["image"]).lstrip("/"), quote=True)
        gp_src = html.escape(str(gp["image"]).lstrip("/"), quote=True)
        wp_lbl = html.escape(str(wp["label"]))
        gp_lbl = html.escape(str(gp["label"]))
        link_items.append(
            f'<li>{title}: <a href="{wp_src}" target="_blank" rel="noopener">{wp_lbl}</a> · '
            f'<a href="{gp_src}" target="_blank" rel="noopener">{gp_lbl}</a></li>'
        )
        cards.append(
            (
                '<li class="lesson-item">'
                f"<h2>{title}</h2>"
                f'<div class="meta"><span>Lektion {lek}</span></div>'
                '<div class="deck-controls-row">'
                "<div>"
                f'<div><a href="{wp_src}" target="_blank" rel="noopener">{wp_lbl} — open full image</a></div>'
                f'<img src="{wp_src}" alt="{title} words page" loading="lazy" />'
                "</div>"
                "<div>"
                f'<div><a href="{gp_src}" target="_blank" rel="noopener">{gp_lbl} — open full image</a></div>'
                f'<img src="{gp_src}" alt="{title} grammar page" loading="lazy" />'
                "</div>"
                "</div>"
                "</li>"
            )
        )
    body = [
        '<section class="lesson-links">',
        "<h2>Lesson Links</h2>",
        "<ul>",
        *link_items,
        "</ul>",
        "</section>",
        '<section class="lesson-previews">',
        '<h2 class="lesson-preview-title">Page Previews</h2>',
        '<ul class="lesson-list">',
        *cards,
        "</ul>",
        "</section>",
    ]
    return render_preview_page_html(title=LESSON_PAGES_TITLE, active="lessons", body=body)


def write_vocab_preview(
    manifest_path: Path,
    out_path: Path | None = None,
) -> Path:
    """Read manifest JSON and write ``index.html`` and ``lesson-pages.html``."""

    manifest_path = Path(manifest_path)
    if out_path is None:
        out_path = manifest_path.parent / "vocab-preview" / "index.html"
    out_path = Path(out_path)
    blob = json.loads(manifest_path.read_text(encoding="utf-8"))
    if not isinstance(blob, list):
        raise ValueError("Manifest must be a JSON array")
    html_out = render_vocab_html(blob)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(html_out, encoding="utf-8")

    # Lesson pages hub: scalable per lesson (words + grammar).
    lessons = load_lesson_pages_manifest(manifest_path.parent)
    lesson_html = render_lesson_hub_html(lessons)
    (out_path.parent / "lesson-pages.html").write_text(lesson_html, encoding="utf-8")

    # Preview is served from vocab-preview/, so copy known card images there.
    # Card image values like "/images/foo.png" map to web/public/images/foo.png.
    for card in blob:
        if not isinstance(card, dict):
            continue
        image = str(card.get("image") or "").strip()
        if image.startswith("/images/"):
            rel = image.lstrip("/")
            src = manifest_path.parent / "web" / "public" / rel
            dst = out_path.parent / rel
            if src.exists():
                dst.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(src, dst)
        audio = str(card.get("audio") or "").strip()
        if audio.startswith("/audio/"):
            rel = audio.lstrip("/")
            src = manifest_path.parent / "web" / "public" / rel
            dst = out_path.parent / rel
            if src.exists():
                dst.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(src, dst)

    # Shared header logo image.
    logo_src = manifest_path.parent / "web" / "public" / "images" / "header-title.png"
    logo_dst = out_path.parent / "images" / "header-title.png"
    if logo_src.exists():
        logo_dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(logo_src, logo_dst)

    # Copy lesson page images used by the lesson-pages hub.
    for lesson in lessons:
        for block_key in ("wordPage", "grammarPage"):
            block = lesson.get(block_key)
            if not isinstance(block, dict):
                continue
            rel_raw = str(block.get("image") or "").strip()
            if not rel_raw:
                continue
            rel = rel_raw.lstrip("/")
            src = manifest_path.parent / "web" / "public" / rel
            dst = out_path.parent / rel
            if src.exists():
                dst.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(src, dst)
    return out_path
