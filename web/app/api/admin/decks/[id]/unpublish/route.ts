import { NextResponse } from "next/server";

import { isAuthError, requireSuperAdminSession } from "@/lib/auth/require-auth";
import * as adminDecksService from "@/services/admin-decks.service";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const authResult = await requireSuperAdminSession();
  if (isAuthError(authResult)) return authResult;

  const { id } = await context.params;
  const result = await adminDecksService.unpublishDeckFromCommunity(id);
  if (result === "NOT_FOUND") {
    return NextResponse.json({ error: "Deck not found" }, { status: 404 });
  }
  if (result === "NOT_PUBLISHED") {
    return NextResponse.json({ error: "Deck is not published" }, { status: 400 });
  }

  return NextResponse.json(result);
}
