import { NextResponse } from "next/server";

import { isAuthError, requireAuthUserId } from "@/lib/auth/require-auth";
import { getImportStatus } from "@/services/import.service";

export async function GET() {
  const authResult = await requireAuthUserId();
  if (isAuthError(authResult)) return authResult;

  const status = await getImportStatus(authResult);
  return NextResponse.json(status);
}
