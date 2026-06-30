"use client";

import { PlayIcon } from "@heroicons/react/24/solid";
import { useRef, useState } from "react";

import { speakTextForHead } from "@/lib/audio/speak-text";
import { useGenerateCardAudioMutation } from "@/hooks/cards";
import { speakWithBrowserTts } from "@/utils/speakWithBrowserTts";

type GrammarSpeakButtonProps = {
  german: string;
  speakText?: string;
  audioSrc?: string;
  compact?: boolean;
};

const BTN_BASE =
  "inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full border border-daf-head/25 bg-white p-0 text-daf-blue transition-[background,border-color,transform] duration-150 hover:border-daf-head/45 hover:bg-[#eef4fb] active:scale-[0.94] disabled:cursor-wait disabled:opacity-55 [&_svg]:ml-px";

export default function GrammarSpeakButton({
  german,
  speakText: speakTextOverride,
  audioSrc,
  compact = true,
}: GrammarSpeakButtonProps) {
  const playerRef = useRef<HTMLAudioElement | null>(null);
  const generateAudio = useGenerateCardAudioMutation();
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const speakText =
    speakTextOverride?.trim() ||
    speakTextForHead(german) ||
    german.trim();
  const cls = compact
    ? `${BTN_BASE} h-[1.35rem] w-[1.35rem] [&_svg]:h-[0.58rem] [&_svg]:w-[0.58rem]`
    : `${BTN_BASE} h-8 w-8 [&_svg]:h-[0.85rem] [&_svg]:w-[0.85rem]`;

  async function play() {
    if (!speakText || generateAudio.isPending) return;

    if (audioSrc) {
      if (!playerRef.current) playerRef.current = new Audio();
      const player = playerRef.current;
      player.pause();
      player.src = audioSrc;
      try {
        await player.play();
        return;
      } catch {
        // fall through to generated / browser TTS
      }
    }

    if (audioUrl) {
      if (!playerRef.current) playerRef.current = new Audio();
      const player = playerRef.current;
      player.pause();
      player.src = audioUrl;
      void player.play().catch(() => speakWithBrowserTts(speakText));
      return;
    }

    try {
      const data = await generateAudio.mutateAsync({ text: speakText });
      if (data.audio) {
        setAudioUrl(data.audio);
        if (!playerRef.current) playerRef.current = new Audio();
        const player = playerRef.current;
        player.src = data.audio;
        void player.play().catch(() => speakWithBrowserTts(speakText));
        return;
      }
    } catch {
      // fall through to browser TTS
    }

    speakWithBrowserTts(speakText);
  }

  return (
    <button
      type="button"
      className={cls}
      aria-label={`Play pronunciation of ${german}`}
      disabled={generateAudio.isPending}
      onClick={(e) => {
        e.preventDefault();
        void play();
      }}
    >
      <PlayIcon aria-hidden="true" />
    </button>
  );
}
