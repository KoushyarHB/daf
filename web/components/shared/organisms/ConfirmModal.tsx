"use client";

import ModalActions from "@/components/shared/molecules/ModalActions";
import ModalShell from "@/components/shared/molecules/ModalShell";

type ConfirmModalProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <ModalShell
      open={open}
      onClose={onCancel}
      title={title}
      titleId="confirm-modal-title"
      descriptionId="confirm-modal-message"
      role="alertdialog"
    >
      <p
        id="confirm-modal-message"
        className="m-0 mb-4 text-[0.85rem] leading-normal text-daf-body"
      >
        {message}
      </p>
      <ModalActions
        onCancel={onCancel}
        onConfirm={onConfirm}
        confirmLabel={confirmLabel}
        cancelLabel={cancelLabel}
        danger={danger}
        loading={loading}
      />
    </ModalShell>
  );
}
