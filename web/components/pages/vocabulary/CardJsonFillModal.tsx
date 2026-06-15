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
      className="card-modal-backdrop card-json-fill-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="card-modal card-json-fill-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="card-json-fill-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="card-json-fill-title" className="card-modal-title">
          JSON fill
        </h2>
        <p className="card-modal-hint">
          Paste a single card in <code>vocab.manifest.json</code> shape (one
          object, or a one-item array). Fields map to the form; review before
          saving.
        </p>

        <label className="card-json-fill-modal__label" htmlFor={textareaId}>
          Card JSON
        </label>
        <textarea
          id={textareaId}
          className="card-json-fill-modal__textarea"
          value={jsonText}
          onChange={(e) => {
            setJsonText(e.target.value);
            setError(null);
          }}
          spellCheck={false}
          rows={16}
        />

        <div className="card-json-fill-modal__toolbar">
          <button
            type="button"
            className="card-json-fill-modal__link-btn"
            onClick={onPasteSample}
          >
            Insert sample
          </button>
          <button
            type="button"
            className="card-json-fill-modal__link-btn"
            onClick={() => void onCopyJson()}
          >
            Copy JSON
          </button>
        </div>

        {error ? <p className="card-modal-error">{error}</p> : null}

        <div className="card-modal-actions card-json-fill-modal__actions">
          <button
            type="button"
            className="card-modal-btn-secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="card-modal-btn-primary"
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
