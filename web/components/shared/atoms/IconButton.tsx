import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/utils/cn";

export type IconButtonVariant = "studied" | "play" | "dismiss";

type IconButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: IconButtonVariant;
  compact?: boolean;
  /** Square (studied) or circle (play). Dismiss ignores shape. */
  shape?: "square" | "circle";
};

const baseClass =
  "cursor-pointer p-0 inline-flex items-center justify-center shrink-0 leading-none border transition-[background,border-color,transform,opacity] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.92]";

const variantClasses: Record<IconButtonVariant, string> = {
  studied:
    "w-[1.65rem] h-[1.65rem] rounded border-daf-studied-border-soft bg-daf-studied-bg text-daf-studied-text hover:border-daf-studied-hover-border hover:text-daf-studied-hover hover:bg-daf-studied-hover-bg aria-pressed:bg-daf-studied aria-pressed:border-daf-studied-border aria-pressed:text-white focus-visible:shadow-studied-focus [&_svg]:w-[1.05rem] [&_svg]:h-[1.05rem] [&_svg]:block",
  play: "w-[1.65rem] h-[1.65rem] rounded-full border-daf-head/32 bg-daf-head-panel/95 text-daf-head hover:bg-daf-head-tint hover:border-daf-head/55 focus-visible:outline-daf-head/45 [&_svg]:w-[0.95rem] [&_svg]:h-[0.95rem] [&_svg]:block",
  dismiss:
    "h-auto w-auto border-0 bg-transparent text-[1.1rem] leading-none opacity-60 hover:opacity-100 focus-visible:outline-none active:scale-100",
};

const compactClasses: Partial<Record<IconButtonVariant, string>> = {
  studied: "w-[1.45rem] h-[1.45rem]",
  play: "w-[1.4rem] h-[1.4rem] mt-0 self-center [&_svg]:w-[0.8rem] [&_svg]:h-[0.8rem]",
};

/** Icon-only control — studied toggle, audio play, dismiss ×. */
export default function IconButton({
  variant = "play",
  compact = false,
  className,
  type = "button",
  children,
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        baseClass,
        variantClasses[variant],
        compact && compactClasses[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
