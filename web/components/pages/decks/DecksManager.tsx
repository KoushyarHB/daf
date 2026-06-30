"use client";

import Link from "next/link";
import { useCallback, useState } from "react";

import ConfirmModal from "@/components/shared/ConfirmModal";
import { useToast } from "@/components/shared/toast/ToastProvider";
import {
  useCreateDeckMutation,
  useDecksQuery,
  useDeleteDeckMutation,
  type DeckRow,
} from "@/hooks/decks";
import { getApiErrorMessage } from "@/services/frontend/http";
import { CEFR_LEVELS } from "@/lib/vocab/levels";

type DecksManagerProps = {
  initialDecks: DeckRow[];
};

export default function DecksManager({ initialDecks }: DecksManagerProps) {
  const toast = useToast();
  const decksQuery = useDecksQuery({ initialData: initialDecks });
  const createDeck = useCreateDeckMutation();
  const deleteDeck = useDeleteDeckMutation();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [level, setLevel] = useState("A1");
  const [deleteTarget, setDeleteTarget] = useState<DeckRow | null>(null);

  const decks = decksQuery.data ?? [];
  const loading = decksQuery.isLoading;

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setCreating(true);
    try {
      await createDeck.mutateAsync({ name: trimmed, level });
      toast.success("Deck created");
      setName("");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Create failed"));
    } finally {
      setCreating(false);
    }
  }

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    const deck = deleteTarget;
    try {
      await deleteDeck.mutateAsync(deck.id);
      toast.success("Deck deleted");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Delete failed"));
    }
  }, [deleteTarget, deleteDeck, toast]);

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
                      disabled={deleteDeck.isPending && deleteTarget?.id === deck.id}
                    >
                      {deleteDeck.isPending && deleteTarget?.id === deck.id
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
        loading={deleteDeck.isPending}
        onConfirm={() => void confirmDelete()}
        onCancel={() => {
          if (!deleteDeck.isPending) setDeleteTarget(null);
        }}
      />
    </div>
  );
}
