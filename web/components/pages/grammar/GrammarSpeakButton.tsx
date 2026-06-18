"use client";

import { PlayIcon } from "@heroicons/react/24/solid";
import { useRef, useState } from "react";

import { speakTextForHead } from "@/lib/audio/speak-text";

type GrammarSpeakButtonProps = {
  german: string;
  speakText?: string;
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
  compact = true,
}: GrammarSpeakButtonProps) {
  const playerRef = useRef<HTMLAudioElement | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const speakText =
    speakTextOverride?.trim() ||
    speakTextForHead(german) ||
    german.trim();
  const cls = compact ? "grammar-speak-btn" : "grammar-speak-btn grammar-speak-btn--lg";

  async function play() {
    if (!speakText || busy) return;

    if (audioUrl) {
      if (!playerRef.current) playerRef.current = new Audio();
      const player = playerRef.current;
      player.pause();
      player.src = audioUrl;
      void player.play().catch(() => speakWithBrowserTts(speakText));
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/cards/generate-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: speakText }),
      });
      if (res.ok) {
        const data = (await res.json()) as { audio?: string };
        if (data.audio) {
          setAudioUrl(data.audio);
          if (!playerRef.current) playerRef.current = new Audio();
          const player = playerRef.current;
          player.src = data.audio;
          void player.play().catch(() => speakWithBrowserTts(speakText));
          return;
        }
      }
    } catch {
      // fall through to browser TTS
    } finally {
      setBusy(false);
    }

    speakWithBrowserTts(speakText);
  }

  return (
    <button
      type="button"
      className={cls}
      aria-label={`Play pronunciation of ${german}`}
      disabled={busy}
      onClick={(e) => {
        e.preventDefault();
        void play();
      }}
    >
      <PlayIcon aria-hidden="true" />
    </button>
  );
}
