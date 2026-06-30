"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";

import ConfirmModal from "@/components/shared/ConfirmModal";
import TagMultiSelect from "@/components/shared/TagMultiSelect";
import PronounceButton from "@/components/shared/PronounceButton";
import { useToast } from "@/components/shared/toast/ToastProvider";
import CardJsonFillModal from "@/components/pages/vocabulary/CardJsonFillModal";
import { getApiErrorMessage } from "@/services/frontend/http";
import {
  useGenerateCardAudioMutation,
  useSaveCardMutation,
  useSuggestCardMutation,
} from "@/hooks/cards";
import { useDeckOptionsQuery } from "@/hooks/decks";
import { isPristineCommunityCard } from "@/lib/vocab/card-manage";
import { TAG_USER } from "@/lib/tags/constants";
import { CEFR_LEVELS, normalizeCefrLevel, type CefrLevel } from "@/lib/vocab/levels";
import {
  formFieldsToManifestCardJson,
  manifestCardSampleJson,
  type ManifestCardFillResult,
} from "@/lib/vocab/manifest-card-fill";
import { speakTextForHead } from "@/lib/audio/speak-text";
import { VOCAB_POS_ORDER, posLabel } from "@/lib/vocab/types";
import type { EnrichedVocabCard, VocabPos } from "@/lib/vocab/types";

type CardFormModalProps = {
  mode: "create" | "edit";
  card?: EnrichedVocabCard | null;
  open: boolean;
  defaultDeckId?: string;
  /** When set, saves via super-admin deck review API (edits the deck owner's card). */
  adminDeckId?: string;
  onClose: () => void;
  onSaved: (card: EnrichedVocabCard) => void;
};

type ExampleRow = {
  key: string;
  german: string;
  english: string;
  audio: string;
};

type FormState = {
  head: string;
  ipa: string;
  gloss: string;
  notes: string;
  audio: string;
  examples: ExampleRow[];
  tagSlugs: string[];
  deckId: string;
  level: CefrLevel;
  pos: VocabPos;
};

type DeckOption = { id: string; name: string };

let exampleKeySeq = 0;

function newExampleKey(): string {
  exampleKeySeq += 1;
  return `ex-${exampleKeySeq}`;
}

function emptyExample(): ExampleRow {
  return { key: newExampleKey(), german: "", english: "", audio: "" };
}

function cardToForm(card: EnrichedVocabCard): FormState {
  const examples =
    card.examples.length > 0
      ? card.examples.map((ex) => ({
          key: newExampleKey(),
          german: ex.german ?? "",
          english: ex.english ?? "",
          audio: ex.audio ?? "",
        }))
      : [emptyExample()];

  return {
    head: card.head,
    ipa: card.ipa ?? "",
    audio: card.audio ?? "",
    gloss: (card.gloss ?? []).join("\n").trim(),
    notes: (card.notes ?? []).join("\n").trim(),
    examples,
    tagSlugs: (card.tags ?? []).map((t) => t.slug),
    deckId: card.deckId ?? "",
    level: normalizeCefrLevel(card.level),
    pos: card.pos ?? "other",
  };
}

const emptyForm = (deckId = ""): FormState => ({
  head: "",
  ipa: "",
  gloss: "",
  notes: "",
  audio: "",
  examples: [emptyExample()],
  tagSlugs: [TAG_USER],
  deckId,
  level: "A1",
  pos: "other",
});

