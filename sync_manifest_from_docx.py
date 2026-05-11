#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Import Word edits into the canonical manifest.

Run from the repo root after saving ``vocab.docx``, so the JSON matches Word::

    python sync_manifest_from_docx.py

Equivalent to: ``python -m daf_vocab pull`` (or legacy ``export``).
"""

from __future__ import annotations

from daf_vocab.docx_cards import DEFAULT_VOCAB_PATH, MANIFEST_PATH, export_manifest_file


def main() -> None:
    out = export_manifest_file(DEFAULT_VOCAB_PATH, MANIFEST_PATH)
    print(f"Pulled manifest ← Word {DEFAULT_VOCAB_PATH} → {out}")


if __name__ == "__main__":
    main()
