import { deckHintClass } from "@/lib/styles/tagsPage";
import { getAuthSession } from "@/lib/auth/require-auth";
import { isSuperAdminRole } from "@/lib/auth/roles";
import AdminPublishPanel from "@/components/pages/admin/AdminPublishPanel";
import * as adminDecksService from "@/services/backend/admin-decks.service";

export const dynamic = "force-dynamic";

export default async function AdminPublishPage() {
  const session = await getAuthSession();
  if (!session || !isSuperAdminRole(session.role)) {
    return (
      <p className={deckHintClass} role="alert">
        Super admin access required.
      </p>
    );
  }

  const decks = await adminDecksService.listDecksAdmin({
    page: 1,
    pageSize: 50,
  });

  return <AdminPublishPanel initialDecks={decks.items} />;
}
