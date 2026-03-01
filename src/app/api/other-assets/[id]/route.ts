import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getExchangeRates, convertToUsd } from "@/lib/exchange-rate";
import { z } from "zod/v4";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  value: z.number().min(0).optional(),
  currency: z.string().optional(),
  description: z.string().optional(),
});

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues }, { status: 400 });

  const existing = await prisma.otherAsset.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const currency = parsed.data.currency ?? existing.currency;
  const value = parsed.data.value ?? existing.value;
  const rates = await getExchangeRates();
  const usdValue = convertToUsd(value, currency, rates);

  const asset = await prisma.otherAsset.update({ where: { id }, data: { ...parsed.data, usdValue } });
  return NextResponse.json(asset);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.otherAsset.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
