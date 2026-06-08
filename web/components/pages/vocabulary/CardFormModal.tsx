"use client";

import { useEffect, useState } from "react";

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

type FormState = {
  head: string;
  ipa: string;
  glossText: string;
  notesText: string;
  lektion: string;
  level: string;
  pos: VocabPos;
};

function cardToForm(card: EnrichedVocabCard): FormState {
  return {
    head: card.head,
    ipa: card.ipa ?? "",
    glossText: (card.gloss ?? []).join("\n"),
    notesText: (card.notes ?? []).join("\n"),
    lektion: card.lektion != null ? String(card.lektion) : "",
    level: card.level || "A1",
    pos: card.pos ?? "other",
  };
}

const emptyForm = (): FormState => ({
  head: "",
  ipa: "",
  glossText: "",
  notesText: "",
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
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setForm(mode === "edit" && card ? cardToForm(card) : emptyForm());
  }, [open, mode, card]);

  if (!open) return null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const gloss = form.glossText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const notes = form.notesText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const lektion = form.lektion.trim()
      ? Number.parseInt(form.lektion, 10)
      : null;

    const body = {
      head: form.head.trim(),
      ipa: form.ipa.trim() || undefined,
      gloss,
      notes,
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
        <h2 id="card-modal-title" className="card-modal-title">
          {title}
        </h2>
        {mode === "edit" && card && isPristineCommunityCard(card) ? (
          <p className="card-modal-hint">
            Saves a personal copy for you. The shared community card stays unchanged.
          </p>
        ) : null}
        <form onSubmit={onSubmit} className="card-modal-form">
          <label>
            Headword *
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
            Gloss (one line each)
            <textarea
              value={form.glossText}
              onChange={(e) => setForm((f) => ({ ...f, glossText: e.target.value }))}
              rows={3}
            />
          </label>
          <label>
            Notes (one line each)
            <textarea
              value={form.notesText}
              onChange={(e) => setForm((f) => ({ ...f, notesText: e.target.value }))}
              rows={2}
            />
          </label>
          <div className="card-modal-row">
            <label>
              Lektion
              <input
                type="number"
                min={1}
                value={form.lektion}
                onChange={(e) => setForm((f) => ({ ...f, lektion: e.target.value }))}
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
          {error ? <p className="card-modal-error">{error}</p> : null}
          <div className="card-modal-actions">
            <button type="button" className="card-modal-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="card-modal-btn-primary" disabled={saving}>
              {saving ? "Saving…" : mode === "create" ? "Create card" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
