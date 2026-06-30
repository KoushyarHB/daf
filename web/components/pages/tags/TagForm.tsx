"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useToast } from "@/components/shared/toast/ToastProvider";
import { getApiErrorMessage } from "@/services/frontend/http";
import { useSaveTagMutation } from "@/hooks/tags";
import { slugifyLabel } from "@/lib/tags/slug";
import {
  formInputClass,
  formPlaceholderClass,
} from "@/lib/styles/formControls";
import {
  formLabelClass,
  tagFormActionsClass,
  tagFormCancelClass,
  tagFormClass,
  tagFormErrorClass,
  tagFormSubmitClass,
  tagFormTitleClass,
} from "@/lib/styles/tagsPage";

type TagFormProps = {
  mode: "create" | "edit";
  tagId?: string;
  initial?: { slug: string; label: string };
};

export default function TagForm({ mode, tagId, initial }: TagFormProps) {
  const router = useRouter();
  const toast = useToast();
  const saveTag = useSaveTagMutation();
  const [label, setLabel] = useState(initial?.label ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [error, setError] = useState<string | null>(null);

  function onLabelChange(value: string) {
    setLabel(value);
    if (!slugTouched) {
      setSlug(slugifyLabel(value));
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const body = {
      label: label.trim(),
      slug: slug.trim() || undefined,
    };

    try {
      await saveTag.mutateAsync({ mode, tagId, body });
      toast.success(mode === "create" ? "Tag created" : "Tag updated");
      router.push("/tags");
      router.refresh();
    } catch (err) {
      const message = getApiErrorMessage(err, "Save failed");
      setError(message);
      toast.error(message);
    }
  }

  return (
    <form className={tagFormClass} onSubmit={onSubmit}>
      <h1 className={tagFormTitleClass}>
        {mode === "create" ? "New tag" : "Edit tag"}
      </h1>

      <label className={formLabelClass}>
        Label
        <input
          className={`${formInputClass} ${formPlaceholderClass}`}
          value={label}
          onChange={(e) => onLabelChange(e.target.value)}
          required
          placeholder="daf lek. 3"
        />
      </label>

      <label className={formLabelClass}>
        Slug
        <input
          className={`${formInputClass} ${formPlaceholderClass}`}
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

      {error ? <p className={tagFormErrorClass}>{error}</p> : null}

      <div className={tagFormActionsClass}>
        <Link href="/tags" className={tagFormCancelClass}>
          Cancel
        </Link>
        <button type="submit" className={tagFormSubmitClass} disabled={saveTag.isPending}>
          {saveTag.isPending
            ? "Saving…"
            : mode === "create"
              ? "Create tag"
              : "Save changes"}
        </button>
      </div>
    </form>
  );
}
