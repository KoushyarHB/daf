"use client";

import { useEffect, useId, useState } from "react";

import { useToast } from "@/components/shared/toast/ToastProvider";
import { isPristineCommunityCard } from "@/lib/vocab/card-manage";
import { VOCAB_POS_ORDER, posLabel } from "@/lib/vocab/types";
import type { EnrichedVocabCard, VocabPos } from "@/lib/vocab/types";

type CardFormModalProps = {
  mode: "create" | "edit";
  card?: EnrichedVocabCard | null;
  open: boolean;
  onClose: () => void;
  onSaved: (card: EnrichedVocabCard) => void;
};

type ExampleRow = {
  key: string;
  german: string;
  english: string;
};

type FormState = {
  head: string;
  ipa: string;
  gloss: string;
  notes: string;
  examples: ExampleRow[];
  lektion: string;
  level: string;
  pos: VocabPos;
};

let exampleKeySeq = 0;

function newExampleKey(): string {
  exampleKeySeq += 1;
  return `ex-${exampleKeySeq}`;
}

function emptyExample(): ExampleRow {
  return { key: newExampleKey(), german: "", english: "" };
}

function cardToForm(card: EnrichedVocabCard): FormState {
  const examples =
    card.examples.length > 0
      ? card.examples.map((ex) => ({
          key: newExampleKey(),
          german: ex.german ?? "",
          english: ex.english ?? "",
        }))
      : [emptyExample()];

  return {
    head: card.head,
    ipa: card.ipa ?? "",
    gloss: (card.gloss ?? []).join("\n").trim(),
    notes: (card.notes ?? []).join("\n").trim(),
    examples,
    lektion: card.lektion != null ? String(card.lektion) : "",
    level: card.level || "A1",
    pos: card.pos ?? "other",
  };
}

const emptyForm = (): FormState => ({
  head: "",
  ipa: "",
  gloss: "",
  notes: "",
  examples: [emptyExample()],
  lektion: "",
  level: "A1",
  pos: "other",
});

