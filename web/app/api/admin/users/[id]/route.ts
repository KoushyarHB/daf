import { NextResponse } from "next/server";

import { adminUserUpdateSchema } from "@/lib/api/schemas";
import { isAuthError, requireSuperAdminSession } from "@/lib/auth/require-auth";
import * as adminUsersService from "@/services/admin-users.service";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const authResult = await requireSuperAdminSession();
  if (isAuthError(authResult)) return authResult;

  const { id } = await context.params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = adminUserUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const result = await adminUsersService.updateUserAdmin(
    id,
    parsed.data,
    authResult.role,
  );
  if (result === "NOT_FOUND") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (result === "FORBIDDEN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json(result);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const authResult = await requireSuperAdminSession();
  if (isAuthError(authResult)) return authResult;

  const { id } = await context.params;
  const result = await adminUsersService.deleteUserAdmin(id, authResult.userId);
  if (result === "NOT_FOUND") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (result === "FORBIDDEN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return new NextResponse(null, { status: 204 });
}
