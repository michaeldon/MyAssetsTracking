import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod/v4";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  chain: z.string().min(1).optional(),
  balance: z.number().optional(),
  usdValue: z.number().optional(),
  autoFetch: z.boolean().optional(),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const wallet = await prisma.cryptoWallet.findUnique({ where: { id } });
  if (!wallet) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(wallet);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }
  const wallet = await prisma.cryptoWallet.update({ where: { id }, data: parsed.data });
  return NextResponse.json(wallet);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.cryptoWallet.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
