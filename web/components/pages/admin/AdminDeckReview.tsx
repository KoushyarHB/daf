"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import ConfirmModal from "@/components/shared/ConfirmModal";
import { useToast } from "@/components/shared/toast/ToastProvider";
import CardFormModal from "@/components/pages/vocabulary/CardFormModal";
import type { EnrichedVocabCard } from "@/lib/vocab/types";
import type { AdminDeckDto } from "@/services/admin-decks.service";

type AdminDeckReviewProps = {
  deckId: string;
  initialDeck: AdminDeckDto;
  initialCards: EnrichedVocabCard[];
};

const btnPrimary =
  "inline-flex shrink-0 items-center justify-center rounded-md border border-[#265c9e] bg-[#2f6fb8] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2860a8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2f6fb8]/30 disabled:cursor-not-allowed disabled:opacity-50";

const btnSecondary =
  "inline-flex shrink-0 items-center justify-center rounded-md border border-[#c5d9ef] bg-white px-4 py-2 text-sm font-semibold text-[#2f6fb8] shadow-sm transition hover:border-[#a8c4e8] hover:bg-[#eef4fc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2f6fb8]/20";

const btnDanger =
  "inline-flex shrink-0 items-center justify-center rounded-md border border-[#f0d0cb] bg-[#fff8f7] px-4 py-2 text-sm font-semibold text-[#9f2b1a] shadow-sm transition hover:border-[#e8b4ad] hover:bg-[#fef0ee] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b42318]/15 disabled:cursor-not-allowed disabled:opacity-50";

const panel =
  "mb-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6";

const panelTitle =
  "mb-4 border-b border-slate-100 pb-3 text-base font-semibold text-[#2f6fb8]";

const fieldInput =
  "w-full rounded-md border border-[#d8e2ef] bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-[#2f6fb8] focus:outline-none focus:ring-2 focus:ring-[#2f6fb8]/20";

