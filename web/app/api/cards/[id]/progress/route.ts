import { NextResponse } from "next/server";

import { progressPatchSchema } from "@/lib/api/schemas";
import { isAuthError, requireAuthUserId } from "@/lib/auth/require-auth";
import * as cardsService from "@/services/cards.service";

type RouteContext = { params: Promise<{ id: string }> };

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

  const parsed = progressPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const ok = await cardsService.setCardStudied(userId, id, parsed.data.studied);
  if (!ok) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
