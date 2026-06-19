# -*- coding: utf-8 -*-
"""Generate static MP3s for German alphabet letter names (grammar section)."""

from __future__ import annotations

import asyncio
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
OUT_DIR = REPO / "web" / "public" / "audio" / "grammar" / "alphabet"
VOICE = "de-DE-KatjaNeural"

# id -> speak text (matches web/lib/grammar/alphabet-speak.ts)
LETTERS: dict[str, str] = {
    "a": "a",
    "b": "Be",
    "c": "Tse",
    "d": "De",
    "e": "E",
    "f": "Ef",
    "g": "Ge",
    "h": "Ha",
    "i": "I",
    "j": "Jot",
    "k": "Ka",
    "l": "El",
    "m": "Em",
    "n": "En",
    "o": "O",
    "p": "Pe",
    "q": "Ku",
    "r": "Er",
    "s": "Es",
    "t": "Te",
    "u": "U",
    "v": "Fau",
    "w": "We",
    "x": "Iks",
    "y": "Ypsilon",
    "z": "Tset",
    "eszett": "Eszett",
    "ae": "Ä",
    "oe": "Ö",
    "ue": "Ü",
}


async def _generate_all() -> None:
    import edge_tts

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for letter_id, text in LETTERS.items():
        dest = OUT_DIR / f"{letter_id}.mp3"
        await edge_tts.Communicate(text, VOICE).save(str(dest))
        print(dest)


def main() -> None:
    try:
        asyncio.run(_generate_all())
    except ImportError:
        print("Install: pip install edge-tts", file=sys.stderr)
        raise SystemExit(1) from None


if __name__ == "__main__":
    main()
