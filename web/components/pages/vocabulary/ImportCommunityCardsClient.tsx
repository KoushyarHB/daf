"use client";

import { useCallback, useState } from "react";

import ImportTagPanel, {
  type TagImportOption,
} from "@/components/pages/vocabulary/ImportTagPanel";

type ImportStatus = {
  importedTagSlugs: string[];
  availableTags: TagImportOption[];
  hasUserCreatedCard: boolean;
  showImportOnHome: boolean;
};

type ImportCommunityCardsClientProps = {
  initialStatus: ImportStatus;
};

export default function ImportCommunityCardsClient({
  initialStatus,
}: ImportCommunityCardsClientProps) {
  const [status, setStatus] = useState(initialStatus);

  const reload = useCallback(() => {
    void fetch("/api/cards/import-status")
      .then((r) => (r.ok ? r.json() : null))
      .then((json: ImportStatus | null) => {
        if (json) setStatus(json);
      })
      .catch(() => {});
  }, []);

  return (
    <ImportTagPanel
      options={status.availableTags}
      onChanged={reload}
      title="Import community cards"
      description="Add shared DaF vocabulary by tag. Imported cards appear in your deck; you can customize or remove them individually."
    />
  );
}