export default function CardFormModal({
  mode,
  card,
  open,
  defaultDeckId,
  adminDeckId,
  onClose,
  onSaved,
}: CardFormModalProps) {
  const toast = useToast();
  const deckOptionsQuery = useDeckOptionsQuery({
    enabled: open && !adminDeckId,
  });
  const generateAudio = useGenerateCardAudioMutation();
  const suggestCard = useSuggestCardMutation();
  const saveCard = useSaveCardMutation();
  const examplesLegendId = useId();
  const [form, setForm] = useState<FormState>(() => emptyForm());
  const [error, setError] = useState<string | null>(null);
  const [aiFillConfirmOpen, setAiFillConfirmOpen] = useState(false);
  const [jsonFillOpen, setJsonFillOpen] = useState(false);
  const [generatingPronunciation, setGeneratingPronunciation] = useState(false);
  const [pronunciationProgress, setPronunciationProgress] = useState<string | null>(
    null,
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    setError(null);
    const initialDeck =
      defaultDeckId || (mode === "edit" && card?.deckId ? card.deckId : "");
    setForm(
      mode === "edit" && card ? cardToForm(card) : emptyForm(initialDeck),
    );
  }, [open, mode, card, defaultDeckId]);

  useEffect(() => {
    if (!open || adminDeckId) return;
    const items = deckOptionsQuery.data ?? [];
    if (mode === "create" && items[0]) {
      setForm((f) => (f.deckId ? f : { ...f, deckId: items[0].id }));
    }
  }, [open, adminDeckId, deckOptionsQuery.data, mode]);

  const decks: DeckOption[] = deckOptionsQuery.data ?? [];

  useEffect(() => {
    if (open) return;
    setAiFillConfirmOpen(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.classList.add("card-modal-open");
    return () => {
      document.body.style.overflow = prev;
      document.body.classList.remove("card-modal-open");
    };
  }, [open]);

  if (!open || !mounted) return null;

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

  async function requestCardAudio(body: {
    text?: string;
    head?: string;
  }): Promise<string> {
    const data = await generateAudio.mutateAsync(body);
    if (!data.audio) {
      throw new Error("Audio generation failed");
    }
    return data.audio;
  }

  async function generatePronunciation() {
    const head = form.head.trim();
    const exampleRows = form.examples.filter((ex) => ex.german.trim());
    if (!head && exampleRows.length === 0) {
      toast.error("Add a headword or at least one German example first.");
      return;
    }

    setGeneratingPronunciation(true);
    setError(null);
    const total = (head ? 1 : 0) + exampleRows.length;
    let done = 0;

    try {
      if (head) {
        setPronunciationProgress(`Generating ${done + 1} of ${total}…`);
        const audio = await requestCardAudio({ head });
        setForm((f) => ({ ...f, audio }));
        done += 1;
      }

      for (const ex of exampleRows) {
        setPronunciationProgress(`Generating ${done + 1} of ${total}…`);
        const audio = await requestCardAudio({ text: ex.german.trim() });
        setForm((f) => ({
          ...f,
          examples: f.examples.map((row) =>
            row.key === ex.key ? { ...row, audio } : row,
          ),
        }));
        done += 1;
      }

      toast.success(
        total === 1
          ? "Pronunciation ready — play to preview, then save."
          : `${total} pronunciations ready — play to preview, then save.`,
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Audio generation failed";
      setError(message);
      toast.error(message);
    } finally {
      setGeneratingPronunciation(false);
      setPronunciationProgress(null);
    }
  }

  function onAiFillClick() {
    if (!form.head.trim()) {
      toast.error("Enter a headword first.");
      return;
    }
    if (mode === "edit") {
      setAiFillConfirmOpen(true);
      return;
    }
    void runAiSuggest();
  }

  async function runAiSuggest() {
    const head = form.head.trim();
    if (!head) return;

    setError(null);

    try {
      const data = await suggestCard.mutateAsync(head);

      setForm((f) => ({
        ...f,
        head: data.head?.trim() || f.head,
        ipa: data.ipa?.trim() ?? f.ipa,
        gloss: data.gloss?.trim() ?? f.gloss,
        notes: data.notes?.trim() ?? f.notes,
        examples:
          data.examples && data.examples.length > 0
            ? data.examples.map((ex) => ({
                key: newExampleKey(),
                german: ex.german,
                english: ex.english,
                audio: "",
              }))
            : f.examples,
        pos: data.pos ?? f.pos,
        level: normalizeCefrLevel(data.level?.trim() || f.level),
      }));
      toast.success("Form filled from AI — review before saving.");
    } catch (err) {
      const message = getApiErrorMessage(err, "AI fill failed");
      setError(message);
      toast.error(message);
    }
  }

  function applyManifestFill(result: ManifestCardFillResult) {
    setForm((f) => ({
      ...f,
      head: result.head,
      ipa: result.ipa,
      audio: result.audio,
      gloss: result.gloss,
      notes: result.notes,
      examples:
        result.examples.length > 0
          ? result.examples.map((ex) => ({
              key: newExampleKey(),
              german: ex.german,
              english: ex.english,
              audio: ex.audio,
            }))
          : f.examples,
      pos: result.pos,
      level: result.level,
      tagSlugs:
        result.tagSlugs.length > 0
          ? [...new Set([...result.tagSlugs, TAG_USER])]
          : f.tagSlugs,
    }));
    setError(null);
    toast.success("Form filled from JSON — review before saving.");
  }

  const jsonFillInitial = form.head.trim()
    ? formFieldsToManifestCardJson({
        head: form.head,
        ipa: form.ipa,
        audio: form.audio,
        gloss: form.gloss,
        notes: form.notes,
        examples: form.examples,
        pos: form.pos,
        level: form.level,
        tagSlugs: form.tagSlugs,
      })
    : manifestCardSampleJson();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
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
        audio: ex.audio.trim() || undefined,
      }))
      .filter((ex) => ex.german.length > 0);
    const tags = form.tagSlugs.length > 0 ? form.tagSlugs : [TAG_USER];

    const body = {
      head: form.head.trim(),
      ipa: form.ipa.trim() || undefined,
      audio: form.audio.trim() || undefined,
      gloss,
      notes,
      examples,
      tags,
      deckId: form.deckId || undefined,
      level: form.level,
      pos: form.pos,
    };

    try {
      const saved = await saveCard.mutateAsync({
        mode,
        domId: card?.domId,
        adminDeckId,
        body,
      });
      const successMessage =
        mode === "create"
          ? "Card created"
          : adminDeckId
            ? "Card updated"
            : card && isPristineCommunityCard(card)
              ? "Personal copy saved"
              : "Card updated";
      toast.success(successMessage);
      onSaved(saved);
      onClose();
    } catch (err) {
      const message = getApiErrorMessage(err, "Save failed");
      setError(message);
      toast.error(message);
    }
  }

  const title =
    mode === "create"
      ? "Add card"
      : card && isPristineCommunityCard(card)
        ? "Customize community card"
        : "Edit card";

  const canGeneratePronunciation =
    Boolean(form.head.trim()) ||
    form.examples.some((ex) => ex.german.trim());

  const pronunciationPreviews = [
    ...(form.audio.trim() && form.head.trim()
      ? [
          {
            key: "head",
            label: "Head",
            text: speakTextForHead(form.head) || form.head.trim(),
            audio: form.audio.trim(),
          },
        ]
      : []),
    ...form.examples.flatMap((ex, index) =>
      ex.audio.trim() && ex.german.trim()
        ? [
            {
              key: ex.key,
              label: `Example ${index + 1}`,
              text: ex.german.trim(),
              audio: ex.audio.trim(),
            },
          ]
        : [],
    ),
  ];

  return createPortal(
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
          <div className="card-form-modal__title-row">
            <h2 id="card-modal-title" className="card-modal-title">
              {title}
            </h2>
            <div className="card-form-fill-btns">
              <button
                type="button"
                className="card-form-ai-btn"
                onClick={onAiFillClick}
                disabled={suggestCard.isPending || !form.head.trim()}
                title="Fill gloss, notes, examples, IPA, and type from the headword"
              >
                {suggestCard.isPending ? "Filling…" : "✨ AI fill"}
              </button>
              <button
                type="button"
                className="card-form-json-btn"
                onClick={() => setJsonFillOpen(true)}
                title="Paste a vocab.manifest.json card object to fill the form"
              >
                {"{ }"} JSON fill
              </button>
            </div>
          </div>
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

            <div
              className="card-form-pronunciation"
              role="group"
              aria-labelledby="card-pronunciation-label"
            >
              <div className="card-form-pronunciation__header">
                <span id="card-pronunciation-label" className="card-form-field-label">
                  Pronunciation
                </span>
                <button
                  type="button"
                  className="card-form-audio-btn"
                  onClick={generatePronunciation}
                  disabled={generatingPronunciation || !canGeneratePronunciation}
                >
                  {generatingPronunciation
                    ? (pronunciationProgress ?? "Generating…")
                    : pronunciationPreviews.length > 0
                      ? "Regenerate pronunciation"
                      : "Generate pronunciation"}
                </button>
              </div>
              <p className="card-form-field-hint card-form-pronunciation__hint">
                Creates audio for the headword and each German example. Play to
                preview before saving.
              </p>
              {pronunciationPreviews.length > 0 ? (
                <ul className="card-form-pronunciation__list">
                  {pronunciationPreviews.map((item) => (
                    <li key={item.key} className="card-form-pronunciation__item">
                      <span className="card-form-pronunciation__label">
                        {item.label}
                      </span>
                      <span className="card-form-pronunciation__text">
                        {item.text}
                      </span>
                      <PronounceButton audio={item.audio} compact />
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            <div className="card-form-field" role="group" aria-labelledby="card-tags-label">
              <span id="card-tags-label" className="card-form-field-label">
                Tags
              </span>
              <span className="card-form-field-hint">
                User cards include the &quot;user&quot; tag by default.{" "}
                <Link href="/tags" className="card-form-inline-link">
                  Manage tags
                </Link>
              </span>
              <TagMultiSelect
                value={form.tagSlugs}
                onChange={(tagSlugs) => setForm((f) => ({ ...f, tagSlugs }))}
                knownTags={card?.tags}
                pageSize={5}
              />
            </div>

            <div className="card-modal-row">
              {!adminDeckId ? (
                <label>
                  Deck
                  <select
                    value={form.deckId}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, deckId: e.target.value }))
                    }
                    required
                  >
                    {decks.length === 0 ? (
                      <option value="">Loading…</option>
                    ) : (
                      decks.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))
                    )}
                  </select>
                </label>
              ) : null}
              <label>
                Level
                <select
                  value={form.level}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      level: e.target.value as CefrLevel,
                    }))
                  }
                >
                  {CEFR_LEVELS.map((lv) => (
                    <option key={lv} value={lv}>
                      {lv}
                    </option>
                  ))}
                </select>
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
                disabled={saveCard.isPending}
              >
                {saveCard.isPending ? "Saving…" : mode === "create" ? "Create card" : "Save"}
              </button>
            </div>
          </div>
        </form>
      </div>

      <CardJsonFillModal
        open={jsonFillOpen}
        initialJson={jsonFillInitial}
        onApply={applyManifestFill}
        onClose={() => setJsonFillOpen(false)}
      />

      <ConfirmModal
        open={aiFillConfirmOpen}
        title="Replace card content?"
        message="AI fill will replace the current IPA, gloss, notes, examples, level, and word type. Your edits in those fields will be lost."
        confirmLabel="Replace with AI"
        cancelLabel="Keep current"
        danger
        onConfirm={() => {
          setAiFillConfirmOpen(false);
          void runAiSuggest();
        }}
        onCancel={() => setAiFillConfirmOpen(false)}
      />
    </div>,
    document.body,
  );
}
