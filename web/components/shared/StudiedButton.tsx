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

const studiedBtnClass =
  "w-[1.65rem] h-[1.65rem] rounded border border-[#c8dcc0] bg-[#fafcf8] text-[#6a8f55] cursor-pointer p-0 inline-flex items-center justify-center shrink-0 leading-none transition-[background,border-color,transform] duration-150 hover:border-[#8fb86e] hover:text-[#5f8f42] hover:bg-[#f4faf0] aria-pressed:bg-[#5a9e38] aria-pressed:border-[#4a8a28] aria-pressed:text-white focus-visible:outline-2 focus-visible:outline-[rgba(74,138,40,0.45)] focus-visible:outline-offset-2 active:scale-[0.92] [&_svg]:w-[1.05rem] [&_svg]:h-[1.05rem] [&_svg]:block";

const studiedBtnListClass = "w-[1.45rem] h-[1.45rem]";

export default function StudiedButton({
  studied,
  onToggle,
  compact = false,
}: StudiedButtonProps) {
  return (
    <button
      type="button"
      className={
        compact ? `${studiedBtnClass} ${studiedBtnListClass}` : studiedBtnClass
      }
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
        <CheckCircleSolid aria-hidden="true" />
      ) : (
        <CheckCircleOutline aria-hidden="true" />
      )}
    </button>
  );
}