export default function CardFormModal({
  mode,
  card,
  open,
  onClose,
  onSaved,
}: CardFormModalProps) {
  const toast = useToast();
  const examplesLegendId = useId();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setForm(mode === "edit" && card ? cardToForm(card) : emptyForm());
  }, [open, mode, card]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  function updateExample(
    key: string,
    field: "german" | "english",
    value: string,
  ) {
    setForm((f) => ({
      ...f,
      examples: f.examples.map((ex) =>
        ex.key === key ? { ...ex, [field]: value } : ex,
      ),
    }));
  }

  function addExample() {
    setForm((f) => ({
      ...f,
      examples: [...f.examples, emptyExample()],
    }));
  }

  function removeExample(key: string) {
    setForm((f) => {
      const next = f.examples.filter((ex) => ex.key !== key);
      return {
        ...f,
        examples: next.length > 0 ? next : [emptyExample()],
      };
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const gloss = form.gloss
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const notes = form.notes
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const examples = form.examples
      .map((ex) => ({
        german: ex.german.trim(),
        english: ex.english.trim() || null,
      }))
      .filter((ex) => ex.german.length > 0);
    const lektion = form.lektion.trim()
      ? Number.parseInt(form.lektion, 10)
      : null;

    const body = {
      head: form.head.trim(),
      ipa: form.ipa.trim() || undefined,
      gloss,
      notes,
      examples,
      lektion: Number.isNaN(lektion) ? null : lektion,
      level: form.level.trim() || "A1",
      pos: form.pos,
    };

    try {
      const url =
        mode === "edit" && card
          ? `/api/cards/${encodeURIComponent(card.domId)}`
          : "/api/cards";
      const res = await fetch(url, {
        method: mode === "edit" ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(
          typeof data.error === "string" ? data.error : `Save failed (${res.status})`,
        );
      }
      const saved = (await res.json()) as EnrichedVocabCard;
      const successMessage =
        mode === "create"
          ? "Card created"
          : card && isPristineCommunityCard(card)
            ? "Personal copy saved"
            : "Card updated";
      toast.success(successMessage);
      onSaved(saved);
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Save failed";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  const title =
    mode === "create"
      ? "Add card"
      : card && isPristineCommunityCard(card)
        ? "Customize community card"
        : "Edit card";

  return (
    <div
      className="card-modal-backdrop card-modal-backdrop--form"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="card-modal card-form-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="card-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="card-form-modal__header">
          <h2 id="card-modal-title" className="card-modal-title">
            {title}
          </h2>
          {mode === "edit" && card && isPristineCommunityCard(card) ? (
            <p className="card-modal-hint">
              Saves a personal copy for you. The shared community card stays unchanged.
            </p>
          ) : null}
        </div>

        <form onSubmit={onSubmit} className="card-form-modal__form">
          <div className="card-form-modal__body card-modal-form">
            <label>
              Headword
              <input
                value={form.head}
                onChange={(e) => setForm((f) => ({ ...f, head: e.target.value }))}
                required
                placeholder="das Wort /vɔʁt/"
              />
            </label>
            <label>
              IPA
              <input
                value={form.ipa}
                onChange={(e) => setForm((f) => ({ ...f, ipa: e.target.value }))}
                placeholder="/vɔʁt/"
              />
            </label>
            <label>
              English gloss
              <span className="card-form-field-hint">
                Short flashcard answer — what the word means in English.
              </span>
              <textarea
                value={form.gloss}
                onChange={(e) => setForm((f) => ({ ...f, gloss: e.target.value }))}
                rows={2}
                placeholder="word; vocabulary item"
              />
            </label>
            <label>
              Notes
              <span className="card-form-field-hint">
                Optional — grammar, usage, or exam tips.
              </span>
              <textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                rows={2}
                placeholder="• separable verb — …"
              />
            </label>

            <fieldset
              className="card-form-examples"
              aria-labelledby={examplesLegendId}
            >
              <legend id={examplesLegendId} className="card-form-examples__legend">
                Examples
              </legend>
              <p className="card-form-field-hint card-form-examples__hint">
                German sentence plus a natural English translation for each example.
              </p>
              <ul className="card-form-examples__list">
                {form.examples.map((ex, index) => (
                  <li key={ex.key} className="card-form-example-row">
                    <div className="card-form-example-row__fields">
                      <label>
                        German
                        <input
                          value={ex.german}
                          onChange={(e) =>
                            updateExample(ex.key, "german", e.target.value)
                          }
                          placeholder="Ich lerne das Wort."
                        />
                      </label>
                      <label>
                        English
                        <input
                          value={ex.english}
                          onChange={(e) =>
                            updateExample(ex.key, "english", e.target.value)
                          }
                          placeholder="I am learning the word."
                        />
                      </label>
                    </div>
                    <button
                      type="button"
                      className="card-form-example-row__remove"
                      onClick={() => removeExample(ex.key)}
                      aria-label={`Remove example ${index + 1}`}
                      title="Remove example"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="card-form-examples__add"
                onClick={addExample}
              >
                + Add example
              </button>
            </fieldset>

            <div className="card-modal-row">
              <label>
                Lektion
                <input
                  type="number"
                  min={1}
                  value={form.lektion}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, lektion: e.target.value }))
                  }
                />
              </label>
              <label>
                Level
                <input
                  value={form.level}
                  onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))}
                />
              </label>
              <label>
                Type
                <select
                  value={form.pos}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, pos: e.target.value as VocabPos }))
                  }
                >
                  {VOCAB_POS_ORDER.map((p) => (
                    <option key={p} value={p}>
                      {posLabel(p)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="card-form-modal__footer">
            {error ? <p className="card-modal-error">{error}</p> : null}
            <div className="card-modal-actions">
              <button
                type="button"
                className="card-modal-btn-secondary"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="card-modal-btn-primary"
                disabled={saving}
              >
                {saving ? "Saving…" : mode === "create" ? "Create card" : "Save"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
