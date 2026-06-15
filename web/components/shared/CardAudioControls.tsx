"use client";

import PronounceButton from "@/components/shared/PronounceButton";

type CardAudioControlsProps = {
  audio: string;
  generating?: boolean;
  disabled?: boolean;
  onGenerate: () => void;
  generateLabel?: string;
};

export default function CardAudioControls({
  audio,
  generating = false,
  disabled = false,
  onGenerate,
  generateLabel = "Generate pronunciation",
}: CardAudioControlsProps) {
  const hasAudio = Boolean(audio.trim());

  return (
    <div className="card-form-audio-row">
      <button
        type="button"
        className="card-form-audio-btn"
        onClick={onGenerate}
        disabled={disabled || generating}
        title={generateLabel}
      >
        {generating
          ? "Generating…"
          : hasAudio
            ? "Regenerate audio"
            : generateLabel}
      </button>
      {hasAudio ? <PronounceButton audio={audio} compact /> : null}
    </div>
  );
}
