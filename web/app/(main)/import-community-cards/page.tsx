import Link from "next/link";

import { getAuthSession } from "@/lib/auth/require-auth";
import SignInPrompt from "@/components/shared/SignInPrompt";
import ImportCommunityCardsClient from "@/components/pages/vocabulary/ImportCommunityCardsClient";
import { getImportStatus } from "@/services/backend/import.service";

export const dynamic = "force-dynamic";

export default async function ImportCommunityCardsPage() {
  const session = await getAuthSession();
  if (!session) {
    return (
      <div>
        <SignInPrompt message="to import community vocabulary." />
      </div>
    );
  }

  const status = await getImportStatus(session.userId);

  return (
    <div>
      <ImportCommunityCardsClient initialStatus={status} />
      <p className="mt-4 mb-0 text-[0.85rem]">
        <Link href="/" className="text-daf-head no-underline hover:underline">
          ← Back to vocabulary
        </Link>
      </p>
    </div>
  );
}
