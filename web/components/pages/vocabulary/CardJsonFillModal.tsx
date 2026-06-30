"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";

import {
  formFieldsToManifestCardJson,
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

const BTN_BASE =
  "cursor-pointer appearance-none rounded border border-transparent px-[0.85rem] py-[0.45rem] text-[0.85rem] font-semibold whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-65";

export default function CardJsonFillModal({
  open,
  initialJson,
  onApply,
  onClose,
}: CardJsonFillModalProps) {
  const textareaId = useId();
  const [mounted, setMounted] = useState(false);
  const [jsonText, setJsonText] = useState(initialJson);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    setJsonText(initialJson);
    setError(null);
  }, [open, initialJson]);

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
    setJsonText(manifestCardSampleJson());
    setError(null);
  }

  async function onCopyJson() {
    try {
      await navigator.clipboard.writeText(jsonText);
    } catch {
      // Clipboard may be blocked; user can still select manually.
    }
  }

  function onApplyClick() {
    try {
      const result = parseManifestCardJson(jsonText);
      onApply(result);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not parse JSON");
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

        <label
          className="mb-[0.35rem] block text-[0.85rem] font-semibold text-daf-label"
          htmlFor={textareaId}
        >
          Card JSON
        </label>
        <textarea
          id={textareaId}
          className="min-h-56 flex-1 resize-y rounded-md border border-daf-border-input bg-daf-panel-muted p-[0.65rem_0.75rem] font-mono text-[0.8rem] leading-snug focus:border-daf-head focus:shadow-daf-focus focus:outline-none"
          value={jsonText}
          onChange={(e) => {
            setJsonText(e.target.value);
            setError(null);
          }}
          spellCheck={false}
          rows={16}
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

        {error ? (
          <p className="m-0 mt-2 text-[0.8rem] text-daf-danger">{error}</p>
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
            type="button"
            className={`${BTN_BASE} border-daf-head-dark bg-daf-head text-white`}
            onClick={onApplyClick}
          >
            Apply to form
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
