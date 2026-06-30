import type { ReactNode } from "react";

import Button from "@/components/shared/atoms/Button";
import { cn } from "@/utils/cn";

type EmptyStateProps = {
  title: string;
  description: ReactNode;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
};

/** Centered empty-state card with optional CTA. */
export default function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className,
}: EmptyStateProps) {
  const hasAction = Boolean(actionLabel && (actionHref || onAction));

  return (
    <div
      className={cn(
        "my-6 mb-8 py-7 px-5 text-center bg-white border border-daf-border rounded-lg shadow-card",
        className,
      )}
      role="status"
    >
      <p className="m-0 mb-[0.45rem] text-[0.95rem] font-semibold text-daf-head">
        {title}
      </p>
      <p className="mx-auto mb-4 max-w-[22rem] text-[0.82rem] leading-normal text-daf-gray-en m-0">
        {description}
      </p>
      {hasAction && actionHref ? (
        <Button
          href={actionHref}
          variant="primary"
          size="compact"
          className="inline-block py-[0.4rem] px-[0.85rem] no-underline"
        >
          {actionLabel}
        </Button>
      ) : hasAction && onAction ? (
        <Button
          type="button"
          variant="primary"
          size="compact"
          className="inline-block py-[0.4rem] px-[0.85rem]"
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
