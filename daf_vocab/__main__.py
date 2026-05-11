# -*- coding: utf-8 -*-
"""CLI entry: run from repo root, e.g. ``python -m daf_vocab sync``.

``sync`` (legacy ``build``) writes ``vocab.docx`` from canonical
``vocab.manifest.json``.
``pull`` (legacy ``export``) updates ``vocab.manifest.json`` from the current
``vocab.docx``. ``serve`` writes ``vocab-preview/index.html`` and starts a local
HTTP server.
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


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(prog="daf_vocab", description="DaF vocab.docx toolchain")
    sub = parser.add_subparsers(dest="cmd", required=True)

    p_pull = sub.add_parser(
        "pull",
        aliases=["export"],
        help="Pull vocab.docx → vocab.manifest.json (import Word into canonical JSON)",
    )
    p_pull.add_argument(
        "--docx",
        type=Path,
        default=DEFAULT_VOCAB_PATH,
        help=f"Word file to read (default: {DEFAULT_VOCAB_PATH})",
    )
    p_pull.add_argument(
        "--manifest",
        type=Path,
        default=MANIFEST_PATH,
        help=f"Canonical JSON output (default: {MANIFEST_PATH})",
    )

    p_sync = sub.add_parser(
        "sync",
        aliases=["build"],
        help="Sync vocab.manifest.json → vocab.docx (render Word from canonical JSON)",
    )
    p_sync.add_argument(
        "--manifest",
        type=Path,
        default=MANIFEST_PATH,
        help=f"JSON input (default: {MANIFEST_PATH})",
    )
    p_sync.add_argument(
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
        help="Do not open the system browser automatically",
    )

    args = parser.parse_args(argv)

    if args.cmd in ("pull", "export"):
        out = export_manifest_file(Path(args.docx), Path(args.manifest))
        print(f"Pulled manifest ← Word {args.docx} → {out}")
    elif args.cmd in ("sync", "build"):
        out = build_vocab_from_manifest_file(Path(args.manifest), Path(args.docx))
        print(f"Synced Word ← manifest {args.manifest} → {out}")
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
