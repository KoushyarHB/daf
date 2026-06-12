"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { useToast } from "@/components/shared/toast/ToastProvider";

type TagRow = {
  id: string;
  slug: string;
  label: string;
  cardCount?: number;
};

export default function TagsManager() {
  const toast = useToast();
  const [tags, setTags] = useState<TagRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    void fetch("/api/tags?counts=true&pageSize=100")
      .then((r) => r.json())
      .then((data: { items?: TagRow[] }) => {
        setTags(data.items ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function onDelete(tag: TagRow) {
    if (
      !window.confirm(
        `Delete tag “${tag.label}”? This only works when no cards use it.`,
      )
    ) {
      return;
    }
    setDeletingId(tag.id);
    try {
      const res = await fetch(`/api/tags/${encodeURIComponent(tag.id)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? `Delete failed (${res.status})`);
      }
      toast.success("Tag deleted");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return <p className="deck-hint">Loading tags…</p>;
  }

  return (
    <div className="tags-page">
      <div className="tags-page__header">
        <h1 className="tags-page__title">Tags</h1>
        <Link href="/tags/new" className="tags-page__new">
          + New tag
        </Link>
      </div>
      <p className="tags-page__intro">
        Tags organize cards and community import bundles. Cards can have multiple
        tags; filter the deck by tag on the vocabulary page.
      </p>

      {tags.length === 0 ? (
        <p className="deck-hint">No tags yet.</p>
      ) : (
        <table className="tags-table">
          <thead>
            <tr>
              <th scope="col">Label</th>
              <th scope="col">Slug</th>
              <th scope="col">Cards</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tags.map((tag) => (
              <tr key={tag.id}>
                <td>{tag.label}</td>
                <td>
                  <code>{tag.slug}</code>
                </td>
                <td>{tag.cardCount ?? 0}</td>
                <td className="tags-table__actions">
                  <Link href={`/tags/${encodeURIComponent(tag.id)}/edit`}>
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => void onDelete(tag)}
                    disabled={deletingId === tag.id}
                  >
                    {deletingId === tag.id ? "Deleting…" : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p className="tags-page__back">
        <Link href="/">← Back to vocabulary</Link>
      </p>
    </div>
  );
}
