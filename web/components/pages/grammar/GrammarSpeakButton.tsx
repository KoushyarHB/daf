"use client";

import { PlayIcon } from "@heroicons/react/24/solid";
import { useRef, useState } from "react";

import { speakTextForHead } from "@/lib/audio/speak-text";
import { useGenerateCardAudioMutation } from "@/hooks/cards";

type GrammarSpeakButtonProps = {
  german: string;
  speakText?: string;
  audioSrc?: string;
  compact?: boolean;
};

function speakWithBrowserTts(text: string): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "de-DE";
  const voices = window.speechSynthesis.getVoices();
  const deVoice =
    voices.find((v) => v.lang.startsWith("de-DE")) ??
    voices.find((v) => v.lang.startsWith("de"));
  if (deVoice) utterance.voice = deVoice;
  window.speechSynthesis.speak(utterance);
}

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
