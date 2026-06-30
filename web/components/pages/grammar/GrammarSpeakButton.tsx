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
  const cls = compact ? "grammar-speak-btn" : "grammar-speak-btn grammar-speak-btn--lg";

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
