import { NextRequest, NextResponse } from "next/server";

import { adminDeckListQuerySchema } from "@/lib/api/schemas";
import { isAuthError, requireAdminSession } from "@/lib/auth/require-auth";
import * as adminDecksService from "@/services/admin-decks.service";

export async function GET(request: NextRequest) {
  const authResult = await requireAdminSession();
  if (isAuthError(authResult)) return authResult;

  const parsed = adminDeckListQuerySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams),
  );
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const result = await adminDecksService.listDecksAdmin(parsed.data);
  return NextResponse.json(result);
}
