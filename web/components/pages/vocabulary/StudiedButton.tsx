"use client";

import {
  CheckCircleIcon as CheckCircleOutline,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolid } from "@heroicons/react/24/solid";

import IconButton from "@/components/shared/atoms/IconButton";

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
  return (
    <IconButton
      variant="studied"
      compact={compact}
      aria-pressed={studied}
      aria-label={studied ? "Studied — click to unmark" : "Mark as studied"}
      title={studied ? "Studied" : "Mark studied"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
    >
      {studied ? (
        <CheckCircleSolid aria-hidden="true" />
      ) : (
        <CheckCircleOutline aria-hidden="true" />
      )}
    </IconButton>
  );
}
