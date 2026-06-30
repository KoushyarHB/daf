import type { ComponentPropsWithoutRef } from "react";

import {
  authInputClass,
  formInputClass,
  formPlaceholderClass,
} from "@/lib/styles/formControls";
import { cn } from "@/utils/cn";

export type InputVariant = "default" | "auth" | "modal" | "table";

const variantClasses: Record<InputVariant, string> = {
  default: formInputClass,
  auth: authInputClass,
  modal:
    "rounded-md border border-daf-border-input bg-white p-2 px-[0.6rem] font-inherit text-[0.95rem] font-normal focus:border-daf-head/55 focus:shadow-daf-focus focus:outline-none",
  table:
    "py-[0.35rem] pl-2 pr-7 text-[0.85rem] min-w-36 w-full max-w-44 border border-daf-border-input rounded-md bg-daf-white font-inherit font-normal focus:outline-none focus:border-daf-head focus:shadow-daf-focus",
};

type InputProps = ComponentPropsWithoutRef<"input"> & {
  variant?: InputVariant;
  withPlaceholderStyle?: boolean;
};

export default function Input({
  variant = "default",
  withPlaceholderStyle = true,
  className,
  ...rest
}: InputProps) {
  return (
    <input
      className={cn(
        variantClasses[variant],
        withPlaceholderStyle && formPlaceholderClass,
        className,
      )}
      {...rest}
    />
  );
}
