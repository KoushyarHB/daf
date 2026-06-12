"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useToast } from "@/components/shared/toast/ToastProvider";
import { slugifyLabel } from "@/lib/tags/slug";

type TagFormProps = {
  mode: "create" | "edit";
  tagId?: string;
  initial?: { slug: string; label: string };
};

export default function TagForm({ mode, tagId, initial }: TagFormProps) {
  const router = useRouter();
  const toast = useToast();
  const [label, setLabel] = useState(initial?.label ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onLabelChange(value: string) {
    setLabel(value);
    if (!slugTouched) {
      setSlug(slugifyLabel(value));
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const body = {
      label: label.trim(),
      slug: slug.trim() || undefined,
    };

    try {
      const url =
        mode === "create"
          ? "/api/tags"
          : `/api/tags/${encodeURIComponent(tagId ?? "")}`;
      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        throw new Error(
          typeof data.error === "string" ? data.error : `Save failed (${res.status})`,
        );
      }
      toast.success(mode === "create" ? "Tag created" : "Tag updated");
      router.push("/tags");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Save failed";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="tag-form" onSubmit={onSubmit}>
      <h1 className="tag-form__title">
        {mode === "create" ? "New tag" : "Edit tag"}
      </h1>

      <label>
        Label
        <input
          value={label}
          onChange={(e) => onLabelChange(e.target.value)}
          required
          placeholder="daf lek. 3"
        />
      </label>

      <label>
        Slug
        <input
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value);
          }}
          required
          pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
          placeholder="daf-lek-3"
        />
      </label>

      {error ? <p className="tag-form__error">{error}</p> : null}

      <div className="tag-form__actions">
        <Link href="/tags" className="tag-form__cancel">
          Cancel
        </Link>
        <button type="submit" disabled={saving}>
          {saving ? "Saving…" : mode === "create" ? "Create tag" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
