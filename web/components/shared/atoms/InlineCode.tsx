import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/utils/cn";

type InlineCodeProps = ComponentPropsWithoutRef<"code">;

/** Monospace chip for slugs, JSON keys, and inline technical values. */
export default function InlineCode({ className, children, ...rest }: InlineCodeProps) {
  return (
    <code
      className={cn(
        "rounded bg-daf-panel-alt px-1.5 py-0.5 font-mono text-xs text-daf-text",
        className,
      )}
      {...rest}
    >
      {children}
    </code>
  );
}
