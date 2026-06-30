import { deckHintClass } from "@/lib/styles/tagsPage";
import { getAuthSession } from "@/lib/auth/require-auth";
import { isSuperAdminRole } from "@/lib/auth/roles";
import AdminUsersManager from "@/components/pages/admin/AdminUsersManager";
import * as adminUsersService from "@/services/backend/admin-users.service";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await getAuthSession();
  if (!session || !isSuperAdminRole(session.role)) {
    return (
      <p className={deckHintClass} role="alert">
        Super admin access required.
      </p>
    );
  }

  const users = await adminUsersService.listUsersAdmin({
    page: 1,
    pageSize: 100,
  });

  return <AdminUsersManager initialUsers={users.items} />;
}
