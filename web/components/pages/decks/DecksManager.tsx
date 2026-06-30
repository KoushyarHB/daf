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
import {
  formInputClass,
  formPlaceholderClass,
  formSelectClass,
} from "@/lib/styles/formControls";
import { tagsPageTitleClass } from "@/lib/styles/pageTitle";
import {
  deckHintClass,
  decksCreateFormClass,
  decksCreateSubmitClass,
  formLabelClass,
  systemBadgeClass,
  tagsPageClass,
  tagsPageHeaderClass,
  tagsPageIntroClass,
  tagsTableActionGapClass,
  tagsTableActionLinkClass,
  tagsTableActionsClass,
  tagsTableBtnDangerClass,
  tagsTableDecksActionsColClass,
  tagsTableDecksClass,
  tagsTableThTdClass,
  tagsTableWrapClass,
} from "@/lib/styles/tagsPage";

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
      <div className={tagsPageClass}>
        <div className={tagsPageHeaderClass}>
          <h1 className={tagsPageTitleClass}>My decks</h1>
        </div>
        <p className={deckHintClass}>Loading decks…</p>
      </div>
    );
  }

  return (
    <div className={tagsPageClass}>
      <div className={tagsPageHeaderClass}>
        <h1 className={tagsPageTitleClass}>My decks</h1>
      </div>
      <p className={tagsPageIntroClass}>
        Every card belongs to a deck. Decks you create as super admin are marked{" "}
        <span className={systemBadgeClass}>system</span>; other decks are personal.
      </p>

      <form className={decksCreateFormClass} onSubmit={onCreate}>
        <label className={formLabelClass}>
          New deck name
          <input
            className={`${formInputClass} ${formPlaceholderClass}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Lektion 3 vocab"
            required
          />
        </label>
        <label className={formLabelClass}>
          Default level
          <select
            className={formSelectClass}
            value={level}
            onChange={(e) => setLevel(e.target.value)}
          >
            {CEFR_LEVELS.map((lv) => (
              <option key={lv} value={lv}>
                {lv}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className={decksCreateSubmitClass}
          disabled={creating || !name.trim()}
        >
          {creating ? "Creating…" : "+ Create deck"}
        </button>
      </form>

      {decks.length === 0 ? (
        <p className={deckHintClass}>No decks yet.</p>
      ) : (
        <div className={tagsTableWrapClass}>
          <table className={tagsTableDecksClass}>
            <thead>
              <tr>
                <th scope="col" className={tagsTableThTdClass}>Name</th>
                <th scope="col" className={tagsTableThTdClass}>Slug</th>
                <th scope="col" className={tagsTableThTdClass}>Type</th>
                <th scope="col" className={tagsTableThTdClass}>Cards</th>
                <th scope="col" className={tagsTableThTdClass}>Published</th>
                <th scope="col" className={`${tagsTableThTdClass} ${tagsTableDecksActionsColClass}`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {decks.map((deck) => (
                <tr key={deck.id}>
                  <td className={tagsTableThTdClass}>{deck.name}</td>
                  <td className={tagsTableThTdClass}>
                    <code>{deck.slug}</code>
                  </td>
                  <td className={tagsTableThTdClass}>
                    {deck.isSystem ? (
                      <span className={systemBadgeClass}>system</span>
                    ) : (
                      "user"
                    )}
                  </td>
                  <td className={tagsTableThTdClass}>{deck.cardCount}</td>
                  <td className={tagsTableThTdClass}>{deck.publishedAt ? "Yes" : "No"}</td>
                  <td className={`${tagsTableThTdClass} ${tagsTableDecksActionsColClass} ${tagsTableActionsClass}`}>
                    <Link
                      href={`/?deck=${encodeURIComponent(deck.id)}`}
                      className={tagsTableActionLinkClass}
                    >
                      View cards
                    </Link>
                    <button
                      type="button"
                      className={`${tagsTableBtnDangerClass} ${tagsTableActionGapClass}`}
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
