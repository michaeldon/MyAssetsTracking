import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getExchangeRates, convertToUsd } from "@/lib/exchange-rate";
import { z } from "zod/v4";

const updateSchema = z.object({
  bankName: z.string().min(1).optional(),
  accountName: z.string().min(1).optional(),
  accountNumber: z.string().min(1).optional(),
  accountType: z.string().min(1).optional(),
  currency: z.string().optional(),
  balance: z.number().optional(),
  notes: z.string().optional(),
});

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues }, { status: 400 });

  const existing = await prisma.bankAccount.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const currency = parsed.data.currency ?? existing.currency;
  const balance = parsed.data.balance ?? existing.balance;
  const rates = await getExchangeRates();
  const usdValue = convertToUsd(balance, currency, rates);

  const account = await prisma.bankAccount.update({ where: { id }, data: { ...parsed.data, usdValue } });
  return NextResponse.json(account);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.bankAccount.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
