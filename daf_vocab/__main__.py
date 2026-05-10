# -*- coding: utf-8 -*-
"""CLI entry: run from repo root, e.g. ``python -m daf_vocab sync``.

``sync`` (and legacy ``export``) writes ``vocab.manifest.json`` from the
canonical ``vocab.docx``.
"""

from __future__ import annotations

import argparse
from pathlib import Path

from .docx_cards import (
    MANIFEST_PATH,
    DEFAULT_VOCAB_PATH,
    build_vocab_from_manifest_file,
    export_manifest_file,
    rebuild_vocab_layout,
)


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(prog="daf_vocab", description="DaF vocab.docx toolchain")
    sub = parser.add_subparsers(dest="cmd", required=True)

    p_export = sub.add_parser("export", help="Legacy alias: same as ``sync`` (docx → manifest)")
    p_export.add_argument(
        "--docx",
        type=Path,
        default=DEFAULT_VOCAB_PATH,
        help=f"Word file (default: {DEFAULT_VOCAB_PATH})",
    )
    p_export.add_argument(
        "--manifest",
        type=Path,
        default=MANIFEST_PATH,
        help=f"JSON output (default: {MANIFEST_PATH})",
    )

    p_sync = sub.add_parser(
        "sync",
        help="Copy vocab.docx → vocab.manifest.json (Word is the source of truth)",
    )
    p_sync.add_argument(
        "--docx",
        type=Path,
        default=DEFAULT_VOCAB_PATH,
        help=f"Word file (canonical source; default: {DEFAULT_VOCAB_PATH})",
    )
    p_sync.add_argument(
        "--manifest",
        type=Path,
        default=MANIFEST_PATH,
        help=f"JSON mirror to write (default: {MANIFEST_PATH})",
    )

    p_build = sub.add_parser("build", help="Rebuild vocab.docx from vocab.manifest.json")
    p_build.add_argument(
        "--manifest",
        type=Path,
        default=MANIFEST_PATH,
        help=f"JSON input (default: {MANIFEST_PATH})",
    )
    p_build.add_argument(
        "--docx",
        type=Path,
        default=DEFAULT_VOCAB_PATH,
        help=f"Word output (default: {DEFAULT_VOCAB_PATH})",
    )

    p_rel = sub.add_parser("rebuild", help="Re-layout vocab.docx spacing/› (no manifest edit)")
    p_rel.add_argument(
        "--docx",
        type=Path,
        default=DEFAULT_VOCAB_PATH,
        help=f"Word file (default: {DEFAULT_VOCAB_PATH})",
    )

    args = parser.parse_args(argv)

    if args.cmd in ("export", "sync"):
        out = export_manifest_file(Path(args.docx), Path(args.manifest))
        if args.cmd == "sync":
            print(f"Synced manifest ← canonical {args.docx} → {out}")
        else:
            print(f"Wrote manifest → {out}")
    elif args.cmd == "build":
        out = build_vocab_from_manifest_file(Path(args.manifest), Path(args.docx))
        print(f"Built vocabulary → {out}")
    elif args.cmd == "rebuild":
        out = rebuild_vocab_layout(Path(args.docx))
        print(out)


if __name__ == "__main__":
    main()
