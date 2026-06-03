# -*- coding: utf-8 -*-
"""Generate head + example MP3s for deck cards; assign stable ``id`` + ``/audio/{id}…`` paths."""

from __future__ import annotations

import argparse
import asyncio
import json
import shutil
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
MANIFEST = REPO / "vocab.manifest.json"
AUDIO_DIR = REPO / "web" / "public" / "audio"
VOICE = "de-DE-KatjaNeural"
MIN_BYTES = 500


def _import_helpers():
    sys.path.insert(0, str(REPO))
    from daf_vocab.audio_cards import (
        assign_ids_to_deck,
        ensure_card_id,
        example_audio_url,
        head_audio_url,
        legacy_audio_slug,
        speak_text_for_head,
    )
    from daf_vocab.docx_cards import normalize_examples_from_card

    return (
        assign_ids_to_deck,
        ensure_card_id,
        example_audio_url,
        head_audio_url,
        legacy_audio_slug,
        speak_text_for_head,
        normalize_examples_from_card,
    )


async def _tts(text: str, dest: Path, voice: str) -> None:
    import edge_tts

    dest.parent.mkdir(parents=True, exist_ok=True)
    await edge_tts.Communicate(text.strip(), voice).save(str(dest))


def _should_skip(dest: Path, *, force: bool) -> bool:
    return (
        not force
        and dest.exists()
        and dest.stat().st_size > MIN_BYTES
    )


def _migrate_legacy_file(legacy: Path, dest: Path) -> bool:
    if dest.exists() or not legacy.exists():
        return False
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(legacy, dest)
    return True


async def _run_jobs(
    jobs: list[tuple[str, Path]],
    voice: str,
    *,
    force: bool,
    concurrency: int,
) -> tuple[int, int]:
    sem = asyncio.Semaphore(max(1, concurrency))
    done = 0
    skipped = 0

    async def one(text: str, dest: Path) -> None:
        nonlocal done, skipped
        if _should_skip(dest, force=force):
            skipped += 1
            return
        async with sem:
            await _tts(text, dest, voice)
            done += 1

    await asyncio.gather(*[one(t, d) for t, d in jobs])
    return done, skipped


def assign_audio(
    cards: list[dict],
    *,
    count: int | None,
    voice: str,
    force: bool,
    concurrency: int,
) -> tuple[int, int, int]:
    (
        assign_ids_to_deck,
        ensure_card_id,
        example_audio_url,
        head_audio_url,
        legacy_audio_slug,
        speak_text_for_head,
        normalize_examples_from_card,
    ) = _import_helpers()

    used: set[str] = set()
    subset = cards if count is None else cards[:count]
    jobs: list[tuple[str, Path]] = []

    for card in subset:
        if not isinstance(card, dict):
            continue
        head = str(card.get("head") or "").strip()
        if not head:
            continue
        cid = ensure_card_id(card, used)
        legacy = legacy_audio_slug(head)

        speak_head = speak_text_for_head(head)
        head_dest = AUDIO_DIR / f"{cid}.mp3"
        card["audio"] = head_audio_url(cid)
        _migrate_legacy_file(AUDIO_DIR / f"{legacy}.mp3", head_dest)
        jobs.append((speak_head, head_dest))

        examples = normalize_examples_from_card(card)
        card["examples"] = examples
        for i, ex in enumerate(examples, start=1):
            de = str(ex.get("german") or "").strip()
            if not de:
                continue
            ex_dest = AUDIO_DIR / f"{cid}-ex{i:02d}.mp3"
            ex["audio"] = example_audio_url(cid, i)
            _migrate_legacy_file(AUDIO_DIR / f"{legacy}-ex{i:02d}.mp3", ex_dest)
            jobs.append((de, ex_dest))

    generated, skipped = asyncio.run(
        _run_jobs(jobs, voice, force=force, concurrency=concurrency)
    )
    return len(subset), generated, skipped


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Assign card ids and generate pronunciation MP3s for heads + examples.",
    )
    parser.add_argument(
        "-n",
        "--count",
        type=int,
        default=0,
        help="Number of deck cards from the top (0 = entire deck)",
    )
    parser.add_argument("--voice", default=VOICE)
    parser.add_argument(
        "--force",
        action="store_true",
        help="Regenerate MP3s even when files already exist",
    )
    parser.add_argument(
        "--concurrency",
        type=int,
        default=4,
        help="Parallel TTS requests (default: 4)",
    )
    args = parser.parse_args()

    blob = json.loads(MANIFEST.read_text(encoding="utf-8"))
    if not isinstance(blob, list):
        raise SystemExit("Manifest must be a JSON array")

    count = None if args.count <= 0 else args.count
    n_cards, generated, skipped = assign_audio(
        blob,
        count=count,
        voice=args.voice,
        force=args.force,
        concurrency=args.concurrency,
    )
    MANIFEST.write_text(json.dumps(blob, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(
        f"Updated {n_cards} cards in {MANIFEST.name}: "
        f"{generated} MP3s generated, {skipped} skipped (already present)."
    )


if __name__ == "__main__":
    main()
