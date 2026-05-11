# -*- coding: utf-8 -*-
"""Helpers for scaling `vocab.docx` (lesson-style dictionary cards).

**``vocab.manifest.json`` is canonical** for deck content. Edit it directly, or
edit ``vocab.docx`` in Word and run **`python -m daf_vocab sync`** to refresh
the JSON from the saved document (metadata for known heads is merged from the
existing manifest). After JSON-only edits, run **`python -m daf_vocab build`**
to regenerate Word.

CLI (repo root, same folder as `daf_vocab/`):
- **`python -m daf_vocab sync`** — Word → manifest (import your Word edits into JSON)
- Edit `vocab.manifest.json` (new cards at **top** of the array)
- **`python -m daf_vocab build`** — manifest → Word + normalized JSON rewrite
- Optional: **`python -m daf_vocab serve`** (manifest → local HTML preview)
- Optional: **`python -m daf_vocab rebuild`** (spacing/`›` only, from current Word)
"""

from .docx_cards import (
    DEFAULT_LEVEL,
    DEFAULT_VOCAB_PATH,
    MANIFEST_PATH,
    build_vocab_from_manifest_file,
    export_manifest_file,
    format_example_chunks,
    normalize_card_meta,
    normalize_examples_from_card,
    rebuild_vocab_layout,
    utc_now_iso,
)
from .html_preview import render_vocab_html, write_vocab_preview

__all__ = [
    "DEFAULT_LEVEL",
    "DEFAULT_VOCAB_PATH",
    "MANIFEST_PATH",
    "format_example_chunks",
    "export_manifest_file",
    "build_vocab_from_manifest_file",
    "rebuild_vocab_layout",
    "normalize_card_meta",
    "normalize_examples_from_card",
    "utc_now_iso",
    "render_vocab_html",
    "write_vocab_preview",
]
