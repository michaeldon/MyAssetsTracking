import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createDailySnapshot } from "@/lib/snapshot";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const limit = parseInt(request.nextUrl.searchParams.get("limit") || "365");
  const snapshots = await prisma.dailySnapshot.findMany({
    orderBy: { date: "desc" },
    take: limit,
  });
  return NextResponse.json(snapshots);
}

export async function POST() {
  await createDailySnapshot();
  return NextResponse.json({ success: true, message: "Snapshot created" });
}
