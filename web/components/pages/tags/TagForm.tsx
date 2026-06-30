"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import type { z } from "zod";

import Input from "@/components/shared/atoms/Input";
import FormActions from "@/components/shared/molecules/FormActions";
import FormField from "@/components/shared/molecules/FormField";
import { useToast } from "@/components/providers/ToastProvider";
import { getApiErrorMessage } from "@/services/frontend/http";
import { useSaveTagMutation } from "@/hooks/tags";
import { tagFormSchema } from "@/lib/api/schemas";
import { slugifyLabel } from "@/lib/tags/slug";
import {
  tagFormClass,
  tagFormErrorClass,
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
  const [slugTouched, setSlugTouched] = useState(mode === "edit");

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

  const { onChange: onSlugChange, ...slugField } = register("slug");
  const label = useWatch({ control, name: "label" }) ?? "";

  useEffect(() => {
    if (!slugTouched) {
      setValue("slug", slugifyLabel(label));
    }
  }, [label, setValue, slugTouched]);

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

      <FormField
        label="Label"
        error={errors.label?.message}
      >
        <Input placeholder="daf lek. 3" {...register("label")} />
      </FormField>

      <FormField
        label="Slug"
        error={errors.slug?.message}
      >
        <Input
          placeholder="daf-lek-3"
          {...slugField}
          onChange={(e) => {
            setSlugTouched(true);
            void onSlugChange(e);
          }}
        />
      </FormField>

      {errors.root ? (
        <p className={tagFormErrorClass}>{errors.root.message}</p>
      ) : null}

      <FormActions
        cancelHref="/tags"
        submitLabel={
          saveTag.isPending
            ? "Saving…"
            : mode === "create"
              ? "Create tag"
              : "Save changes"
        }
        submitting={isSubmitting || saveTag.isPending}
      />
    </form>
  );
}
