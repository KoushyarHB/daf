import { NextRequest, NextResponse } from "next/server";

import { adminUserListQuerySchema, adminUserWriteSchema } from "@/lib/api/schemas";
import { isAuthError, requireSuperAdminSession } from "@/lib/auth/require-auth";
import * as adminUsersService from "@/services/backend/admin-users.service";

export async function GET(request: NextRequest) {
  const authResult = await requireSuperAdminSession();
  if (isAuthError(authResult)) return authResult;

  const parsed = adminUserListQuerySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams),
  );
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const result = await adminUsersService.listUsersAdmin(parsed.data);
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const authResult = await requireSuperAdminSession();
  if (isAuthError(authResult)) return authResult;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = adminUserWriteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const result = await adminUsersService.createUserAdmin(parsed.data);
  if (result === "EMAIL_TAKEN") {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  return NextResponse.json(result, { status: 201 });
}
