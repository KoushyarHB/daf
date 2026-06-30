import type { ComponentPropsWithoutRef, ReactNode } from "react";

import FieldError from "@/components/shared/atoms/FieldError";
import { cn } from "@/utils/cn";

export type LabelVariant = "form" | "modal" | "auth" | "search";

const labelVariantClasses: Record<LabelVariant, string> = {
  form: "flex flex-col gap-[0.35rem] text-[0.85rem] font-semibold text-daf-label min-w-40",
  modal: "flex flex-col gap-[0.2rem] text-[0.82rem] font-semibold text-daf-body",
  auth: "flex flex-col gap-[0.35rem] text-[0.9rem] font-semibold text-daf-label",
  search: "flex flex-col gap-[0.35rem] mb-4 max-w-[22rem] border-0 p-0 text-[0.85rem] font-semibold text-daf-label",
};

type LabelProps = ComponentPropsWithoutRef<"label"> & {
  variant?: LabelVariant;
  hint?: ReactNode;
  error?: ReactNode;
};

export default function Label({
  variant = "form",
  hint,
  error,
  children,
  className,
  ...rest
}: LabelProps) {
  return (
    <label className={cn(labelVariantClasses[variant], className)} {...rest}>
      {children}
      {hint ? (
        <span className="text-[0.75rem] font-normal leading-snug text-daf-muted">
          {hint}
        </span>
      ) : null}
      {error ? <FieldError>{error}</FieldError> : null}
    </label>
  );
}
