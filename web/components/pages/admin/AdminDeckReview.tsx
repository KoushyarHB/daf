"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import type { ColumnDef } from "@tanstack/react-table";
import type { z } from "zod";

import ConfirmModal from "@/components/shared/organisms/ConfirmModal";
import DataTable from "@/components/shared/organisms/DataTable";
import { useToast } from "@/providers/ToastProvider";
import CardFormModal from "@/components/pages/vocabulary/CardFormModal";
import { getApiErrorMessage } from "@/services/frontend/http";
import { fetchAdminDeck } from "@/services/frontend/admin.client";
import {
  usePublishAdminDeckMutation,
  useUnpublishAdminDeckMutation,
  useUpdateAdminDeckMutation,
} from "@/hooks/admin";
import { deckNameFormSchema } from "@/lib/api/schemas";
import type { AdminDeckDto } from "@/lib/api/dto";
import type { EnrichedVocabCard } from "@/lib/vocab/types";
import { tagsPageTitleClass } from "@/lib/styles/pageTitle";
import {
  tagsPageClass,
  tagsPageHeaderClass,
  tagsPageIntroClass,
  tagsTableActionsClass,
  tagsTableActionsColClass,
  tagsTableClass,
  tagsTableThTdClass,
  tagsTableWrapClass,
} from "@/lib/styles/tagsPage";

type AdminDeckReviewProps = {
  deckId: string;
  initialDeck: AdminDeckDto;
  initialCards: EnrichedVocabCard[];
};

type DeckNameValues = z.infer<typeof deckNameFormSchema>;

const btnPrimary =
  "inline-flex shrink-0 items-center justify-center rounded-md border border-daf-head-dark bg-daf-head px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-daf-head-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-daf-head/30 disabled:cursor-not-allowed disabled:opacity-50";

const btnSecondary =
  "inline-flex shrink-0 items-center justify-center rounded-md border border-daf-border-badge bg-daf-white px-4 py-2 text-sm font-semibold text-daf-head shadow-sm transition hover:border-grm-hub-card-hover hover:bg-daf-head-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-daf-head/20";

const btnDanger =
  "inline-flex shrink-0 items-center justify-center rounded-md border border-daf-danger-border bg-daf-danger-bg px-4 py-2 text-sm font-semibold text-daf-danger-strong shadow-sm transition hover:border-daf-danger-border-hover hover:bg-daf-danger-bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-daf-danger-alt/15 disabled:cursor-not-allowed disabled:opacity-50";

const panel =
  "mb-5 rounded-xl border border-daf-border-table bg-daf-white p-5 shadow-sm sm:p-6";

const panelTitle =
  "mb-4 border-b border-grm-panel-border-row pb-3 text-base font-semibold text-daf-head";

const fieldInput =
  "w-full rounded-md border border-daf-border-input bg-daf-white px-3 py-2 text-sm text-daf-ink shadow-sm focus:border-daf-head focus:outline-none focus:ring-2 focus:ring-daf-head/20";

