import { NextResponse } from "next/server";

import { getAuthUserId } from "@/lib/auth/require-auth";
import * as cardsService from "@/services/backend/cards.service";

export async function GET() {
  const userId = await getAuthUserId();
  const options = await cardsService.getFilterOptions(userId);
  return NextResponse.json(options);
}
