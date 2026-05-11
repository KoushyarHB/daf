# -*- coding: utf-8 -*-
"""Render ``vocab.manifest.json`` to a static HTML page for local preview in a browser."""

from __future__ import annotations

import html
import json
from pathlib import Path
from typing import Any


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
footer {
  margin-top: 2rem;
  font-size: 0.8rem;
  color: #888;
}
"""


def _split_example_chunk(chunk: str) -> tuple[str, str | None]:
    chunk = chunk.strip()
    if not chunk:
        return "", None
    if chunk.endswith(")") and " (" in chunk:
        i = chunk.rfind(" (")
        if i >= 0:
            return chunk[:i].strip(), chunk[i + 1 :].strip()
    return chunk, None


def _example_lines_from_string(s: str) -> list[tuple[str, str | None]]:
    chunks = [c.strip() for c in s.split(" / ") if c.strip()]
    return [_split_example_chunk(c) for c in chunks]


def render_vocab_html(cards: list[dict[str, Any]]) -> str:
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
    ]

    for card in cards:
        if not isinstance(card, dict):
            continue
        head = html.escape(str(card.get("head") or "").strip())
        if not head:
            continue

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

        parts.append('<article class="card">')
        parts.append(f'<div class="head">{head}</div>')
        parts.append(meta_html)

        for g in card.get("gloss") or []:
            if isinstance(g, str) and g.strip():
                parts.append(f'<p class="gloss">{html.escape(g.strip())}</p>')

        for n in card.get("notes") or []:
            if isinstance(n, str) and n.strip():
                parts.append(f'<div class="notes">{html.escape(n.strip())}</div>')

        ex_strings: list[str] = []
        units = card.get("example_units")
        if isinstance(units, list) and units:
            for pair in units:
                if (
                    isinstance(pair, (list, tuple))
                    and len(pair) >= 2
                    and isinstance(pair[0], str)
                    and isinstance(pair[1], str)
                ):
                    ex_strings.append(f"{pair[0].strip()} ({pair[1].strip()})")
        for legacy in card.get("examples") or []:
            if isinstance(legacy, str) and legacy.strip():
                ex_strings.append(legacy.strip())

        if ex_strings:
            parts.append('<div class="ex-block">')
            for raw in ex_strings:
                for de, en in _example_lines_from_string(raw):
                    if not de and not en:
                        continue
                    parts.append('<div class="ex-line">')
                    parts.append('<span class="chevr">›</span>')
                    parts.append(f'<span class="ex-de">{html.escape(de)}</span>')
                    if en:
                        parts.append(" ")
                        parts.append(f'<span class="ex-en">{html.escape(en)}</span>')
                    parts.append("</div>")
            parts.append("</div>")

        parts.append("</article>")

    parts.append(
        '<footer>Static preview from vocab.manifest.json — run <code>python -m daf_vocab serve</code> to refresh.</footer>'
    )
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
