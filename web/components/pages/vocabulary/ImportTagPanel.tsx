"use client";

import { useEffect, useState } from "react";

import { useToast } from "@/components/shared/toast/ToastProvider";

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
  const [localOptions, setLocalOptions] = useState(options);
  const [busySlug, setBusySlug] = useState<string | null>(null);

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
      const res = await fetch("/api/cards/import-tag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? `Import failed (${res.status})`);
      }
      setImported(slug, true);
      toast.success(`${label} imported`);
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import failed");
    } finally {
      setBusySlug(null);
    }
  }

  async function onDeimport(slug: string, label: string) {
    setBusySlug(slug);
    try {
      const res = await fetch("/api/cards/deimport-tag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? `Remove failed (${res.status})`);
      }
      setImported(slug, false);
      toast.success(`${label} removed from your deck`);
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Remove failed");
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
                  ? onDeimport(opt.slug, opt.label)
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
    </section>
  );
}
