# -*- coding: utf-8 -*-
"""Render ``vocab.manifest.json`` to a static HTML page for local preview in a browser."""

from __future__ import annotations

import html
import json
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
}
* { box-sizing: border-box; }
body {
  font-family: Calibri, "Segoe UI", Roboto, sans-serif;
  font-size: 11pt;
  line-height: 1.45;
  max-width: 44rem;
  margin: 0 auto;
  padding: 1.5rem 1rem 3rem;
  color: #111;
  background: #fafafa;
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
.head {
  font-weight: 700;
  margin-bottom: 0.35rem;
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


def render_vocab_html(cards: list[dict[str, Any]]) -> str:
    valid_cards = [c for c in cards if isinstance(c, dict) and str(c.get("head") or "").strip()]
    lektions, levels = collect_filter_options(valid_cards)

    parts: list[str] = [
        "<!DOCTYPE html>",
        '<html lang="de">',
        "<head>",
        '<meta charset="utf-8"/>',
        '<meta name="viewport" content="width=device-width, initial-scale=1"/>',
        f"<title>{html.escape(TITLE_PAGE)}</title>",
        "<style>",
        CSS,
        "</style>",
        "</head>",
        "<body>",
        f"<h1>{html.escape(TITLE_PAGE)}</h1>",
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
    parts.append(FILTER_SORT_JS)
    parts.append("</script>")
    parts.append("</body></html>")
    return "\n".join(parts)


def write_vocab_preview(
    manifest_path: Path,
    out_path: Path | None = None,
) -> Path:
    """Read manifest JSON and write a single HTML file."""

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
    return out_path