export default function AdminDeckReview({
  deckId,
  initialDeck,
  initialCards,
}: AdminDeckReviewProps) {
  const toast = useToast();
  const updateDeck = useUpdateAdminDeckMutation();
  const publishDeck = usePublishAdminDeckMutation();
  const unpublishDeck = useUnpublishAdminDeckMutation();
  const [deck, setDeck] = useState(initialDeck);
  const [cards, setCards] = useState(initialCards);
  const [publishConfirmOpen, setPublishConfirmOpen] = useState(false);
  const [unpublishConfirmOpen, setUnpublishConfirmOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<EnrichedVocabCard | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting },
  } = useForm<DeckNameValues>({
    resolver: zodResolver(deckNameFormSchema),
    defaultValues: { name: initialDeck.name },
  });

  const deckName = useWatch({ control, name: "name" }) ?? "";

  useEffect(() => {
    reset({ name: deck.name });
  }, [deck.name, reset]);

  async function saveDeckName(values: DeckNameValues) {
    const trimmed = values.name.trim();
    if (!trimmed || trimmed === deck.name) return;
    try {
      const data = await updateDeck.mutateAsync({ deckId, name: trimmed });
      setDeck(data);
      reset({ name: data.name });
      toast.success("Deck name updated");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Save failed"));
    }
  }

  async function onPublish() {
    try {
      const data = await publishDeck.mutateAsync(deckId);
      toast.success(
        data.republished
          ? `Republished ${data.cardCount} cards as “${data.tag?.label}”`
          : `Published ${data.cardCount} cards as community deck “${data.tag?.label}”`,
      );
      const updated = await fetchAdminDeck(deckId);
      setDeck(updated);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Publish failed"));
    } finally {
      setPublishConfirmOpen(false);
    }
  }

  async function onUnpublish() {
    try {
      const data = await unpublishDeck.mutateAsync(deckId);
      toast.success(
        `Removed ${data.removedCardCount ?? 0} community cards from the catalog`,
      );
      const updated = await fetchAdminDeck(deckId);
      setDeck(updated);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Unpublish failed"));
    } finally {
      setUnpublishConfirmOpen(false);
    }
  }

  function openEdit(card: EnrichedVocabCard) {
    setEditingCard(card);
    setEditorOpen(true);
  }

  function onCardSaved(saved: EnrichedVocabCard) {
    setCards((prev) =>
      prev.map((c) => (c.domId === saved.domId ? saved : c)),
    );
  }

  const nameDirty = deckName.trim() !== deck.name;

  const cardColumns = useMemo<ColumnDef<EnrichedVocabCard>[]>(
    () => [
      {
        accessorKey: "head",
        header: "Headword",
        meta: {
          cellClassName: `${tagsTableThTdClass} font-medium text-daf-text`,
        },
      },
      {
        id: "gloss",
        header: "Gloss",
        meta: {
          cellClassName: `${tagsTableThTdClass} text-daf-muted`,
        },
        cell: ({ row }) => (row.original.gloss ?? []).join("; ") || "—",
      },
      {
        id: "actions",
        header: "Actions",
        meta: {
          headerClassName: `${tagsTableThTdClass} ${tagsTableActionsColClass}`,
          cellClassName: `${tagsTableThTdClass} ${tagsTableActionsColClass} ${tagsTableActionsClass}`,
        },
        cell: ({ row }) => (
          <button
            type="button"
            className={btnSecondary}
            onClick={() => openEdit(row.original)}
          >
            Edit
          </button>
        ),
      },
    ],
    [],
  );

  return (
    <div className={tagsPageClass}>
      <div className={tagsPageHeaderClass}>
        <h1 className={tagsPageTitleClass}>Review deck</h1>
        <Link href="/admin/publish" className={btnSecondary}>
          ← Back
        </Link>
      </div>

      <p className={tagsPageIntroClass}>
        Owner: {deck.ownerName ? `${deck.ownerName} — ` : ""}
        {deck.ownerEmail}. Edit the deck name and cards before publishing to the
        community catalog.
      </p>

      <section className={panel} aria-labelledby="deck-details-title">
        <h2 id="deck-details-title" className={panelTitle}>
          Deck details
        </h2>
        <form
          className="flex flex-col gap-4 sm:flex-row sm:items-end"
          onSubmit={handleSubmit(saveDeckName)}
        >
          <label className="flex min-w-0 flex-1 flex-col gap-1.5 text-sm font-semibold text-daf-label">
            Deck name
            <input
              id="admin-deck-name"
              type="text"
              className={fieldInput}
              autoComplete="off"
              {...register("name")}
            />
          </label>
          <button
            type="submit"
            className={btnPrimary}
            disabled={
              isSubmitting ||
              updateDeck.isPending ||
              !nameDirty ||
              !deckName.trim()
            }
          >
            {updateDeck.isPending ? "Saving…" : "Save name"}
          </button>
        </form>
        <dl className="mt-4 grid gap-2 text-sm text-daf-muted sm:grid-cols-2">
          <div>
            <dt className="font-medium text-daf-subtle">Slug</dt>
            <dd>
              <code className="rounded bg-daf-panel-alt px-1.5 py-0.5 text-xs text-daf-text">
                {deck.slug}
              </code>
            </dd>
          </div>
          <div>
            <dt className="font-medium text-daf-subtle">Status</dt>
            <dd>
              {deck.publishedAt ? (
                <span className="inline-flex items-center rounded-full border border-daf-border-badge bg-daf-head-soft px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-daf-head">
                  Published
                </span>
              ) : (
                <span className="text-daf-muted">Draft</span>
              )}
            </dd>
          </div>
        </dl>
      </section>

      <section className={panel} aria-labelledby="community-catalog-title">
        <h2 id="community-catalog-title" className={panelTitle}>
          Community catalog
        </h2>
        <p className="mb-4 text-sm leading-relaxed text-daf-muted">
          {cards.length === 0
            ? "This deck needs at least one card before it can be published to Import community cards."
            : deck.publishedAt
              ? "This deck is live. Republish after edits, or unpublish to hide it from new imports."
              : "Publishing copies these cards to the community catalog so learners can import them."}
        </p>
        {deck.publishedTagSlug ? (
          <p className="mb-4 text-sm text-daf-muted">
            Community tag:{" "}
            <code className="rounded bg-daf-panel-alt px-1.5 py-0.5 text-xs text-daf-text">
              {deck.publishedTagSlug}
            </code>
          </p>
        ) : null}
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className={btnPrimary}
            onClick={() => setPublishConfirmOpen(true)}
            disabled={publishDeck.isPending || cards.length === 0}
          >
            {publishDeck.isPending
              ? "Publishing…"
              : deck.publishedAt
                ? "Republish to community"
                : "Publish to community"}
          </button>
          {deck.publishedAt ? (
            <button
              type="button"
              className={btnDanger}
              onClick={() => setUnpublishConfirmOpen(true)}
              disabled={unpublishDeck.isPending}
            >
              {unpublishDeck.isPending ? "Unpublishing…" : "Unpublish"}
            </button>
          ) : null}
        </div>
      </section>

      <section className={panel} aria-labelledby="deck-cards-title">
        <h2 id="deck-cards-title" className={panelTitle}>
          Cards ({cards.length})
        </h2>

        {cards.length === 0 ? (
          <div className="rounded-lg border border-dashed border-daf-border-table bg-daf-panel-soft px-4 py-8 text-center">
            <p className="text-sm font-medium text-daf-label">
              No cards in this deck
            </p>
            <p className="mt-1 text-sm text-daf-subtle">
              The owner must add vocabulary cards before you can publish this deck.
            </p>
          </div>
        ) : (
          <DataTable
            data={cards}
            columns={cardColumns}
            tableClassName={tagsTableClass}
            wrapClassName={`${tagsTableWrapClass} -mx-1 px-1`}
            getRowId={(row) => row.domId}
          />
        )}
      </section>

      <ConfirmModal
        open={publishConfirmOpen}
        title={deck.publishedAt ? "Republish deck" : "Publish deck"}
        message={
          `Publish “${deckName.trim() || deck.name}” by ${deck.ownerEmail} to the community catalog? ` +
          `Learners can import it via Import community cards (${cards.length} cards).`
        }
        confirmLabel={deck.publishedAt ? "Republish" : "Publish"}
        loading={publishDeck.isPending}
        onConfirm={() => void onPublish()}
        onCancel={() => setPublishConfirmOpen(false)}
      />

      <ConfirmModal
        open={unpublishConfirmOpen}
        title="Unpublish deck"
        message={
          `Remove “${deck.name}” from the community catalog? ` +
          `Imported copies on user accounts are unchanged; the bundle will no longer appear for new imports.`
        }
        confirmLabel="Unpublish"
        danger
        loading={unpublishDeck.isPending}
        onConfirm={() => void onUnpublish()}
        onCancel={() => setUnpublishConfirmOpen(false)}
      />

      <CardFormModal
        open={editorOpen}
        mode="edit"
        card={editingCard}
        adminDeckId={deckId}
        onClose={() => setEditorOpen(false)}
        onSaved={onCardSaved}
      />
    </div>
  );
}
