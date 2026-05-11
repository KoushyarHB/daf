# -*- coding: utf-8 -*-
"""Helpers for scaling `vocab.docx` (lesson-style dictionary cards).

**``vocab.manifest.json`` is canonical** for deck content. Edit it directly, or
edit ``vocab.docx`` in Word and run **`python -m daf_vocab pull`** to refresh
the JSON from the saved document (metadata for known heads is merged from the
existing manifest). After JSON-only edits, run **`python -m daf_vocab sync`**
to regenerate Word.

CLI (repo root, same folder as `daf_vocab/`):
- **`python -m daf_vocab pull`** — Word → manifest (import Word edits into JSON); legacy **`export`**
- **`python -m daf_vocab sync`** — manifest → Word + normalized JSON rewrite; legacy **`build`**
- Optional: **`python -m daf_vocab serve`** (manifest → local HTML preview)
- Optional: **`python -m daf_vocab rebuild`** (spacing/`›` only, from current Word)
"""
