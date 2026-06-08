import { NextResponse } from "next/server";

import { auth } from "@/lib/auth/auth";

export async function getAuthUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

export async function requireAuthUserId(): Promise<
  string | NextResponse<{ error: string }>
> {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return userId;
}

export function isAuthError(
  result: string | NextResponse,
): result is NextResponse {
  return result instanceof NextResponse;
}
