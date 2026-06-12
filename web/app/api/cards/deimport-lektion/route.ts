import { NextResponse } from "next/server";
import { z } from "zod";

import { isAuthError, requireAuthUserId } from "@/lib/auth/require-auth";
import { deimportCommunityLektion } from "@/services/import.service";

const bodySchema = z.object({
  lektion: z.number().int().min(1),
});

export async function POST(request: Request) {
  const authResult = await requireAuthUserId();
  if (isAuthError(authResult)) return authResult;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const result = await deimportCommunityLektion(authResult, parsed.data.lektion);
  if (result === "NOT_FOUND") {
    return NextResponse.json(
      { error: "This Lektion is not imported" },
      { status: 404 },
    );
  }

  return NextResponse.json({ ok: true, lektion: parsed.data.lektion });
}
