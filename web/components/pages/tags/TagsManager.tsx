"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";

import ConfirmModal from "@/components/shared/ConfirmModal";
import { useToast } from "@/components/shared/toast/ToastProvider";
import { getApiErrorMessage } from "@/services/frontend/http";
import {
  useDeleteTagMutation,
  useTagsQuery,
  type TagRow,
} from "@/hooks/tags";
import { canModifyTag } from "@/lib/tags/permissions";

type TagsManagerProps = {
  initialTags?: TagRow[];
};

export default function TagsManager({ initialTags }: TagsManagerProps) {
  const toast = useToast();
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const role = session?.user?.role ?? "user";
  const tagsQuery = useTagsQuery({
    enabled: initialTags === undefined,
    initialData: initialTags,
  });
  const deleteTag = useDeleteTagMutation();
  const [deleteTarget, setDeleteTarget] = useState<TagRow | null>(null);

  const tags = tagsQuery.data ?? initialTags ?? [];
  const loading = tagsQuery.isLoading && tags.length === 0;

  function canEdit(tag: TagRow): boolean {
    if (!userId) return false;
    return canModifyTag(tag, userId, role);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const tag = deleteTarget;
    try {
      await deleteTag.mutateAsync(tag.id);
      toast.success("Tag deleted");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Delete failed"));
    }
  }

  if (loading) {
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
                          disabled={deleteTag.isPending && deleteTarget?.id === tag.id}
                        >
                          {deleteTag.isPending && deleteTarget?.id === tag.id
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
        loading={deleteTag.isPending}
        onConfirm={() => void confirmDelete()}
        onCancel={() => {
          if (!deleteTag.isPending) setDeleteTarget(null);
        }}
      />
    </div>
  );
}
