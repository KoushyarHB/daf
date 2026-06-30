import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/utils/cn";

type BadgeProps = ComponentPropsWithoutRef<"span"> & {
  variant?: "system";
};

const variantClasses = {
  system:
    "inline-block py-0.5 px-1.5 rounded-sm text-[0.72rem] font-semibold uppercase tracking-wide bg-daf-head-soft text-daf-head border border-daf-border-badge",
};

export default function Badge({
  variant = "system",
  className,
  children,
  ...rest
}: BadgeProps) {
  return (
    <span className={cn(variantClasses[variant], className)} {...rest}>
      {children}
    </span>
  );
}
