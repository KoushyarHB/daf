"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import type { z } from "zod";

import { useToast } from "@/components/shared/toast/ToastProvider";
import { getApiErrorMessage } from "@/services/frontend/http";
import { useSaveTagMutation } from "@/hooks/tags";
import { tagFormSchema } from "@/lib/api/schemas";
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

type TagFormValues = z.infer<typeof tagFormSchema>;

type TagFormProps = {
  mode: "create" | "edit";
  tagId?: string;
  initial?: { slug: string; label: string };
};

export default function TagForm({ mode, tagId, initial }: TagFormProps) {
  const router = useRouter();
  const toast = useToast();
  const saveTag = useSaveTagMutation();
  const slugTouched = useRef(mode === "edit");

  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<TagFormValues>({
    resolver: zodResolver(tagFormSchema),
    defaultValues: {
      label: initial?.label ?? "",
      slug: initial?.slug ?? "",
    },
  });

  const label = useWatch({ control, name: "label" }) ?? "";

  useEffect(() => {
    if (!slugTouched.current) {
      setValue("slug", slugifyLabel(label));
    }
  }, [label, setValue]);

  async function onSubmit(values: TagFormValues) {
    const body = {
      label: values.label.trim(),
      slug: values.slug.trim(),
    };

    try {
      await saveTag.mutateAsync({ mode, tagId, body });
      toast.success(mode === "create" ? "Tag created" : "Tag updated");
      router.push("/tags");
      router.refresh();
    } catch (err) {
      const message = getApiErrorMessage(err, "Save failed");
      setError("root", { message });
      toast.error(message);
    }
  }

  return (
    <form className={tagFormClass} onSubmit={handleSubmit(onSubmit)}>
      <h1 className={tagFormTitleClass}>
        {mode === "create" ? "New tag" : "Edit tag"}
      </h1>

      <label className={formLabelClass}>
        Label
        <input
          className={`${formInputClass} ${formPlaceholderClass}`}
          placeholder="daf lek. 3"
          {...register("label")}
        />
        {errors.label ? (
          <span className={tagFormErrorClass}>{errors.label.message}</span>
        ) : null}
      </label>

      <label className={formLabelClass}>
        Slug
        <input
          className={`${formInputClass} ${formPlaceholderClass}`}
          placeholder="daf-lek-3"
          {...register("slug", {
            onChange: () => {
              slugTouched.current = true;
            },
          })}
        />
        {errors.slug ? (
          <span className={tagFormErrorClass}>{errors.slug.message}</span>
        ) : null}
      </label>

      {errors.root ? (
        <p className={tagFormErrorClass}>{errors.root.message}</p>
      ) : null}

      <div className={tagFormActionsClass}>
        <Link href="/tags" className={tagFormCancelClass}>
          Cancel
        </Link>
        <button
          type="submit"
          className={tagFormSubmitClass}
          disabled={isSubmitting || saveTag.isPending}
        >
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
