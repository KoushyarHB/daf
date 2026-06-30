"use client";

import { useImportStatusQuery } from "@/lib/api/hooks/cards";

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
  const importStatusQuery = useImportStatusQuery({ initialData: initialStatus });
  const status = importStatusQuery.data ?? initialStatus;

  return (
    <ImportTagPanel
      options={status.availableTags}
      onChanged={() => void importStatusQuery.refetch()}
      title="Import community cards"
      description="Add shared DaF vocabulary by tag. Imported cards appear in your deck; you can customize or remove them individually."
    />
  );
}
