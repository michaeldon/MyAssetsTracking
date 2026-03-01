import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getExchangeRates, convertToUsd } from "@/lib/exchange-rate";
import { z } from "zod/v4";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  bankName: z.string().min(1),
  accountName: z.string().min(1),
  accountNumber: z.string().min(1),
  accountType: z.string().min(1),
  currency: z.string().default("USD"),
  balance: z.number().default(0),
  notes: z.string().optional(),
});

export async function GET() {
  const accounts = await prisma.bankAccount.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(accounts);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues }, { status: 400 });

  const rates = await getExchangeRates();
  const usdValue = convertToUsd(parsed.data.balance, parsed.data.currency, rates);
  const account = await prisma.bankAccount.create({ data: { ...parsed.data, usdValue } });
  return NextResponse.json(account, { status: 201 });
}
