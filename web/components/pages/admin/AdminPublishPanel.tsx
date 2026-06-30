"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import ConfirmModal from "@/components/shared/ConfirmModal";
import { useToast } from "@/components/shared/toast/ToastProvider";
import { getApiErrorMessage } from "@/services/frontend/http";
import {
  useAdminDecksQuery,
  usePublishAdminDeckMutation,
  useUnpublishAdminDeckMutation,
} from "@/hooks/admin";
import type { AdminDeckDto } from "@/lib/api/dto";

type AdminPublishPanelProps = {
  initialDecks?: AdminDeckDto[];
};

export default function AdminPublishPanel({ initialDecks }: AdminPublishPanelProps) {
  const toast = useToast();
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [publishTarget, setPublishTarget] = useState<AdminDeckDto | null>(null);
  const [unpublishTarget, setUnpublishTarget] = useState<AdminDeckDto | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQ(q), 300);
    return () => window.clearTimeout(t);
  }, [q]);

  const skipInitial = initialDecks !== undefined && debouncedQ.trim() === "";
  const decksQuery = useAdminDecksQuery(debouncedQ, {
    enabled: initialDecks === undefined || debouncedQ.trim() !== "",
    initialData: skipInitial ? initialDecks : undefined,
  });
  const publishDeck = usePublishAdminDeckMutation();
  const unpublishDeck = useUnpublishAdminDeckMutation();

  const decks = skipInitial ? (initialDecks ?? []) : (decksQuery.data ?? []);
  const loading = decksQuery.isLoading && decks.length === 0;
  const refreshing = decksQuery.isFetching && !decksQuery.isLoading;

  async function onPublish(deck: AdminDeckDto) {
    try {
      const data = await publishDeck.mutateAsync(deck.id);
      toast.success(
        data.republished
          ? `Republished ${data.cardCount} cards as tag “${data.tag?.label}”`
          : `Published ${data.cardCount} cards as tag “${data.tag?.label}” (${data.tag?.slug})`,
      );
      setPublishTarget(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Publish failed"));
    }
  }

  async function onUnpublish(deck: AdminDeckDto) {
    try {
      const data = await unpublishDeck.mutateAsync(deck.id);
      toast.success(
        `Unpublished — removed ${data.removedCardCount ?? 0} community cards`,
      );
      setUnpublishTarget(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Unpublish failed"));
    }
  }

  return (
    <div className="tags-page">
      <div className="tags-page__header">
        <h1 className="tags-page__title">Publish user decks</h1>
      </div>
      <p className="tags-page__intro">
        Copy a user&apos;s deck to the community catalog and expose it as an
        importable tag bundle. The user&apos;s original deck is unchanged.
      </p>

      <div className="admin-search">
        <label className="admin-search__label" htmlFor="admin-publish-q">
          Search by deck name or owner email
        </label>
        <input
          id="admin-publish-q"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search…"
        />
      </div>

      {loading ? (
        <p className="deck-hint">Loading decks…</p>
      ) : decks.length === 0 ? (
        <p className="deck-hint">No decks found.</p>
      ) : (
        <div className={`tags-table-wrap${refreshing ? " tags-table-wrap--refreshing" : ""}`}>
        <table className="tags-table">
          <thead>
            <tr>
              <th scope="col">Deck</th>
              <th scope="col">Owner</th>
              <th scope="col">Cards</th>
              <th scope="col">Published</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {decks.map((deck) => (
              <tr key={deck.id}>
                <td>
                  {deck.name} <code>{deck.slug}</code>
                </td>
                <td>
                  {deck.ownerName ? `${deck.ownerName} — ` : ""}
                  {deck.ownerEmail}
                </td>
                <td>{deck.cardCount}</td>
                <td>
                  {deck.publishedAt ? (
                    <>
                      {deck.publishedTagSlug ? (
                        <code>{deck.publishedTagSlug}</code>
                      ) : (
                        "Yes"
                      )}
                    </>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="tags-table__actions">
                  <Link
                    href={`/admin/publish/${encodeURIComponent(deck.id)}`}
                    className="tags-table__btn-secondary"
                  >
                    Review
                  </Link>
                  <button
                    type="button"
                    className="tags-table__btn-primary"
                    onClick={() => setPublishTarget(deck)}
                    disabled={publishDeck.isPending && publishDeck.variables === deck.id}
                  >
                    {publishDeck.isPending && publishDeck.variables === deck.id
                      ? "Publishing…"
                      : deck.publishedAt
                        ? "Republish"
                        : "Publish"}
                  </button>
                  {deck.publishedAt ? (
                    <button
                      type="button"
                      className="tags-table__btn-danger"
                      onClick={() => setUnpublishTarget(deck)}
                      disabled={unpublishDeck.isPending && unpublishDeck.variables === deck.id}
                    >
                      {unpublishDeck.isPending && unpublishDeck.variables === deck.id
                        ? "Unpublishing…"
                        : "Unpublish"}
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}

      <ConfirmModal
        open={publishTarget !== null}
        title={publishTarget?.publishedAt ? "Republish deck" : "Publish deck"}
        message={
          publishTarget
            ? `Publish “${publishTarget.name}” by ${publishTarget.ownerEmail} to the community catalog? ` +
              `Learners can import it via Import community cards (${publishTarget.cardCount} cards).`
            : ""
        }
        confirmLabel={publishTarget?.publishedAt ? "Republish" : "Publish"}
        loading={publishDeck.isPending}
        onConfirm={() => {
          if (publishTarget) void onPublish(publishTarget);
        }}
        onCancel={() => setPublishTarget(null)}
      />

      <ConfirmModal
        open={unpublishTarget !== null}
        title="Unpublish deck"
        message={
          unpublishTarget
            ? `Remove “${unpublishTarget.name}” from the community catalog? ` +
              `The bundle will no longer appear for new imports.`
            : ""
        }
        confirmLabel="Unpublish"
        danger
        loading={unpublishDeck.isPending}
        onConfirm={() => {
          if (unpublishTarget) void onUnpublish(unpublishTarget);
        }}
        onCancel={() => setUnpublishTarget(null)}
      />
    </div>
  );
}
