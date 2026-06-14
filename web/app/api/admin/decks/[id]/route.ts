import { NextResponse } from "next/server";

import { isAuthError, requireAdminSession } from "@/lib/auth/require-auth";
import * as adminDecksService from "@/services/admin-decks.service";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const authResult = await requireAdminSession();
  if (isAuthError(authResult)) return authResult;

  const { id } = await context.params;
  const deck = await adminDecksService.getDeckAdmin(id);
  if (!deck) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(deck);
}
