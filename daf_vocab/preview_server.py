# -*- coding: utf-8 -*-
"""Local preview HTTP server: static ``vocab-preview/`` plus studied-flag API."""

from __future__ import annotations

import json
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any

from .docx_cards import set_card_studied_flag


def run_preview_server(*, directory: Path, manifest_path: Path, port: int, host: str = "127.0.0.1") -> None:
    preview_dir = Path(directory).resolve()
    manifest = Path(manifest_path).resolve()

    class PreviewHTTPRequestHandler(SimpleHTTPRequestHandler):
        manifest_path = manifest

        def __init__(self, *args: Any, **kwargs: Any) -> None:
            super().__init__(*args, directory=str(preview_dir), **kwargs)

        def do_POST(self) -> None:  # noqa: N802
            if self.path.split("?", 1)[0] != "/api/vocab/studied":
                self.send_error(HTTPStatus.NOT_FOUND)
                return
            length = int(self.headers.get("Content-Length") or 0)
            try:
                raw = self.rfile.read(length) if length else b"{}"
                body: dict[str, Any] = json.loads(raw.decode("utf-8"))
            except (json.JSONDecodeError, UnicodeDecodeError):
                self.send_error(HTTPStatus.BAD_REQUEST, "Invalid JSON")
                return
            card_id = str(body.get("id") or "").strip()
            if not card_id or "studied" not in body:
                self.send_error(HTTPStatus.BAD_REQUEST, "Expected id and studied")
                return
            studied = bool(body.get("studied"))
            if set_card_studied_flag(self.manifest_path, card_id, studied):
                self.send_response(HTTPStatus.NO_CONTENT)
                self.end_headers()
                return
            self.send_error(HTTPStatus.NOT_FOUND, "Card not found")

        def log_message(self, format: str, *args: Any) -> None:
            if args and str(args[0]).startswith("POST /api/vocab/studied"):
                super().log_message(format, *args)

    server = ThreadingHTTPServer((host, port), PreviewHTTPRequestHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
