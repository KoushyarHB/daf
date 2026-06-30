"use client";

import Link from "next/link";
import { useEffect, useId, useState, useSyncExternalStore } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
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
import { CEFR_LEVELS, normalizeCefrLevel } from "@/lib/vocab/levels";
import {
  formFieldsToManifestCardJson,
  manifestCardSampleJson,
  type ManifestCardFillResult,
} from "@/lib/vocab/manifest-card-fill";
import { speakTextForHead } from "@/lib/audio/speak-text";
import { VOCAB_POS_ORDER, posLabel } from "@/lib/vocab/types";
import type { EnrichedVocabCard } from "@/lib/vocab/types";
import { cardToForm } from "@/utils/cardToForm";
import type { CardFormState } from "@/utils/cardFormTypes";
import { emptyExample } from "@/utils/emptyExample";
import { emptyForm } from "@/utils/emptyForm";
import { newExampleKey } from "@/utils/newExampleKey";

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

type DeckOption = { id: string; name: string };

function useIsClient(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

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
  const [aiFillConfirmOpen, setAiFillConfirmOpen] = useState(false);
  const [jsonFillOpen, setJsonFillOpen] = useState(false);
  const [generatingPronunciation, setGeneratingPronunciation] = useState(false);
  const [pronunciationProgress, setPronunciationProgress] = useState<string | null>(
    null,
  );
  const mounted = useIsClient();

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    setError,
    clearErrors,
    getValues,
    formState: { isSubmitting, errors },
  } = useForm<CardFormState>({
    defaultValues: emptyForm(),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "examples",
    keyName: "rfKey",
  });

  const watched = useWatch({ control });
  const form = { ...emptyForm(), ...watched } as CardFormState;

  useEffect(() => {
    if (!open) return;
    const initialDeck =
      defaultDeckId || (mode === "edit" && card?.deckId ? card.deckId : "");
    reset(
      mode === "edit" && card ? cardToForm(card) : emptyForm(initialDeck),
    );
  }, [open, mode, card, defaultDeckId, reset]);

  useEffect(() => {
    if (!open || adminDeckId) return;
    const items = deckOptionsQuery.data ?? [];
    if (mode === "create" && items[0] && !getValues("deckId")) {
      setValue("deckId", items[0].id);
    }
  }, [open, adminDeckId, deckOptionsQuery.data, mode, getValues, setValue]);

  const decks: DeckOption[] = deckOptionsQuery.data ?? [];

  function handleClose() {
    setAiFillConfirmOpen(false);
    setJsonFillOpen(false);
    onClose();
  }

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

  function removeExampleAt(index: number) {
    if (fields.length <= 1) {
      setValue("examples", [emptyExample()]);
      return;
    }
    remove(index);
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
    const values = getValues();
    const head = values.head.trim();
    const exampleRows = values.examples.filter((ex) => ex.german.trim());
    if (!head && exampleRows.length === 0) {
      toast.error("Add a headword or at least one German example first.");
      return;
    }

    setGeneratingPronunciation(true);
    clearErrors("root");
    const total = (head ? 1 : 0) + exampleRows.length;
    let done = 0;

    try {
      if (head) {
        setPronunciationProgress(`Generating ${done + 1} of ${total}…`);
        const audio = await requestCardAudio({ head });
        setValue("audio", audio);
        done += 1;
      }

      for (let i = 0; i < values.examples.length; i++) {
        const ex = values.examples[i];
        if (!ex.german.trim()) continue;
        setPronunciationProgress(`Generating ${done + 1} of ${total}…`);
        const audio = await requestCardAudio({ text: ex.german.trim() });
        setValue(`examples.${i}.audio`, audio);
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
      setError("root", { message });
      toast.error(message);
    } finally {
      setGeneratingPronunciation(false);
      setPronunciationProgress(null);
    }
  }

  function onAiFillClick() {
    if (!getValues("head").trim()) {
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
    const head = getValues("head").trim();
    if (!head) return;

    clearErrors("root");

    try {
      const data = await suggestCard.mutateAsync(head);
      const current = getValues();

      setValue("head", data.head?.trim() || current.head);
      setValue("ipa", data.ipa?.trim() ?? current.ipa);
      setValue("gloss", data.gloss?.trim() ?? current.gloss);
      setValue("notes", data.notes?.trim() ?? current.notes);
      if (data.examples && data.examples.length > 0) {
        setValue(
          "examples",
          data.examples.map((ex) => ({
            key: newExampleKey(),
            german: ex.german,
            english: ex.english,
            audio: "",
          })),
        );
      }
      setValue("pos", data.pos ?? current.pos);
      setValue(
        "level",
        normalizeCefrLevel(data.level?.trim() || current.level),
      );
      toast.success("Form filled from AI — review before saving.");
    } catch (err) {
      const message = getApiErrorMessage(err, "AI fill failed");
      setError("root", { message });
      toast.error(message);
    }
  }

  function applyManifestFill(result: ManifestCardFillResult) {
    const current = getValues();
    setValue("head", result.head);
    setValue("ipa", result.ipa);
    setValue("audio", result.audio);
    setValue("gloss", result.gloss);
    setValue("notes", result.notes);
    setValue(
      "examples",
      result.examples.length > 0
        ? result.examples.map((ex) => ({
            key: newExampleKey(),
            german: ex.german,
            english: ex.english,
            audio: ex.audio,
          }))
        : current.examples,
    );
    setValue("pos", result.pos);
    setValue("level", result.level);
    if (result.tagSlugs.length > 0) {
      setValue("tagSlugs", [...new Set([...result.tagSlugs, TAG_USER])]);
    }
    clearErrors("root");
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

  async function onSubmit(values: CardFormState) {
    clearErrors("root");

    const gloss = values.gloss
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const notes = values.notes
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const examples = values.examples
      .map((ex) => ({
        german: ex.german.trim(),
        english: ex.english.trim() || null,
        audio: ex.audio.trim() || undefined,
      }))
      .filter((ex) => ex.german.length > 0);
    const tags = values.tagSlugs.length > 0 ? values.tagSlugs : [TAG_USER];

    const body = {
      head: values.head.trim(),
      ipa: values.ipa.trim() || undefined,
      audio: values.audio.trim() || undefined,
      gloss,
      notes,
      examples,
      tags,
      deckId: values.deckId || undefined,
      level: values.level,
      pos: values.pos,
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
      handleClose();
    } catch (err) {
      const message = getApiErrorMessage(err, "Save failed");
      setError("root", { message });
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

  const fieldLabel =
    "flex flex-col gap-[0.2rem] text-[0.82rem] font-semibold text-daf-body";
  const fieldInput =
    "rounded-md border border-daf-border-input bg-white p-2 px-[0.6rem] font-inherit text-[0.95rem] font-normal focus:border-daf-head/55 focus:shadow-daf-focus focus:outline-none";
  const fieldTextarea = `${fieldInput} min-h-[3.25rem] resize-y`;
  const fieldSelect = `${fieldInput} cursor-pointer appearance-none bg-daf-select-chevron bg-[length:0.75rem] bg-[right_0.55rem_center] bg-no-repeat pr-8`;
  const fieldHint = "text-[0.75rem] font-normal leading-snug text-daf-muted";
  const btnBase =
    "cursor-pointer appearance-none rounded border border-transparent px-[0.85rem] py-[0.45rem] text-[0.85rem] font-semibold whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-65";

  return createPortal(
    <div
      className="fixed inset-0 z-500 flex items-stretch justify-center overflow-hidden overscroll-contain bg-black/35 p-0"
      onClick={handleClose}
      role="presentation"
    >
      <div
        className="m-0 flex h-dvh max-h-dvh w-full max-w-site flex-col overflow-hidden rounded-none border-0 border-x border-daf-border bg-white shadow-modal-lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby="card-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 px-5 pt-5 pb-2">
          <div className="flex items-center justify-between gap-3">
            <h2
              id="card-modal-title"
              className="m-0 min-w-0 flex-1 border-0 p-0 text-[1.25rem] font-semibold text-daf-head"
            >
              {title}
            </h2>
            <div className="flex shrink-0 items-center gap-[0.4rem]">
              <button
                type="button"
                className="shrink-0 cursor-pointer rounded-md border border-daf-head/45 bg-gradient-to-b from-daf-ai-from to-daf-head-soft px-[0.7rem] py-[0.35rem] text-[0.78rem] font-semibold whitespace-nowrap text-daf-ai-text hover:border-daf-head/65 hover:from-daf-ai-hover-from hover:to-daf-ai-hover-to disabled:cursor-not-allowed disabled:opacity-55"
                onClick={onAiFillClick}
                disabled={suggestCard.isPending || !form.head.trim()}
                title="Fill gloss, notes, examples, IPA, and type from the headword"
              >
                {suggestCard.isPending ? "Filling…" : "✨ AI fill"}
              </button>
              <button
                type="button"
                className="shrink-0 cursor-pointer rounded-md border border-daf-head/45 bg-white px-[0.7rem] py-[0.35rem] font-mono text-[0.78rem] font-semibold whitespace-nowrap text-daf-ai-text hover:border-daf-head/65 hover:bg-daf-head-softer disabled:cursor-not-allowed disabled:opacity-55"
                onClick={() => setJsonFillOpen(true)}
                title="Paste a vocab.manifest.json card object to fill the form"
              >
                {"{ }"} JSON fill
              </button>
            </div>
          </div>
          {mode === "edit" && card && isPristineCommunityCard(card) ? (
            <p className="m-0 text-[0.8rem] leading-snug text-daf-muted">
              Saves a personal copy for you. The shared community card stays unchanged.
            </p>
          ) : null}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="flex min-h-0 flex-1 flex-col gap-[0.85rem] overflow-y-auto overscroll-contain px-5 pt-1 pb-4">
            <label className={fieldLabel}>
              Headword
              <input
                className={fieldInput}
                required
                placeholder="das Wort /vɔʁt/"
                {...register("head")}
              />
            </label>
            <label className={fieldLabel}>
              IPA
              <input
                className={fieldInput}
                placeholder="/vɔʁt/"
                {...register("ipa")}
              />
            </label>
            <label className={fieldLabel}>
              English gloss
              <span className={fieldHint}>
                Short flashcard answer — what the word means in English.
              </span>
              <textarea
                className={fieldTextarea}
                rows={2}
                placeholder="word; vocabulary item"
                {...register("gloss")}
              />
            </label>
            <label className={fieldLabel}>
              Notes
              <span className={fieldHint}>
                Optional — grammar, usage, or exam tips.
              </span>
              <textarea
                className={fieldTextarea}
                rows={2}
                placeholder="• separable verb — …"
                {...register("notes")}
              />
            </label>

            <fieldset
              className="m-0 min-w-0 border-0 p-0"
              aria-labelledby={examplesLegendId}
            >
              <legend
                id={examplesLegendId}
                className="mb-1 text-[0.85rem] font-semibold text-daf-label"
              >
                Examples
              </legend>
              <p className={`${fieldHint} mb-2`}>
                German sentence plus a natural English translation for each example.
              </p>
              <ul className="m-0 list-none space-y-2 p-0">
                {fields.map((field, index) => (
                  <li
                    key={field.rfKey}
                    className="flex items-start gap-2 rounded-md border border-daf-border-nav bg-daf-panel-muted p-2"
                  >
                    <div className="grid min-w-0 flex-1 gap-2 min-[32rem]:grid-cols-2">
                      <label className={`${fieldLabel} text-[0.75rem]`}>
                        German
                        <input
                          className={fieldInput}
                          placeholder="Ich lerne das Wort."
                          {...register(`examples.${index}.german`)}
                        />
                      </label>
                      <label className={`${fieldLabel} text-[0.75rem]`}>
                        English
                        <input
                          className={fieldInput}
                          placeholder="I am learning the word."
                          {...register(`examples.${index}.english`)}
                        />
                      </label>
                    </div>
                    <button
                      type="button"
                      className="mt-0.5 shrink-0 cursor-pointer border-0 bg-transparent px-1 text-[1.1rem] leading-none text-daf-icon-muted hover:text-daf-danger"
                      onClick={() => removeExampleAt(index)}
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
                className="mt-2 cursor-pointer border-0 bg-transparent p-0 text-[0.8rem] font-semibold text-daf-head hover:underline"
                onClick={() => append(emptyExample())}
              >
                + Add example
              </button>
            </fieldset>

            <div role="group" aria-labelledby="card-pronunciation-label">
              <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                <span
                  id="card-pronunciation-label"
                  className="text-[0.85rem] font-semibold text-daf-label"
                >
                  Pronunciation
                </span>
                <button
                  type="button"
                  className="cursor-pointer rounded-md border border-daf-head/45 bg-daf-head-softer px-3 py-1.5 text-[0.78rem] font-semibold text-daf-head hover:bg-daf-head-soft disabled:cursor-not-allowed disabled:opacity-55"
                  onClick={() => void generatePronunciation()}
                  disabled={generatingPronunciation || !canGeneratePronunciation}
                >
                  {generatingPronunciation
                    ? (pronunciationProgress ?? "Generating…")
                    : pronunciationPreviews.length > 0
                      ? "Regenerate pronunciation"
                      : "Generate pronunciation"}
                </button>
              </div>
              <p className={`${fieldHint} mb-2`}>
                Creates audio for the headword and each German example. Play to
                preview before saving.
              </p>
              {pronunciationPreviews.length > 0 ? (
                <ul className="m-0 list-none space-y-1.5 p-0">
                  {pronunciationPreviews.map((item) => (
                    <li
                      key={item.key}
                      className="flex flex-wrap items-center gap-2 rounded-md border border-daf-border-nav bg-daf-panel-muted px-2.5 py-1.5 text-[0.8rem]"
                    >
                      <span className="shrink-0 font-semibold text-daf-subtle">
                        {item.label}
                      </span>
                      <span className="min-w-0 flex-1 italic text-daf-label">
                        {item.text}
                      </span>
                      <PronounceButton audio={item.audio} compact />
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            <div className="flex flex-col gap-[0.35rem]" role="group" aria-labelledby="card-tags-label">
              <span id="card-tags-label" className="text-[0.85rem] font-semibold text-daf-label">
                Tags
              </span>
              <span className={fieldHint}>
                User cards include the &quot;user&quot; tag by default.{" "}
                <Link
                  href="/tags"
                  className="font-medium text-daf-head underline underline-offset-2 hover:text-daf-head-dark"
                >
                  Manage tags
                </Link>
              </span>
              <Controller
                control={control}
                name="tagSlugs"
                render={({ field }) => (
                  <TagMultiSelect
                    value={field.value}
                    onChange={field.onChange}
                    knownTags={card?.tags}
                    pageSize={5}
                  />
                )}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {!adminDeckId ? (
                <label className={`${fieldLabel} min-w-20 flex-1`}>
                  Deck
                  <select
                    className={fieldSelect}
                    required
                    {...register("deckId")}
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
              <label className={`${fieldLabel} min-w-20 flex-1`}>
                Level
                <select className={fieldSelect} {...register("level")}>
                  {CEFR_LEVELS.map((lv) => (
                    <option key={lv} value={lv}>
                      {lv}
                    </option>
                  ))}
                </select>
              </label>
              <label className={`${fieldLabel} min-w-20 flex-1`}>
                Type
                <select className={fieldSelect} {...register("pos")}>
                  {VOCAB_POS_ORDER.map((p) => (
                    <option key={p} value={p}>
                      {posLabel(p)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="shrink-0 border-t border-daf-border bg-white px-5 pt-[0.85rem] pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
            {errors.root?.message ? (
              <p className="m-0 mb-2 text-[0.8rem] text-daf-danger">
                {errors.root.message}
              </p>
            ) : null}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className={`${btnBase} border-daf-border-muted bg-daf-panel-alt text-daf-body`}
                onClick={handleClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`${btnBase} border-daf-head-dark bg-daf-head text-white`}
                disabled={isSubmitting || saveCard.isPending}
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
