"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import ConfirmModal from "@/components/shared/ConfirmModal";
import { useToast } from "@/components/shared/toast/ToastProvider";
import { writeRouteCache } from "@/lib/client/route-data-cache";
import type { AdminDeckDto } from "@/services/admin-decks.service";

type AdminPublishPanelProps = {
  initialDecks?: AdminDeckDto[];
};

export default function AdminPublishPanel({ initialDecks }: AdminPublishPanelProps) {
  const toast = useToast();
  const [q, setQ] = useState("");
  const [decks, setDecks] = useState<AdminDeckDto[]>(initialDecks ?? []);
  const [loading, setLoading] = useState(initialDecks === undefined);
  const [hasLoaded, setHasLoaded] = useState(initialDecks !== undefined);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [unpublishingId, setUnpublishingId] = useState<string | null>(null);
  const [publishTarget, setPublishTarget] = useState<AdminDeckDto | null>(null);
  const [unpublishTarget, setUnpublishTarget] = useState<AdminDeckDto | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ pageSize: "50" });
    if (q.trim()) params.set("q", q.trim());
    void fetch(`/api/admin/decks?${params}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: { items?: AdminDeckDto[] }) => {
        const items = data.items ?? [];
        setDecks(items);
        writeRouteCache("admin-decks", items);
        setHasLoaded(true);
        setLoading(false);
      })
      .catch((err) => {
        toast.error(err instanceof Error ? err.message : "Failed to load decks");
        setHasLoaded(true);
        setLoading(false);
      });
  }, [q, toast]);

  useEffect(() => {
    if (initialDecks !== undefined && q.trim() === "") return;
    const t = window.setTimeout(load, 300);
    return () => window.clearTimeout(t);
  }, [load, initialDecks, q]);

  async function onPublish(deck: AdminDeckDto) {
    setPublishingId(deck.id);
    try {
      const res = await fetch(
        `/api/admin/decks/${encodeURIComponent(deck.id)}/publish`,
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
          ? `Republished ${data.cardCount} cards as tag “${data.tag?.label}”`
          : `Published ${data.cardCount} cards as tag “${data.tag?.label}” (${data.tag?.slug})`,
      );
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Publish failed");
    } finally {
      setPublishingId(null);
      setPublishTarget(null);
    }
  }

  async function onUnpublish(deck: AdminDeckDto) {
    setUnpublishingId(deck.id);
    try {
      const res = await fetch(
        `/api/admin/decks/${encodeURIComponent(deck.id)}/unpublish`,
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
        `Unpublished — removed ${data.removedCardCount ?? 0} community cards`,
      );
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unpublish failed");
    } finally {
      setUnpublishingId(null);
      setUnpublishTarget(null);
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

      {loading && !hasLoaded ? (
        <p className="deck-hint">Loading decks…</p>
      ) : decks.length === 0 ? (
        <p className="deck-hint">No decks found.</p>
      ) : (
        <div className={`tags-table-wrap${loading ? " tags-table-wrap--refreshing" : ""}`}>
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
                    disabled={publishingId === deck.id || deck.cardCount === 0}
                  >
                    {publishingId === deck.id
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
                      disabled={unpublishingId === deck.id}
                    >
                      {unpublishingId === deck.id ? "Unpublishing…" : "Unpublish"}
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
        loading={publishingId !== null}
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
        loading={unpublishingId !== null}
        onConfirm={() => {
          if (unpublishTarget) void onUnpublish(unpublishTarget);
        }}
        onCancel={() => setUnpublishTarget(null)}
      />
    </div>
  );
}
