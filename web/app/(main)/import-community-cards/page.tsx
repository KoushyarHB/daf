"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";

import ImportTagPanel, {
  type TagImportOption,
} from "@/components/pages/vocabulary/ImportTagPanel";

type ImportStatus = {
  importedTagSlugs: string[];
  availableTags: TagImportOption[];
  hasUserCreatedCard: boolean;
  showImportOnHome: boolean;
};

export default function ImportCommunityCardsPage() {
  const { status } = useSession();
  const [data, setData] = useState<ImportStatus | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoaded = useRef(false);

  const load = useCallback((background = false) => {
    if (!background && !hasLoaded.current) {
      setInitialLoading(true);
    }
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
        hasLoaded.current = true;
        setInitialLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load");
        if (!hasLoaded.current) setData(null);
        setInitialLoading(false);
      });
  }, []);

  useEffect(() => {
    if (status !== "authenticated") {
      setInitialLoading(false);
      return;
    }
    load(false);
  }, [status, load]);

  if (status === "loading" || (initialLoading && !hasLoaded.current)) {
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

  if (error && !data) {
    return (
      <p className="deck-error" role="alert">
        {error}
      </p>
    );
  }

  return (
    <div className="import-page">
      <ImportTagPanel
        options={data?.availableTags ?? []}
        onChanged={() => load(true)}
        title="Import community cards"
        description="Add shared DaF vocabulary by tag. Imported cards appear in your deck; you can customize or remove them individually."
      />
      <p className="import-page__back">
        <Link href="/">← Back to vocabulary</Link>
      </p>
    </div>
  );
}
