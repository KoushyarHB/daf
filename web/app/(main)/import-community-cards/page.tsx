"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";

import ImportLektionPanel, {
  type LektionImportOption,
} from "@/components/pages/vocabulary/ImportLektionPanel";

type ImportStatus = {
  importedLektions: number[];
  availableLektions: LektionImportOption[];
  hasUserCreatedCard: boolean;
  showImportOnHome: boolean;
};

export default function ImportCommunityCardsPage() {
  const { status } = useSession();
  const [data, setData] = useState<ImportStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    void fetch("/api/cards/import-status")
      .then(async (res) => {
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(body.error ?? `HTTP ${res.status}`);
        }
        return res.json() as Promise<ImportStatus>;
      })
      .then((json) => {
        setData(json);
        setError(null);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load");
        setData(null);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (status !== "authenticated") {
      setLoading(false);
      return;
    }
    load();
  }, [status, load]);

  if (status === "loading" || loading) {
    return <p className="deck-hint">Loading…</p>;
  }

  if (status !== "authenticated") {
    return (
      <div className="import-page">
        <p className="deck-hint">
          <Link href="/login">Sign in</Link> to import community vocabulary.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <p className="deck-error" role="alert">
        {error}
      </p>
    );
  }

  return (
    <div className="import-page">
      <ImportLektionPanel
        options={data?.availableLektions ?? []}
        onChanged={load}
        title="Import community cards"
        description="Add shared DaF vocabulary by Lektion. Imported cards appear in your deck; you can customize or remove them individually."
      />
      <p className="import-page__back">
        <Link href="/">← Back to vocabulary</Link>
      </p>
    </div>
  );
}
