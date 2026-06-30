import type { ReactNode } from "react";

import Button from "@/components/shared/atoms/Button";
import { cn } from "@/utils/cn";

type PageHeaderProps = {
  title: ReactNode;
  action?: ReactNode;
  actionHref?: string;
  actionLabel?: string;
  className?: string;
  titleClassName?: string;
};

/** Page title row with optional primary action link. */
export default function PageHeader({
  title,
  action,
  actionHref,
  actionLabel,
  className,
  titleClassName,
}: PageHeaderProps) {
  const actionNode =
    action ??
    (actionHref && actionLabel ? (
      <Button href={actionHref} variant="primary" size="sm" className="no-underline py-1.5 px-2.5">
        {actionLabel}
      </Button>
    ) : null);

  return (
    <div className={cn("flex items-center justify-between gap-4 mb-2", className)}>
      <h1 className={titleClassName ?? "m-0 text-[1.35rem] text-daf-head"}>
        {title}
      </h1>
      {actionNode}
    </div>
  );
}
