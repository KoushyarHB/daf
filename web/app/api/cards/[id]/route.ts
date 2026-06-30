import { NextResponse } from "next/server";

import { cardUpdateSchema } from "@/lib/api/schemas";
import { getAuthUserId, isAuthError, requireAuthUserId } from "@/lib/auth/require-auth";
import * as cardsService from "@/services/backend/cards.service";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const userId = await getAuthUserId();
  const card = await cardsService.getCardById(id, userId);
  if (!card) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(card);
}

export async function PATCH(request: Request, context: RouteContext) {
  const authResult = await requireAuthUserId();
  if (isAuthError(authResult)) return authResult;
  const userId = authResult;

  const { id } = await context.params;
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

  const result = await cardsService.updateCard(id, userId, parsed.data);
  if (result === "NOT_FOUND") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (result === "FORBIDDEN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (result === "INVALID_DECK") {
    return NextResponse.json({ error: "Invalid deck" }, { status: 400 });
  }
  return NextResponse.json(result);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const authResult = await requireAuthUserId();
  if (isAuthError(authResult)) return authResult;
  const userId = authResult;

  const { id } = await context.params;
  const result = await cardsService.deleteCard(id, userId);
  if (result === "NOT_FOUND") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (result === "FORBIDDEN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (result === "HIDDEN") {
    return NextResponse.json({ hidden: true }, { status: 200 });
  }
  return new NextResponse(null, { status: 204 });
}
