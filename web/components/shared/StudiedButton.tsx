"use client";

import {
  CheckCircleIcon as CheckCircleOutline,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolid } from "@heroicons/react/24/solid";

type StudiedButtonProps = {
  studied: boolean;
  onToggle: () => void;
  compact?: boolean;
};

export default function StudiedButton({
  studied,
  onToggle,
  compact = false,
}: StudiedButtonProps) {
  const cls = compact ? "studied-btn studied-btn--list" : "studied-btn";

  return (
    <button
      type="button"
      className={cls}
      aria-pressed={studied}
      aria-label={
        studied ? "Studied — click to unmark" : "Mark as studied"
      }
      title={studied ? "Studied" : "Mark studied"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
    >
      {studied ? (
        <CheckCircleSolid aria-hidden="true" className="studied-svg-on" />
      ) : (
        <CheckCircleOutline aria-hidden="true" className="studied-svg-off" />
      )}
    </button>
  );
}
