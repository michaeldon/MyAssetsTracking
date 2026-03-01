import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod/v4";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  chain: z.string().min(1),
  balance: z.number().optional(),
  usdValue: z.number().optional(),
  autoFetch: z.boolean().optional(),
});

export async function GET() {
  const wallets = await prisma.cryptoWallet.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(wallets);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }
  const wallet = await prisma.cryptoWallet.create({ data: parsed.data });
  return NextResponse.json(wallet, { status: 201 });
}
