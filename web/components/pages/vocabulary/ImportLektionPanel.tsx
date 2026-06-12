"use client";

import { useState } from "react";

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
  onImported: () => void;
  title?: string;
  description?: string;
};

export default function ImportLektionPanel({
  options,
  onImported,
  title = "Import community cards",
  description = "Choose a Lektion to add the shared vocabulary deck to your account. You can import more later.",
}: ImportLektionPanelProps) {
  const toast = useToast();
  const [importing, setImporting] = useState<number | null>(null);

  if (options.length === 0) {
    return (
      <div className="import-lektion-panel" role="status">
        <p className="import-lektion-panel__text">
          No community Lektion decks are available yet.
        </p>
      </div>
    );
  }

  async function onImport(lektion: number) {
    setImporting(lektion);
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
      toast.success(`Lektion ${lektion} imported`);
      onImported();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import failed");
    } finally {
      setImporting(null);
    }
  }

  return (
    <section className="import-lektion-panel" aria-labelledby="import-lektion-title">
      <h2 id="import-lektion-title" className="import-lektion-panel__title">
        {title}
      </h2>
      <p className="import-lektion-panel__text">{description}</p>
      <ul className="import-lektion-list">
        {options.map((opt) => (
          <li key={opt.lektion}>
            <button
              type="button"
              className={`import-lektion-btn${opt.imported ? " import-lektion-btn--done" : ""}`}
              disabled={opt.imported || importing !== null}
              onClick={() => void onImport(opt.lektion)}
            >
              <span className="import-lektion-btn__label">
                {opt.imported ? "Imported" : "Import cards for"}: {opt.label}
              </span>
              <span className="import-lektion-btn__meta">
                {importing === opt.lektion
                  ? "Importing…"
                  : `${opt.cardCount} cards`}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
