import { NextResponse } from "next/server";

import { tagImportBodySchema } from "@/lib/api/schemas";
import { isAuthError, requireAuthUserId } from "@/lib/auth/require-auth";
import { importCommunityTag } from "@/services/backend/import.service";

export async function POST(request: Request) {
  const authResult = await requireAuthUserId();
  if (isAuthError(authResult)) return authResult;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = tagImportBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const result = await importCommunityTag(authResult, parsed.data.slug);
  if (result === "NOT_FOUND") {
    return NextResponse.json(
      { error: "No community cards for this tag" },
      { status: 404 },
    );
  }

  return NextResponse.json({ ok: true, slug: parsed.data.slug });
}
