import type { ReactNode } from "react";

import Button from "@/components/shared/atoms/Button";
import TextLink from "@/components/shared/atoms/TextLink";
import { cn } from "@/utils/cn";

type FormActionsProps = {
  submitLabel: ReactNode;
  cancelHref?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  submitting?: boolean;
  disabled?: boolean;
  className?: string;
  submitType?: "submit" | "button";
  onSubmit?: () => void;
  order?: "cancel-first" | "submit-first";
};

/** Cancel link + primary submit — standard form footer row. */
export default function FormActions({
  submitLabel,
  cancelHref,
  cancelLabel = "Cancel",
  onCancel,
  submitting = false,
  disabled = false,
  className,
  submitType = "submit",
  onSubmit,
  order = "cancel-first",
}: FormActionsProps) {
  const cancelNode = cancelHref ? (
    <TextLink href={cancelHref} variant="cancel">
      {cancelLabel}
    </TextLink>
  ) : onCancel ? (
    <Button type="button" variant="link" size="md" onClick={onCancel}>
      {cancelLabel}
    </Button>
  ) : null;

  const submitNode = (
    <Button
      type={submitType}
      variant="primary"
      size="sm"
      className="border-0"
      disabled={disabled || submitting}
      onClick={onSubmit}
    >
      {submitLabel}
    </Button>
  );

  return (
    <div className={cn("flex gap-3 items-center mt-2", className)}>
      {order === "cancel-first" ? (
        <>
          {cancelNode}
          {submitNode}
        </>
      ) : (
        <>
          {submitNode}
          {cancelNode}
        </>
      )}
    </div>
  );
}
