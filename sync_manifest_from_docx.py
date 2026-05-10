#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Snapshot ``vocab.manifest.json`` from ``vocab.docx`` (canonical source).

Run from the repo root before editing the JSON in an automated pass, so the
manifest matches what you last saved in Word::

    python sync_manifest_from_docx.py

Equivalent to: ``python -m daf_vocab sync`` (or legacy ``export``).
"""

from __future__ import annotations

from daf_vocab.docx_cards import DEFAULT_VOCAB_PATH, MANIFEST_PATH, export_manifest_file


def main() -> None:
    out = export_manifest_file(DEFAULT_VOCAB_PATH, MANIFEST_PATH)
    print(f"Synced manifest from {DEFAULT_VOCAB_PATH} → {out}")


if __name__ == "__main__":
    main()
