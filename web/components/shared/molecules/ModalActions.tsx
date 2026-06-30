import type { ReactNode } from "react";

import Button from "@/components/shared/atoms/Button";
import { cn } from "@/utils/cn";

type ModalActionsProps = {
  onCancel: () => void;
  onConfirm?: () => void;
  confirmLabel?: ReactNode;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
  confirmType?: "button" | "submit";
  className?: string;
};

/** Standard cancel + confirm row for modals. */
export default function ModalActions({
  onCancel,
  onConfirm,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  loading = false,
  confirmType = "button",
  className,
}: ModalActionsProps) {
  return (
    <div className={cn("mt-[0.35rem] flex justify-end gap-2", className)}>
      <Button
        type="button"
        variant="secondary"
        onClick={onCancel}
        disabled={loading}
      >
        {cancelLabel}
      </Button>
      <Button
        type={confirmType}
        variant={danger ? "danger" : "primary"}
        onClick={onConfirm}
        disabled={loading}
      >
        {confirmLabel}
      </Button>
    </div>
  );
}
