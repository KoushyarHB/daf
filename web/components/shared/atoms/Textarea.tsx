import type { ComponentPropsWithoutRef } from "react";

import { formPlaceholderClass } from "@/lib/styles/formControls";
import { cn } from "@/utils/cn";

type TextareaProps = ComponentPropsWithoutRef<"textarea"> & {
  variant?: "default" | "modal" | "mono";
  withPlaceholderStyle?: boolean;
};

const variantClasses = {
  default:
    "font-inherit font-normal py-2 px-2.5 border border-daf-border-input rounded-md bg-daf-white text-daf-ink resize-y transition-[border-color,box-shadow] duration-150 focus:outline-none focus:border-daf-head focus:shadow-daf-focus",
  modal:
    "rounded-md border border-daf-border-input bg-daf-white p-2 px-[0.6rem] font-inherit text-[0.95rem] font-normal min-h-[3.25rem] resize-y focus:border-daf-head/55 focus:shadow-daf-focus focus:outline-none",
  mono:
    "min-h-56 flex-1 resize-y rounded-md border border-daf-border-input bg-daf-panel-muted p-[0.65rem_0.75rem] font-mono text-[0.8rem] leading-snug focus:border-daf-head focus:shadow-daf-focus focus:outline-none",
};

export default function Textarea({
  variant = "default",
  withPlaceholderStyle = true,
  className,
  ...rest
}: TextareaProps) {
  return (
    <textarea
      className={cn(
        variantClasses[variant],
        withPlaceholderStyle && formPlaceholderClass,
        className,
      )}
      {...rest}
    />
  );
}
