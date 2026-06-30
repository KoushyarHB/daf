import { NextResponse } from "next/server";

import { cardUpdateSchema } from "@/lib/api/schemas";
import { isAuthError, requireSuperAdminSession } from "@/lib/auth/require-auth";
import * as adminDecksService from "@/services/backend/admin-decks.service";

type RouteContext = { params: Promise<{ id: string; cardId: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const authResult = await requireSuperAdminSession();
  if (isAuthError(authResult)) return authResult;

  const { id, cardId } = await context.params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = cardUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const result = await adminDecksService.updateDeckCardAdmin(
    id,
    cardId,
    parsed.data,
  );
  if (result === "NOT_FOUND") {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }
  if (result === "INVALID_DECK") {
    return NextResponse.json({ error: "Invalid deck" }, { status: 400 });
  }

  return NextResponse.json(result);
}
