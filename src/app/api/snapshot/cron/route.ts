import { NextRequest, NextResponse } from "next/server";
import { createDailySnapshot } from "@/lib/snapshot";

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await createDailySnapshot();
  return NextResponse.json({ success: true, timestamp: new Date().toISOString() });
}
