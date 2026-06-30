import type { ReactNode } from "react";

import { cn } from "@/utils/cn";

type HintBannerProps = {
  children: ReactNode;
  className?: string;
};

/** Left-bordered hint / status line (deck filters, sign-in prompts). */
export default function HintBanner({ children, className }: HintBannerProps) {
  return (
    <p
      className={cn(
        "mb-[0.85rem] py-[0.45rem] pl-2.5 pr-0 text-[0.78rem] leading-normal text-daf-gray-en border-l-2 border-daf-border m-0",
        className,
      )}
    >
      {children}
    </p>
  );
}
