import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getExchangeRates, convertToUsd } from "@/lib/exchange-rate";
import { z } from "zod/v4";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  name: z.string().min(1),
  location: z.string().min(1),
  purchasePrice: z.number().min(0),
  currentValue: z.number().min(0),
  currency: z.string().default("USD"),
  purchaseDate: z.string(),
  notes: z.string().optional(),
});

export async function GET() {
  const properties = await prisma.realEstate.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(properties);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues }, { status: 400 });

  const rates = await getExchangeRates();
  const usdValue = convertToUsd(parsed.data.currentValue, parsed.data.currency, rates);
  const property = await prisma.realEstate.create({
    data: { ...parsed.data, purchaseDate: new Date(parsed.data.purchaseDate), usdValue },
  });
  return NextResponse.json(property, { status: 201 });
}
