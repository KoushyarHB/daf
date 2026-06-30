import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/utils/cn";

type TextLinkVariant = "default" | "muted" | "cancel" | "inline" | "table";

const variantClasses: Record<TextLinkVariant, string> = {
  default:
    "font-semibold text-daf-head no-underline hover:underline",
  muted:
    "font-medium text-daf-head no-underline hover:underline hover:underline-offset-2",
  cancel: "text-[0.85rem] text-daf-head no-underline hover:underline",
  inline:
    "font-medium text-daf-head underline underline-offset-2 hover:text-daf-head-dark",
  table:
    "inline-block align-middle text-[0.82rem] font-semibold text-daf-head no-underline hover:underline",
};

type TextLinkProps = ComponentPropsWithoutRef<typeof Link> & {
  variant?: TextLinkVariant;
};

export default function TextLink({
  variant = "default",
  className,
  children,
  ...rest
}: TextLinkProps) {
  return (
    <Link className={cn(variantClasses[variant], className)} {...rest}>
      {children}
    </Link>
  );
}
