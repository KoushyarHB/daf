"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";

import ConfirmModal from "@/components/shared/ConfirmModal";
import { useToast } from "@/components/shared/toast/ToastProvider";
import { writeRouteCache } from "@/lib/client/route-data-cache";
import { canModifyTag } from "@/lib/tags/permissions";

type TagRow = {
  id: string;
  slug: string;
  label: string;
  isSystem: boolean;
  createdById: string | null;
  cardCount?: number;
};

type TagsManagerProps = {
  initialTags?: TagRow[];
};

export default function TagsManager({ initialTags }: TagsManagerProps) {
  const toast = useToast();
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const role = session?.user?.role ?? "user";
  const [tags, setTags] = useState<TagRow[]>(initialTags ?? []);
  const [loading, setLoading] = useState(initialTags === undefined);
  const [deleteTarget, setDeleteTarget] = useState<TagRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    void fetch("/api/tags?counts=true&pageSize=100")
      .then((r) => r.json())
      .then((data: { items?: TagRow[] }) => {
        const items = data.items ?? [];
        setTags(items);
        writeRouteCache("tags", items);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (initialTags !== undefined) return;
    load();
  }, [load, initialTags]);

  function canEdit(tag: TagRow): boolean {
    if (!userId) return false;
    return canModifyTag(tag, userId, role);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const tag = deleteTarget;
    try {
      const res = await fetch(`/api/tags/${encodeURIComponent(tag.id)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? `Delete failed (${res.status})`);
      }
      toast.success("Tag deleted");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  }

  if (loading && tags.length === 0) {
    return (
      <div className="tags-page">
        <div className="tags-page__header">
          <h1 className="tags-page__title">Tags</h1>
          <Link href="/tags/new" className="tags-page__new">
            + New tag
          </Link>
        </div>
        <p className="deck-hint">Loading tags…</p>
      </div>
    );
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
        Tags organize cards and import bundles. Your tags are personal; tags you
        create as super admin are marked <span className="system-badge">system</span>{" "}
        and can only be edited by super admins.
      </p>

      {tags.length === 0 ? (
        <p className="deck-hint">No tags yet.</p>
      ) : (
        <div className="tags-table-wrap">
        <table className="tags-table">
          <thead>
            <tr>
              <th scope="col">Label</th>
              <th scope="col">Slug</th>
              <th scope="col">Type</th>
              <th scope="col">Cards</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tags.map((tag) => {
              const editable = canEdit(tag);
              return (
                <tr key={tag.id}>
                  <td>{tag.label}</td>
                  <td>
                    <code>{tag.slug}</code>
                  </td>
                  <td>
                    {tag.isSystem ? (
                      <span className="system-badge">system</span>
                    ) : (
                      "user"
                    )}
                  </td>
                  <td>{tag.cardCount ?? 0}</td>
                  <td className="tags-table__actions">
                    {editable ? (
                      <>
                        <Link href={`/tags/${encodeURIComponent(tag.id)}/edit`}>
                          Edit
                        </Link>
                        <button
                          type="button"
                          className="tags-table__btn-danger"
                          onClick={() => setDeleteTarget(tag)}
                          disabled={deleting && deleteTarget?.id === tag.id}
                        >
                          {deleting && deleteTarget?.id === tag.id
                            ? "Deleting…"
                            : "Delete"}
                        </button>
                      </>
                    ) : (
                      <span className="tags-table__muted">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      )}

      <p className="tags-page__back">
        <Link href="/">← Back to vocabulary</Link>
      </p>

      <ConfirmModal
        open={deleteTarget !== null}
        title="Delete tag"
        message={
          deleteTarget
            ? `Delete tag “${deleteTarget.label}”? This only works when no cards use it.`
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
