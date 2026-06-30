"use client";

import { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

function useIsClient(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

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

const BTN_BASE =
  "cursor-pointer appearance-none rounded border border-transparent px-[0.85rem] py-[0.45rem] text-[0.85rem] font-semibold whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-65";

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
  const mounted = useIsClient();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-500 flex items-start justify-center overflow-y-auto bg-black/35 p-8 px-4"
      onClick={onCancel}
      role="presentation"
    >
      <div
        className="w-full max-w-[22rem] rounded-lg border border-daf-border bg-white p-[1.25rem_1.35rem_1.1rem] shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby="confirm-modal-message"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="confirm-modal-title"
          className="m-0 mb-2 border-0 p-0 text-[1.1rem] font-semibold text-daf-head"
        >
          {title}
        </h2>
        <p id="confirm-modal-message" className="m-0 mb-4 text-[0.85rem] leading-normal text-[#444]">
          {message}
        </p>
        <div className="mt-[0.35rem] flex justify-end gap-2">
          <button
            type="button"
            className={`${BTN_BASE} border-[#ddd] bg-[#f5f5f5] text-[#444]`}
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={
              danger
                ? `${BTN_BASE} border-[#8b2e2e] bg-[#a33] text-white`
                : `${BTN_BASE} border-daf-head-dark bg-daf-head text-white`
            }
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
