import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const period = request.nextUrl.searchParams.get("period") || "30d";

  const cryptoTotal = await prisma.cryptoWallet.aggregate({ _sum: { usdValue: true } });
  const exchangeTotal = await prisma.exchangeAccount.aggregate({ _sum: { totalUsd: true } });
  const bankTotal = await prisma.bankAccount.aggregate({ _sum: { usdValue: true } });
  const realEstateTotal = await prisma.realEstate.aggregate({ _sum: { usdValue: true } });
  const otherTotal = await prisma.otherAsset.aggregate({ _sum: { usdValue: true } });

  const crypto = cryptoTotal._sum.usdValue ?? 0;
  const exchange = exchangeTotal._sum.totalUsd ?? 0;
  const bank = bankTotal._sum.usdValue ?? 0;
  const realEstate = realEstateTotal._sum.usdValue ?? 0;
  const other = otherTotal._sum.usdValue ?? 0;
  const total = crypto + exchange + bank + realEstate + other;

  const daysMap: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90, "1y": 365 };
  const days = daysMap[period] || 9999;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  const cutoff = cutoffDate.toISOString().split("T")[0];

  const snapshots = await prisma.dailySnapshot.findMany({
    where: period === "all" ? undefined : { date: { gte: cutoff } },
    orderBy: { date: "asc" },
  });

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];
  const yesterdaySnapshot = await prisma.dailySnapshot.findUnique({
    where: { date: yesterdayStr },
  });

  const todayChange = yesterdaySnapshot ? total - yesterdaySnapshot.totalValue : 0;
  const todayChangePercent = yesterdaySnapshot && yesterdaySnapshot.totalValue > 0
    ? ((total - yesterdaySnapshot.totalValue) / yesterdaySnapshot.totalValue) * 100
    : 0;

  return NextResponse.json({
    total,
    breakdown: { crypto, exchange, bank, realEstate, other },
    todayChange,
    todayChangePercent,
    snapshots,
  });
}
