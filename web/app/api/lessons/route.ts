import { NextResponse } from "next/server";

import * as lessonsService from "@/services/backend/lessons.service";

export async function GET() {
  const lessons = await lessonsService.fetchLessons();
  return NextResponse.json({ lessons });
}
