"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useId, useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import Button from "@/components/shared/atoms/Button";
import FieldError from "@/components/shared/atoms/FieldError";
import InlineCode from "@/components/shared/atoms/InlineCode";
import Textarea from "@/components/shared/atoms/Textarea";
import FormField from "@/components/shared/molecules/FormField";
import ModalActions from "@/components/shared/molecules/ModalActions";
import ModalShell from "@/components/shared/molecules/ModalShell";
import { cardJsonFillFormSchema } from "@/lib/api/schemas";
import {
  manifestCardSampleJson,
  parseManifestCardJson,
  type ManifestCardFillResult,
} from "@/lib/vocab/manifest-card-fill";

type CardJsonFillModalProps = {
  open: boolean;
  initialJson: string;
  onApply: (result: ManifestCardFillResult) => void;
  onClose: () => void;
};

type JsonFillValues = z.infer<typeof cardJsonFillFormSchema>;

export default function CardJsonFillModal({
  open,
  initialJson,
  onApply,
  onClose,
}: CardJsonFillModalProps) {
  const textareaId = useId();
  const [parseError, setParseError] = useState<string | null>(null);
  const [openSnapshot, setOpenSnapshot] = useState<{
    open: boolean;
    initialJson: string;
  }>({ open, initialJson });

  const { register, handleSubmit, reset, setValue, getValues } =
    useForm<JsonFillValues>({
      resolver: zodResolver(cardJsonFillFormSchema),
      defaultValues: { jsonText: initialJson },
    });

  if (
    open &&
    (open !== openSnapshot.open || initialJson !== openSnapshot.initialJson)
  ) {
    setOpenSnapshot({ open, initialJson });
    setParseError(null);
  } else if (!open && openSnapshot.open) {
    setOpenSnapshot({ open, initialJson });
  }

  useEffect(() => {
    if (!open) return;
    reset({ jsonText: initialJson });
  }, [open, initialJson, reset]);

  function onPasteSample() {
    setValue("jsonText", manifestCardSampleJson());
    setParseError(null);
  }

  async function onCopyJson() {
    try {
      await navigator.clipboard.writeText(getValues("jsonText"));
    } catch {
      // Clipboard may be blocked; user can still select manually.
    }
  }

  function onSubmit(values: JsonFillValues) {
    try {
      const result = parseManifestCardJson(values.jsonText);
      onApply(result);
      onClose();
    } catch (err) {
      setParseError(
        err instanceof Error ? err.message : "Could not parse JSON",
      );
    }
  }

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="JSON fill"
      titleId="card-json-fill-title"
      size="lg"
    >
      <p className="m-0 mb-3 text-[0.8rem] leading-snug text-daf-muted">
        Paste a single card in <InlineCode>vocab.manifest.json</InlineCode>{" "}
        shape (one object, or a one-item array). Fields map to the form; review
        before saving.
      </p>

      <form
        id="card-json-fill-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex min-h-0 flex-1 flex-col"
      >
        <FormField label="Card JSON" htmlFor={textareaId} variant="form">
          <Textarea
            id={textareaId}
            variant="mono"
            withPlaceholderStyle={false}
            spellCheck={false}
            rows={16}
            {...register("jsonText", {
              onChange: () => setParseError(null),
            })}
          />
        </FormField>

        <div className="mt-2 flex flex-wrap gap-3">
          <Button type="button" variant="text" onClick={onPasteSample}>
            Insert sample
          </Button>
          <Button
            type="button"
            variant="text"
            onClick={() => void onCopyJson()}
          >
            Copy JSON
          </Button>
        </div>

        {parseError ? (
          <FieldError block className="mt-2 text-[0.8rem]">
            {parseError}
          </FieldError>
        ) : null}

        <ModalActions
          className="mt-4"
          onCancel={onClose}
          confirmLabel="Apply to form"
          confirmType="submit"
        />
      </form>
    </ModalShell>
  );
}
