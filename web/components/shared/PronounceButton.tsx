"use client";

import { PlayIcon } from "@heroicons/react/24/solid";
import { useRef } from "react";

import { resolveAudioSrc } from "@/lib/audio/resolve-src";

type PronounceButtonProps = {
  audio?: string;
  compact?: boolean;
};

const pronounceBtnClass =
  "w-[1.65rem] h-[1.65rem] rounded-full border border-daf-head/32 bg-daf-head-panel/95 text-daf-head cursor-pointer p-0 inline-flex items-center justify-center shrink-0 leading-none transition-[background,border-color,transform] duration-150 hover:bg-daf-head-tint hover:border-daf-head/55 focus-visible:outline-2 focus-visible:outline-daf-head/45 focus-visible:outline-offset-2 active:scale-[0.92] [&_svg]:w-[0.95rem] [&_svg]:h-[0.95rem] [&_svg]:block";

const pronounceBtnCompactClass =
  "w-[1.4rem] h-[1.4rem] mt-0 shrink-0 self-center [&_svg]:w-[0.8rem] [&_svg]:h-[0.8rem]";

export default function PronounceButton({
  audio,
  compact = false,
}: PronounceButtonProps) {
  const playerRef = useRef<HTMLAudioElement | null>(null);

  if (!audio?.trim()) return null;

  const src = resolveAudioSrc(audio);
  if (!src) return null;

  return (
    <button
      type="button"
      className={
        compact ? `${pronounceBtnClass} ${pronounceBtnCompactClass}` : pronounceBtnClass
      }
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
