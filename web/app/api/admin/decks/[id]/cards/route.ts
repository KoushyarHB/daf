import { NextResponse } from "next/server";

import { isAuthError, requireSuperAdminSession } from "@/lib/auth/require-auth";
import * as adminDecksService from "@/services/backend/admin-decks.service";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const authResult = await requireSuperAdminSession();
  if (isAuthError(authResult)) return authResult;

  const { id } = await context.params;
  const result = await adminDecksService.listDeckCardsAdmin(id);
  if (result === "NOT_FOUND") {
    return NextResponse.json({ error: "Deck not found" }, { status: 404 });
  }

  return NextResponse.json({ items: result });
}
