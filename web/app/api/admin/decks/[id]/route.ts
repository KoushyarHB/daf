import { NextResponse } from "next/server";

import { deckUpdateSchema } from "@/lib/api/schemas";
import { isAuthError, requireSuperAdminSession } from "@/lib/auth/require-auth";
import * as adminDecksService from "@/services/admin-decks.service";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const authResult = await requireSuperAdminSession();
  if (isAuthError(authResult)) return authResult;

  const { id } = await context.params;
  const deck = await adminDecksService.getDeckAdmin(id);
  if (!deck) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(deck);
}

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

  const parsed = deckUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const result = await adminDecksService.updateDeckAdmin(id, parsed.data);
  if (result === "NOT_FOUND") {
    return NextResponse.json({ error: "Deck not found" }, { status: 404 });
  }
  return NextResponse.json(result);
}
