import { getAuthSession } from "@/lib/auth/require-auth";
import { isAdminRole } from "@/lib/auth/roles";
import AdminPublishPanel from "@/components/pages/admin/AdminPublishPanel";
import * as adminDecksService from "@/services/admin-decks.service";

export const dynamic = "force-dynamic";

export default async function AdminPublishPage() {
  const session = await getAuthSession();
  if (!session || !isAdminRole(session.role)) {
    return (
      <p className="deck-hint" role="alert">
        Admin access required.
      </p>
    );
  }

  const decks = await adminDecksService.listDecksAdmin({
    page: 1,
    pageSize: 50,
  });

  return <AdminPublishPanel initialDecks={decks.items} />;
}
