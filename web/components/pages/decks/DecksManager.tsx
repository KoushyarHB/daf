"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import ConfirmModal from "@/components/shared/ConfirmModal";
import { useToast } from "@/components/shared/toast/ToastProvider";
import { writeRouteCache } from "@/lib/client/route-data-cache";
import { CEFR_LEVELS } from "@/lib/vocab/levels";

type DeckRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  level: string;
  isSystem: boolean;
  cardCount: number;
  publishedAt: string | null;
  publishedTagSlug: string | null;
};

type DecksManagerProps = {
  initialDecks: DeckRow[];
};

export default function DecksManager({ initialDecks }: DecksManagerProps) {
  const toast = useToast();
  const [decks, setDecks] = useState<DeckRow[]>(initialDecks);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [level, setLevel] = useState("A1");
  const [deleteTarget, setDeleteTarget] = useState<DeckRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    void fetch("/api/decks?pageSize=100")
      .then((r) => r.json())
      .then((data: { items?: DeckRow[] }) => {
        const items = data.items ?? [];
        setDecks(items);
        writeRouteCache("decks", items);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    writeRouteCache("decks", initialDecks);
  }, [initialDecks]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setCreating(true);
    try {
      const res = await fetch("/api/decks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed, level }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? `Create failed (${res.status})`);
      }
      toast.success("Deck created");
      setName("");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Create failed");
    } finally {
      setCreating(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const deck = deleteTarget;
    try {
      const res = await fetch(`/api/decks/${encodeURIComponent(deck.id)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? `Delete failed (${res.status})`);
      }
      toast.success("Deck deleted");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  }

  if (loading && decks.length === 0) {
    return (
      <div className="tags-page">
        <div className="tags-page__header">
          <h1 className="tags-page__title">My decks</h1>
        </div>
        <p className="deck-hint">Loading decks…</p>
      </div>
    );
  }

  return (
    <div className="tags-page">
      <div className="tags-page__header">
        <h1 className="tags-page__title">My decks</h1>
      </div>
      <p className="tags-page__intro">
        Every card belongs to a deck. Decks you create as super admin are marked{" "}
        <span className="system-badge">system</span>; other decks are personal.
      </p>

      <form className="decks-create-form" onSubmit={onCreate}>
        <label>
          New deck name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Lektion 3 vocab"
            required
          />
        </label>
        <label>
          Default level
          <select value={level} onChange={(e) => setLevel(e.target.value)}>
            {CEFR_LEVELS.map((lv) => (
              <option key={lv} value={lv}>
                {lv}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" disabled={creating || !name.trim()}>
          {creating ? "Creating…" : "+ Create deck"}
        </button>
      </form>

      {decks.length === 0 ? (
        <p className="deck-hint">No decks yet.</p>
      ) : (
        <div className="tags-table-wrap">
          <table className="tags-table tags-table--decks">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Slug</th>
                <th scope="col">Type</th>
                <th scope="col">Cards</th>
                <th scope="col">Published</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {decks.map((deck) => (
                <tr key={deck.id}>
                  <td>{deck.name}</td>
                  <td>
                    <code>{deck.slug}</code>
                  </td>
                  <td>
                    {deck.isSystem ? (
                      <span className="system-badge">system</span>
                    ) : (
                      "user"
                    )}
                  </td>
                  <td>{deck.cardCount}</td>
                  <td>{deck.publishedAt ? "Yes" : "No"}</td>
                  <td className="tags-table__actions">
                    <Link href={`/?deck=${encodeURIComponent(deck.id)}`}>
                      View cards
                    </Link>
                    <button
                      type="button"
                      className="tags-table__btn-danger"
                      onClick={() => setDeleteTarget(deck)}
                      disabled={deleting && deleteTarget?.id === deck.id}
                    >
                      {deleting && deleteTarget?.id === deck.id
                        ? "Deleting…"
                        : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        open={deleteTarget !== null}
        title="Delete deck"
        message={
          deleteTarget
            ? `Delete deck “${deleteTarget.name}”? It must be empty and you need at least one other deck.`
            : ""
        }
        confirmLabel="Delete"
        danger
        loading={deleting}
        onConfirm={() => void confirmDelete()}
        onCancel={() => {
          if (!deleting) setDeleteTarget(null);
        }}
      />
    </div>
  );
}
