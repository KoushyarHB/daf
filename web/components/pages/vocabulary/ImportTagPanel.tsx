"use client";

import { useState } from "react";

import ConfirmModal from "@/components/shared/ConfirmModal";
import { useToast } from "@/components/shared/toast/ToastProvider";
import { getApiErrorMessage } from "@/services/frontend/http";
import {
  useDeimportTagMutation,
  useImportTagMutation,
} from "@/hooks/cards";

export type TagImportOption = {
  slug: string;
  label: string;
  level: string;
  cardCount: number;
  imported: boolean;
};

type ImportTagPanelProps = {
  options: TagImportOption[];
  onChanged: () => void;
  title?: string;
  description?: string;
};

const panelClass =
  "mb-4 py-[0.9rem] px-4 bg-white border border-daf-border rounded-lg";

const importBtnBase =
  "appearance-none flex flex-col items-start gap-[0.15rem] w-full py-[0.55rem] px-[0.7rem] font-inherit text-left text-daf-import-text bg-daf-import-bg border border-daf-head/35 rounded-md cursor-pointer hover:enabled:bg-daf-import-hover hover:enabled:border-daf-head/55 disabled:opacity-70 disabled:cursor-wait";

const importBtnDoneClass =
  "text-daf-import-done bg-daf-import-done-bg border-daf-border-import hover:enabled:bg-daf-import-done-hover hover:enabled:border-daf-import-border-done";

export default function ImportTagPanel({
  options,
  onChanged,
  title = "Import community cards",
  description = "Choose a tagged deck to add shared vocabulary to your account. You can remove an import here anytime.",
}: ImportTagPanelProps) {
  const toast = useToast();
  const importTag = useImportTagMutation();
  const deimportTag = useDeimportTagMutation();
  const [importedBySlug, setImportedBySlug] = useState<
    Record<string, boolean>
  >({});
  const [prevOptions, setPrevOptions] = useState(options);
  const [busySlug, setBusySlug] = useState<string | null>(null);
  const [removeTarget, setRemoveTarget] = useState<TagImportOption | null>(null);

  if (options !== prevOptions) {
    setPrevOptions(options);
    setImportedBySlug({});
  }

  const localOptions = options.map((o) => ({
    ...o,
    imported: importedBySlug[o.slug] ?? o.imported,
  }));

  if (localOptions.length === 0) {
    return (
      <div className={panelClass} role="status">
        <p className="m-0 mb-3 text-[0.85rem] text-daf-subtle leading-[1.45]">
          No community tag decks are available yet.
        </p>
      </div>
    );
  }

  function setImported(slug: string, imported: boolean) {
    setImportedBySlug((prev) => ({ ...prev, [slug]: imported }));
  }

  async function onImport(slug: string, label: string) {
    setBusySlug(slug);
    try {
      await importTag.mutateAsync(slug);
      setImported(slug, true);
      toast.success(`${label} imported`);
      onChanged();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Import failed"));
    } finally {
      setBusySlug(null);
    }
  }

  async function onDeimport(slug: string, label: string) {
    setBusySlug(slug);
    try {
      await deimportTag.mutateAsync(slug);
      setImported(slug, false);
      toast.success(`${label} removed from your deck`);
      setRemoveTarget(null);
      onChanged();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Remove failed"));
    } finally {
      setBusySlug(null);
    }
  }

  function metaText(opt: TagImportOption): string {
    if (busySlug === opt.slug) {
      return opt.imported ? "Removing…" : "Importing…";
    }
    const count = `${opt.cardCount} card${opt.cardCount === 1 ? "" : "s"}`;
    return opt.imported ? `${count} · In your deck` : count;
  }

  const removing = deimportTag.isPending;

  return (
    <section className={panelClass} aria-labelledby="import-tag-title">
      <h2
        id="import-tag-title"
        className="m-0 mb-[0.35rem] text-base font-semibold text-daf-head"
      >
        {title}
      </h2>
      <p className="m-0 mb-3 text-[0.85rem] text-daf-subtle leading-[1.45]">
        {description}
      </p>
      <ul className="list-none m-0 p-0 flex flex-col gap-[0.45rem]">
        {localOptions.map((opt) => (
          <li key={opt.slug}>
            <button
              type="button"
              className={`${importBtnBase}${opt.imported ? ` ${importBtnDoneClass}` : ""}${busySlug === opt.slug ? " opacity-85" : ""}`}
              disabled={busySlug !== null}
              onClick={() =>
                void (opt.imported
                  ? setRemoveTarget(opt)
                  : onImport(opt.slug, opt.label))
              }
              aria-label={
                opt.imported
                  ? `Remove ${opt.label} from your deck`
                  : `Import ${opt.label}`
              }
              aria-busy={busySlug === opt.slug}
            >
              <span className="text-[0.88rem] font-semibold">{opt.label}</span>
              <span className="text-xs font-normal text-daf-muted">
                {metaText(opt)}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <ConfirmModal
        open={removeTarget !== null}
        title="Remove import"
        message={
          removeTarget
            ? `Remove “${removeTarget.label}” from your deck? Imported cards from this tag will be removed.`
            : ""
        }
        confirmLabel="Remove"
        danger
        loading={removing}
        onConfirm={() => {
          if (removeTarget) {
            void onDeimport(removeTarget.slug, removeTarget.label);
          }
        }}
        onCancel={() => {
          if (!removing) setRemoveTarget(null);
        }}
      />
    </section>
  );
}
