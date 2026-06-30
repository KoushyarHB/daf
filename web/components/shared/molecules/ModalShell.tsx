"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { useIsClient } from "@/hooks/useIsClient";
import { cn } from "@/utils/cn";

type ModalShellProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  titleId?: string;
  descriptionId?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "lg" | "fullscreen";
  role?: "dialog" | "alertdialog";
};

const panelSizeClasses = {
  sm: "w-full max-w-[22rem] rounded-lg border border-daf-border bg-daf-white p-[1.25rem_1.35rem_1.1rem] shadow-modal",
  lg: "w-full max-w-lg rounded-lg border border-daf-border bg-daf-white p-[1.25rem_1.35rem_1.1rem] shadow-modal",
  fullscreen:
    "m-0 flex h-dvh max-h-dvh w-full max-w-site flex-col overflow-hidden rounded-none border-0 border-x border-daf-border bg-white shadow-modal-lg",
};

/** Portal overlay + panel — body scroll lock included. */
export default function ModalShell({
  open,
  onClose,
  title,
  titleId = "modal-title",
  descriptionId,
  children,
  footer,
  size = "sm",
  role = "dialog",
}: ModalShellProps) {
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

  const isFullscreen = size === "fullscreen";

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-500 flex justify-center overflow-hidden overscroll-contain bg-black/35",
        isFullscreen ? "items-stretch p-0" : "items-start overflow-y-auto p-8 px-4",
      )}
      onClick={onClose}
      role="presentation"
    >
      <div
        className={panelSizeClasses[size]}
        role={role}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        onClick={(e) => e.stopPropagation()}
      >
        {!isFullscreen ? (
          <h2
            id={titleId}
            className="m-0 mb-2 border-0 p-0 text-[1.1rem] font-semibold text-daf-head"
          >
            {title}
          </h2>
        ) : null}
        {children}
        {footer}
      </div>
    </div>,
    document.body,
  );
}
