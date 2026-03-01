import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getExchangeRates, convertToUsd } from "@/lib/exchange-rate";
import { z } from "zod/v4";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
  purchasePrice: z.number().min(0).optional(),
  currentValue: z.number().min(0).optional(),
  currency: z.string().optional(),
  purchaseDate: z.string().optional(),
  notes: z.string().optional(),
});

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues }, { status: 400 });

  const existing = await prisma.realEstate.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const currency = parsed.data.currency ?? existing.currency;
  const currentValue = parsed.data.currentValue ?? existing.currentValue;
  const rates = await getExchangeRates();
  const usdValue = convertToUsd(currentValue, currency, rates);

  const updateData: Record<string, unknown> = { ...parsed.data, usdValue };
  if (parsed.data.purchaseDate) updateData.purchaseDate = new Date(parsed.data.purchaseDate);

  const property = await prisma.realEstate.update({ where: { id }, data: updateData });
  return NextResponse.json(property);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.realEstate.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