export default function AdminDeckReview({
  deckId,
  initialDeck,
  initialCards,
}: AdminDeckReviewProps) {
  const toast = useToast();
  const [deck, setDeck] = useState(initialDeck);
  const [deckName, setDeckName] = useState(initialDeck.name);
  const [cards, setCards] = useState(initialCards);
  const [savingName, setSavingName] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [unpublishing, setUnpublishing] = useState(false);
  const [publishConfirmOpen, setPublishConfirmOpen] = useState(false);
  const [unpublishConfirmOpen, setUnpublishConfirmOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<EnrichedVocabCard | null>(null);

  useEffect(() => {
    setDeck(initialDeck);
    setDeckName(initialDeck.name);
    setCards(initialCards);
  }, [initialDeck, initialCards]);

  async function saveDeckName(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = deckName.trim();
    if (!trimmed || trimmed === deck.name) return;
    setSavingName(true);
    try {
      const res = await fetch(`/api/admin/decks/${encodeURIComponent(deckId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      const data = (await res.json().catch(() => ({}))) as AdminDeckDto & {
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error ?? `Save failed (${res.status})`);
      }
      setDeck(data);
      setDeckName(data.name);
      toast.success("Deck name updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSavingName(false);
    }
  }

  async function onPublish() {
    setPublishing(true);
    try {
      const res = await fetch(
        `/api/admin/decks/${encodeURIComponent(deckId)}/publish`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" },
      );
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        tag?: { slug: string; label: string };
        cardCount?: number;
        republished?: boolean;
      };
      if (!res.ok) {
        throw new Error(data.error ?? `Publish failed (${res.status})`);
      }
      toast.success(
        data.republished
          ? `Republished ${data.cardCount} cards as “${data.tag?.label}”`
          : `Published ${data.cardCount} cards as community deck “${data.tag?.label}”`,
      );
      const deckRes = await fetch(`/api/admin/decks/${encodeURIComponent(deckId)}`);
      if (deckRes.ok) {
        const updated = (await deckRes.json()) as AdminDeckDto;
        setDeck(updated);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Publish failed");
    } finally {
      setPublishing(false);
      setPublishConfirmOpen(false);
    }
  }

  async function onUnpublish() {
    setUnpublishing(true);
    try {
      const res = await fetch(
        `/api/admin/decks/${encodeURIComponent(deckId)}/unpublish`,
        { method: "POST" },
      );
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        removedCardCount?: number;
      };
      if (!res.ok) {
        throw new Error(data.error ?? `Unpublish failed (${res.status})`);
      }
      toast.success(
        `Removed ${data.removedCardCount ?? 0} community cards from the catalog`,
      );
      const deckRes = await fetch(`/api/admin/decks/${encodeURIComponent(deckId)}`);
      if (deckRes.ok) {
        const updated = (await deckRes.json()) as AdminDeckDto;
        setDeck(updated);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unpublish failed");
    } finally {
      setUnpublishing(false);
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

  return (
    <div className="tags-page">
      <div className="tags-page__header">
        <h1 className="tags-page__title">Review deck</h1>
        <Link href="/admin/publish" className={btnSecondary}>
          ← Back
        </Link>
      </div>

      <p className="tags-page__intro">
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
          onSubmit={(e) => void saveDeckName(e)}
        >
          <label className="flex min-w-0 flex-1 flex-col gap-1.5 text-sm font-semibold text-slate-700">
            Deck name
            <input
              id="admin-deck-name"
              type="text"
              className={fieldInput}
              value={deckName}
              onChange={(e) => setDeckName(e.target.value)}
              autoComplete="off"
              required
            />
          </label>
          <button
            type="submit"
            className={btnPrimary}
            disabled={savingName || !nameDirty || !deckName.trim()}
          >
            {savingName ? "Saving…" : "Save name"}
          </button>
        </form>
        <dl className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
          <div>
            <dt className="font-medium text-slate-500">Slug</dt>
            <dd>
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-800">
                {deck.slug}
              </code>
            </dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">Status</dt>
            <dd>
              {deck.publishedAt ? (
                <span className="inline-flex items-center rounded-full border border-[#c5d9ef] bg-[#eef4fc] px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-[#2f6fb8]">
                  Published
                </span>
              ) : (
                <span className="text-slate-600">Draft</span>
              )}
            </dd>
          </div>
        </dl>
      </section>

      <section className={panel} aria-labelledby="community-catalog-title">
        <h2 id="community-catalog-title" className={panelTitle}>
          Community catalog
        </h2>
        <p className="mb-4 text-sm leading-relaxed text-slate-600">
          {cards.length === 0
            ? "This deck needs at least one card before it can be published to Import community cards."
            : deck.publishedAt
              ? "This deck is live. Republish after edits, or unpublish to hide it from new imports."
              : "Publishing copies these cards to the community catalog so learners can import them."}
        </p>
        {deck.publishedTagSlug ? (
          <p className="mb-4 text-sm text-slate-600">
            Community tag:{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-800">
              {deck.publishedTagSlug}
            </code>
          </p>
        ) : null}
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className={btnPrimary}
            onClick={() => setPublishConfirmOpen(true)}
            disabled={publishing || cards.length === 0}
          >
            {publishing
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
              disabled={unpublishing}
            >
              {unpublishing ? "Unpublishing…" : "Unpublish"}
            </button>
          ) : null}
        </div>
      </section>

      <section className={panel} aria-labelledby="deck-cards-title">
        <h2 id="deck-cards-title" className={panelTitle}>
          Cards ({cards.length})
        </h2>

        {cards.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
            <p className="text-sm font-medium text-slate-700">
              No cards in this deck
            </p>
            <p className="mt-1 text-sm text-slate-500">
              The owner must add vocabulary cards before you can publish this deck.
            </p>
          </div>
        ) : (
          <div className="tags-table-wrap -mx-1 px-1">
            <table className="tags-table">
              <thead>
                <tr>
                  <th scope="col">Headword</th>
                  <th scope="col">Gloss</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cards.map((card) => (
                  <tr key={card.domId}>
                    <td className="font-medium text-slate-900">{card.head}</td>
                    <td className="text-slate-600">
                      {(card.gloss ?? []).join("; ") || "—"}
                    </td>
                    <td className="tags-table__actions">
                      <button
                        type="button"
                        className={btnSecondary}
                        onClick={() => openEdit(card)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
        loading={publishing}
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
        loading={unpublishing}
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
