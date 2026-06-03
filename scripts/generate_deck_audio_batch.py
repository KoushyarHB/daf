# -*- coding: utf-8 -*-
"""Generate head + example MP3s for the first N deck cards; update vocab.manifest.json."""

from __future__ import annotations

import argparse
import asyncio
import json
import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
MANIFEST = REPO / "vocab.manifest.json"
AUDIO_DIR = REPO / "web" / "public" / "audio"
VOICE = "de-DE-KatjaNeural"


def _import_split_head():
    sys.path.insert(0, str(REPO))
    from daf_vocab.docx_cards import split_head

    return split_head


def audio_slug(head: str) -> str:
    split_head = _import_split_head()
    lemma, _ = split_head(head.strip())
    s = lemma.replace("!", "").replace("?", "").strip()
    s = re.sub(r"\s*/\s*", "_", s)
    s = re.sub(r"[^\wäöüÄÖÜß]+", "_", s)
    s = re.sub(r"_+", "_", s).strip("_")
    return s or "card"


async def _tts(text: str, dest: Path, voice: str) -> None:
    import edge_tts

    dest.parent.mkdir(parents=True, exist_ok=True)
    await edge_tts.Communicate(text.strip(), voice).save(str(dest))


async def _run_batch(jobs: list[tuple[str, Path]], voice: str) -> None:
    for text, dest in jobs:
        if dest.exists() and dest.stat().st_size > 500:
            continue
        await _tts(text, dest, voice)


def assign_audio(cards: list[dict], count: int, voice: str) -> None:
    split_head = _import_split_head()
    jobs: list[tuple[str, Path]] = []

    for card in cards[:count]:
        if not isinstance(card, dict):
            continue
        head = str(card.get("head") or "").strip()
        if not head:
            continue
        slug = audio_slug(head)
        lemma, _ = split_head(head)
        speak_head = lemma.strip() or head.split("/")[0].strip()

        head_rel = f"/audio/{slug}.mp3"
        card["audio"] = head_rel
        jobs.append((speak_head, AUDIO_DIR / f"{slug}.mp3"))

        examples = card.get("examples") or []
        if not isinstance(examples, list):
            continue
        for i, ex in enumerate(examples, start=1):
            if not isinstance(ex, dict):
                continue
            de = str(ex.get("german") or "").strip()
            if not de:
                continue
            ex_rel = f"/audio/{slug}-ex{i:02d}.mp3"
            ex["audio"] = ex_rel
            jobs.append((de, AUDIO_DIR / f"{slug}-ex{i:02d}.mp3"))

    asyncio.run(_run_batch(jobs, voice))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("-n", "--count", type=int, default=10)
    parser.add_argument("--voice", default=VOICE)
    args = parser.parse_args()

    blob = json.loads(MANIFEST.read_text(encoding="utf-8"))
    if not isinstance(blob, list):
        raise SystemExit("Manifest must be a JSON array")
    assign_audio(blob, args.count, args.voice)
    MANIFEST.write_text(json.dumps(blob, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Updated {args.count} cards in {MANIFEST}")


if __name__ == "__main__":
    main()
