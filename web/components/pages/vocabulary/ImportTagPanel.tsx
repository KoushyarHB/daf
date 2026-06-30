"use client";

import { useEffect, useState } from "react";

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

export default function ImportTagPanel({
  options,
  onChanged,
  title = "Import community cards",
  description = "Choose a tagged deck to add shared vocabulary to your account. You can remove an import here anytime.",
}: ImportTagPanelProps) {
  const toast = useToast();
  const importTag = useImportTagMutation();
  const deimportTag = useDeimportTagMutation();
  const [localOptions, setLocalOptions] = useState(options);
  const [busySlug, setBusySlug] = useState<string | null>(null);
  const [removeTarget, setRemoveTarget] = useState<TagImportOption | null>(null);

  useEffect(() => {
    setLocalOptions(options);
  }, [options]);

  if (localOptions.length === 0) {
    return (
      <div className="import-lektion-panel" role="status">
        <p className="import-lektion-panel__text">
          No community tag decks are available yet.
        </p>
      </div>
    );
  }

  function setImported(slug: string, imported: boolean) {
    setLocalOptions((prev) =>
      prev.map((o) => (o.slug === slug ? { ...o, imported } : o)),
    );
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
    <section className="import-lektion-panel" aria-labelledby="import-tag-title">
      <h2 id="import-tag-title" className="import-lektion-panel__title">
        {title}
      </h2>
      <p className="import-lektion-panel__text">{description}</p>
      <ul className="import-lektion-list">
        {localOptions.map((opt) => (
          <li key={opt.slug}>
            <button
              type="button"
              className={`import-lektion-btn${opt.imported ? " import-lektion-btn--done" : ""}${busySlug === opt.slug ? " import-lektion-btn--busy" : ""}`}
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
              <span className="import-lektion-btn__label">{opt.label}</span>
              <span className="import-lektion-btn__meta">{metaText(opt)}</span>
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
