# -*- coding: utf-8 -*-
"""Helpers for scaling `vocab.docx` (lesson-style dictionary cards).

`vocab.docx` is canonical; use **`python -m daf_vocab sync`** to mirror it into
`vocab.manifest.json`.
Prepend new entries to the manifest, then `python -m daf_vocab build`.

CLI (repo root, same folder as `daf_vocab/`):
- **`python -m daf_vocab sync`** (canonical; docx → manifest) — or legacy `export`, or `python sync_manifest_from_docx.py`
- Edit `vocab.manifest.json` (new cards at **top** of the array)
- `python -m daf_vocab build`
- Optional: `python -m daf_vocab rebuild` (spacing/`›` only for vocab)
"""

from .docx_cards import (
    DEFAULT_LEVEL,
    DEFAULT_VOCAB_PATH,
    MANIFEST_PATH,
    build_vocab_from_manifest_file,
    export_manifest_file,
    format_example_chunks,
    normalize_card_meta,
    rebuild_vocab_layout,
    utc_now_iso,
)

__all__ = [
    "DEFAULT_LEVEL",
    "DEFAULT_VOCAB_PATH",
    "MANIFEST_PATH",
    "format_example_chunks",
    "export_manifest_file",
    "build_vocab_from_manifest_file",
    "rebuild_vocab_layout",
    "normalize_card_meta",
    "utc_now_iso",
]
