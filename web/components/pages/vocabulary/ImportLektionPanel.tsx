"use client";

import { useEffect, useState } from "react";

import { useToast } from "@/components/shared/toast/ToastProvider";

export type LektionImportOption = {
  lektion: number;
  level: string;
  label: string;
  cardCount: number;
  imported: boolean;
};

type ImportLektionPanelProps = {
  options: LektionImportOption[];
  onChanged: () => void;
  title?: string;
  description?: string;
};

export default function ImportLektionPanel({
  options,
  onChanged,
  title = "Import community cards",
  description = "Choose a Lektion to add the shared vocabulary deck to your account. You can remove an import here anytime.",
}: ImportLektionPanelProps) {
  const toast = useToast();
  const [localOptions, setLocalOptions] = useState(options);
  const [busyLektion, setBusyLektion] = useState<number | null>(null);

  useEffect(() => {
    setLocalOptions(options);
  }, [options]);

  if (localOptions.length === 0) {
    return (
      <div className="import-lektion-panel" role="status">
        <p className="import-lektion-panel__text">
          No community Lektion decks are available yet.
        </p>
      </div>
    );
  }

  function setImported(lektion: number, imported: boolean) {
    setLocalOptions((prev) =>
      prev.map((o) => (o.lektion === lektion ? { ...o, imported } : o)),
    );
  }

  async function onImport(lektion: number) {
    setBusyLektion(lektion);
    try {
      const res = await fetch("/api/cards/import-lektion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lektion }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? `Import failed (${res.status})`);
      }
      setImported(lektion, true);
      toast.success(`Lektion ${lektion} imported`);
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import failed");
    } finally {
      setBusyLektion(null);
    }
  }

  async function onDeimport(lektion: number) {
    setBusyLektion(lektion);
    try {
      const res = await fetch("/api/cards/deimport-lektion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lektion }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? `Remove failed (${res.status})`);
      }
      setImported(lektion, false);
      toast.success(`Lektion ${lektion} removed from your deck`);
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Remove failed");
    } finally {
      setBusyLektion(null);
    }
  }

  function metaText(opt: LektionImportOption): string {
    if (busyLektion === opt.lektion) {
      return opt.imported ? "Removing…" : "Importing…";
    }
    const count = `${opt.cardCount} card${opt.cardCount === 1 ? "" : "s"}`;
    return opt.imported ? `${count} · In your deck` : count;
  }

  return (
    <section className="import-lektion-panel" aria-labelledby="import-lektion-title">
      <h2 id="import-lektion-title" className="import-lektion-panel__title">
        {title}
      </h2>
      <p className="import-lektion-panel__text">{description}</p>
      <ul className="import-lektion-list">
        {localOptions.map((opt) => (
          <li key={opt.lektion}>
            <button
              type="button"
              className={`import-lektion-btn${opt.imported ? " import-lektion-btn--done" : ""}${busyLektion === opt.lektion ? " import-lektion-btn--busy" : ""}`}
              disabled={busyLektion !== null}
              onClick={() =>
                void (opt.imported ? onDeimport(opt.lektion) : onImport(opt.lektion))
              }
              aria-label={
                opt.imported
                  ? `Remove ${opt.label} from your deck`
                  : `Import ${opt.label}`
              }
              aria-busy={busyLektion === opt.lektion}
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
