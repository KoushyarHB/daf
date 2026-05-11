# -*- coding: utf-8 -*-
"""CLI entry: run from repo root, e.g. ``python -m daf_vocab manual-edit-from-manifest``.

``manual-edit-from-manifest`` (legacy ``sync``, ``build``) writes ``vocab.docx``
from canonical ``vocab.manifest.json``.
``manual-edit-from-docx`` (legacy ``pull``, ``export``) updates
``vocab.manifest.json`` from the current ``vocab.docx``.
``serve`` writes ``vocab-preview/index.html`` and starts a local HTTP server.
"""

from __future__ import annotations

import argparse
import subprocess
import sys
import webbrowser
from pathlib import Path

from .docx_cards import (
    MANIFEST_PATH,
    DEFAULT_VOCAB_PATH,
    build_vocab_from_manifest_file,
    export_manifest_file,
    rebuild_vocab_layout,
)

from .html_preview import write_vocab_preview


CMD_FROM_DOCX = "manual-edit-from-docx"
CMD_FROM_MANIFEST = "manual-edit-from-manifest"


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(prog="daf_vocab", description="DaF vocab.docx toolchain")
    sub = parser.add_subparsers(dest="cmd", required=True)

    p_from_docx = sub.add_parser(
        CMD_FROM_DOCX,
        aliases=["pull", "export"],
        help="Import vocab.docx → vocab.manifest.json (manual Word edits → canonical JSON)",
    )
    p_from_docx.add_argument(
        "--docx",
        type=Path,
        default=DEFAULT_VOCAB_PATH,
        help=f"Word file to read (default: {DEFAULT_VOCAB_PATH})",
    )
    p_from_docx.add_argument(
        "--manifest",
        type=Path,
        default=MANIFEST_PATH,
        help=f"Canonical JSON output (default: {MANIFEST_PATH})",
    )

    p_from_manifest = sub.add_parser(
        CMD_FROM_MANIFEST,
        aliases=["sync", "build"],
        help="Render vocab.manifest.json → vocab.docx (manual manifest edits → Word)",
    )
    p_from_manifest.add_argument(
        "--manifest",
        type=Path,
        default=MANIFEST_PATH,
        help=f"JSON input (default: {MANIFEST_PATH})",
    )
    p_from_manifest.add_argument(
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

    p_serve = sub.add_parser(
        "serve",
        help="Write vocab-preview/index.html from the manifest and start a local web server",
    )
    p_serve.add_argument(
        "--manifest",
        type=Path,
        default=MANIFEST_PATH,
        help=f"JSON input (default: {MANIFEST_PATH})",
    )
    p_serve.add_argument(
        "--out",
        type=Path,
        default=None,
        help="HTML output file (default: <repo>/vocab-preview/index.html)",
    )
    p_serve.add_argument("--port", type=int, default=8765, help="Port for http.server (default: 8765)")
    p_serve.add_argument(
        "--no-browser",
        action="store_true",
        dest="no_browser",
        help="Do not open the system browser automatically",
    )

    args = parser.parse_args(argv)

    docx_cmds = (CMD_FROM_DOCX, "pull", "export")
    manifest_cmds = (CMD_FROM_MANIFEST, "sync", "build")

    if args.cmd in docx_cmds:
        out = export_manifest_file(Path(args.docx), Path(args.manifest))
        print(f"Updated manifest ← Word {args.docx} → {out}")
    elif args.cmd in manifest_cmds:
        out = build_vocab_from_manifest_file(Path(args.manifest), Path(args.docx))
        print(f"Updated Word ← manifest {args.manifest} → {out}")
    elif args.cmd == "rebuild":
        out = rebuild_vocab_layout(Path(args.docx))
        print(out)
    elif args.cmd == "serve":
        html_path = write_vocab_preview(Path(args.manifest), Path(args.out) if args.out else None)
        preview_dir = html_path.parent
        url = f"http://127.0.0.1:{args.port}/"
        if not args.no_browser:
            webbrowser.open(url)
        print(f"Preview written → {html_path}")
        print(f"Open: {url}")
        print("Press Ctrl+C to stop the server.")
        try:
            subprocess.run(
                [
                    sys.executable,
                    "-m",
                    "http.server",
                    str(args.port),
                    "--directory",
                    str(preview_dir),
                ],
            )
        except KeyboardInterrupt:
            pass


if __name__ == "__main__":
    main()
