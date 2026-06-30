"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useId, useState, useSyncExternalStore } from "react";
import { useForm } from "react-hook-form";
import { createPortal } from "react-dom";
import type { z } from "zod";

import { cardJsonFillFormSchema } from "@/lib/api/schemas";
import {
  manifestCardSampleJson,
  parseManifestCardJson,
  type ManifestCardFillResult,
} from "@/lib/vocab/manifest-card-fill";

type CardJsonFillModalProps = {
  open: boolean;
  initialJson: string;
  onApply: (result: ManifestCardFillResult) => void;
  onClose: () => void;
};

type JsonFillValues = z.infer<typeof cardJsonFillFormSchema>;

const BTN_BASE =
  "cursor-pointer appearance-none rounded border border-transparent px-[0.85rem] py-[0.45rem] text-[0.85rem] font-semibold whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-65";

function useIsClient(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export default function CardJsonFillModal({
  open,
  initialJson,
  onApply,
  onClose,
}: CardJsonFillModalProps) {
  const textareaId = useId();
  const mounted = useIsClient();
  const [parseError, setParseError] = useState<string | null>(null);
  const [openSnapshot, setOpenSnapshot] = useState<{
    open: boolean;
    initialJson: string;
  }>({ open, initialJson });

  const { register, handleSubmit, reset, setValue, getValues } =
    useForm<JsonFillValues>({
      resolver: zodResolver(cardJsonFillFormSchema),
      defaultValues: { jsonText: initialJson },
    });

  if (
    open &&
    (open !== openSnapshot.open || initialJson !== openSnapshot.initialJson)
  ) {
    setOpenSnapshot({ open, initialJson });
    setParseError(null);
  } else if (!open && openSnapshot.open) {
    setOpenSnapshot({ open, initialJson });
  }

  useEffect(() => {
    if (!open) return;
    reset({ jsonText: initialJson });
  }, [open, initialJson, reset]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || !mounted) return null;

  function onPasteSample() {
    setValue("jsonText", manifestCardSampleJson());
    setParseError(null);
  }

  async function onCopyJson() {
    try {
      await navigator.clipboard.writeText(getValues("jsonText"));
    } catch {
      // Clipboard may be blocked; user can still select manually.
    }
  }

  function onSubmit(values: JsonFillValues) {
    try {
      const result = parseManifestCardJson(values.jsonText);
      onApply(result);
      onClose();
    } catch (err) {
      setParseError(
        err instanceof Error ? err.message : "Could not parse JSON",
      );
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[10050] flex items-start justify-center overflow-y-auto bg-black/35 p-8 px-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="flex max-h-[min(90dvh,720px)] w-full max-w-[min(36rem,calc(100vw-2rem))] flex-col rounded-lg border border-daf-border bg-white p-5 shadow-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="card-json-fill-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="card-json-fill-title"
          className="m-0 mb-2 border-0 p-0 text-[1.1rem] font-semibold text-daf-head"
        >
          JSON fill
        </h2>
        <p className="m-0 mb-3 text-[0.8rem] leading-snug text-daf-muted">
          Paste a single card in <code>vocab.manifest.json</code> shape (one
          object, or a one-item array). Fields map to the form; review before
          saving.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
          <label
            className="mb-[0.35rem] block text-[0.85rem] font-semibold text-daf-label"
            htmlFor={textareaId}
          >
            Card JSON
          </label>
          <textarea
            id={textareaId}
            className="min-h-56 flex-1 resize-y rounded-md border border-daf-border-input bg-daf-panel-muted p-[0.65rem_0.75rem] font-mono text-[0.8rem] leading-snug focus:border-daf-head focus:shadow-daf-focus focus:outline-none"
            spellCheck={false}
            rows={16}
            {...register("jsonText", {
              onChange: () => setParseError(null),
            })}
          />

          <div className="mt-2 flex flex-wrap gap-3">
            <button
              type="button"
              className="cursor-pointer border-0 bg-transparent p-0 text-[0.8rem] font-semibold text-daf-head underline underline-offset-2 hover:text-daf-head-link"
              onClick={onPasteSample}
            >
              Insert sample
            </button>
            <button
              type="button"
              className="cursor-pointer border-0 bg-transparent p-0 text-[0.8rem] font-semibold text-daf-head underline underline-offset-2 hover:text-daf-head-link"
              onClick={() => void onCopyJson()}
            >
              Copy JSON
            </button>
          </div>

          {parseError ? (
            <p className="m-0 mt-2 text-[0.8rem] text-daf-danger">{parseError}</p>
          ) : null}

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              className={`${BTN_BASE} border-daf-border-muted bg-daf-panel-alt text-daf-body`}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`${BTN_BASE} border-daf-head-dark bg-daf-head text-white`}
            >
              Apply to form
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
