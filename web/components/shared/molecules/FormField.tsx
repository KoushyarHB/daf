import type { ReactNode } from "react";

import Label from "@/components/shared/atoms/Label";

type FormFieldProps = {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  children: ReactNode;
  variant?: "form" | "modal" | "auth" | "search";
  htmlFor?: string;
  className?: string;
};

/** Label + control + optional hint/error — use with Input, Select, or Textarea as child. */
export default function FormField({
  label,
  hint,
  error,
  children,
  variant = "form",
  htmlFor,
  className,
}: FormFieldProps) {
  return (
    <Label variant={variant} htmlFor={htmlFor} hint={hint} error={error} className={className}>
      {label}
      {children}
    </Label>
  );
}
