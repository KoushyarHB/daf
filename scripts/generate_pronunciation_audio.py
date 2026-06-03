# -*- coding: utf-8 -*-
"""Generate one pronunciation MP3 via Microsoft Edge TTS (German).

Example:
  python scripts/generate_pronunciation_audio.py herumgehen
"""

from __future__ import annotations

import argparse
import asyncio
import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
OUT_DIR = REPO / "web" / "public" / "audio"
DEFAULT_VOICE = "de-DE-KatjaNeural"


def lemma_from_text(text: str) -> str:
    s = text.strip().split("/")[0].strip()
    s = re.sub(r"\s+", " ", s)
    return s


async def _save_mp3(word: str, dest: Path, voice: str) -> None:
    import edge_tts

    dest.parent.mkdir(parents=True, exist_ok=True)
    await edge_tts.Communicate(word, voice).save(str(dest))


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description="Generate /audio/<lemma>.mp3 for vocab preview")
    parser.add_argument("text", help="Lemma or head line (IPA after / is stripped)")
    parser.add_argument("--voice", default=DEFAULT_VOICE)
    parser.add_argument(
        "--out",
        type=Path,
        default=None,
        help="Output path (default: web/public/audio/<lemma>.mp3)",
    )
    args = parser.parse_args(argv)
    lemma = lemma_from_text(args.text)
    if not lemma:
        raise SystemExit("Empty lemma.")
    dest = args.out or (OUT_DIR / f"{lemma.replace(' ', '_')}.mp3")
    try:
        asyncio.run(_save_mp3(lemma, dest, args.voice))
    except ImportError:
        print("Install: pip install edge-tts", file=sys.stderr)
        raise SystemExit(1) from None
    print(dest)


if __name__ == "__main__":
    main()
