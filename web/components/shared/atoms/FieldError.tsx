import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/utils/cn";

type FieldErrorProps = ComponentPropsWithoutRef<"span"> & {
  /** Block-level error (form root / server message). */
  block?: boolean;
  children: ReactNode;
};

/** Validation or server error text below a field or form. */
export default function FieldError({
  block = false,
  className,
  children,
  ...rest
}: FieldErrorProps) {
  if (!children) return null;

  const Tag = block ? "p" : "span";

  return (
    <Tag
      className={cn(
        "text-daf-danger font-normal m-0",
        block ? "text-[0.9rem]" : "text-[0.85rem]",
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}
