"use client";

import { PlayIcon } from "@heroicons/react/24/solid";
import { useRef } from "react";

import { resolveAudioSrc } from "@/lib/audio/resolve-src";

type PronounceButtonProps = {
  audio?: string;
  compact?: boolean;
};

export default function PronounceButton({
  audio,
  compact = false,
}: PronounceButtonProps) {
  const playerRef = useRef<HTMLAudioElement | null>(null);

  if (!audio?.trim()) return null;

  const src = resolveAudioSrc(audio);
  if (!src) return null;
  const cls = compact ? "pronounce-btn pronounce-btn--ex" : "pronounce-btn";

  return (
    <button
      type="button"
      className={cls}
      aria-label="Play pronunciation"
      data-audio={src}
      onClick={(e) => {
        e.preventDefault();
        if (!playerRef.current) {
          playerRef.current = new Audio();
        }
        const player = playerRef.current;
        player.pause();
        player.src = src;
        player.play().catch(() => {});
      }}
    >
      <PlayIcon aria-hidden="true" />
    </button>
  );
}
