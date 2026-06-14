import Link from "next/link";

import { getAuthSession } from "@/lib/auth/require-auth";
import SignInPrompt from "@/components/shared/SignInPrompt";
import ImportCommunityCardsClient from "@/components/pages/vocabulary/ImportCommunityCardsClient";
import { getImportStatus } from "@/services/import.service";

export const dynamic = "force-dynamic";

export default async function ImportCommunityCardsPage() {
  const session = await getAuthSession();
  if (!session) {
    return (
      <div className="import-page">
        <SignInPrompt message="to import community vocabulary." />
      </div>
    );
  }

  const status = await getImportStatus(session.userId);

  return (
    <div className="import-page">
      <ImportCommunityCardsClient initialStatus={status} />
      <p className="import-page__back">
        <Link href="/">← Back to vocabulary</Link>
      </p>
    </div>
  );
}
