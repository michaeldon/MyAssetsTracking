import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getExchangeRates, convertToUsd } from "@/lib/exchange-rate";
import { z } from "zod/v4";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  value: z.number().min(0),
  currency: z.string().default("USD"),
  description: z.string().optional(),
});

export async function GET() {
  const assets = await prisma.otherAsset.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(assets);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues }, { status: 400 });

  const rates = await getExchangeRates();
  const usdValue = convertToUsd(parsed.data.value, parsed.data.currency, rates);
  const asset = await prisma.otherAsset.create({ data: { ...parsed.data, usdValue } });
  return NextResponse.json(asset, { status: 201 });
}
