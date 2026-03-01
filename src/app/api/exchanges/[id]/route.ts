import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod/v4";
import { encrypt } from "@/lib/encryption";

const updateSchema = z.object({
  exchange: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  apiKey: z.string().optional(),
  apiSecret: z.string().optional(),
  passphrase: z.string().optional(),
  autoFetch: z.boolean().optional(),
  totalUsd: z.number().optional(),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const account = await prisma.exchangeAccount.findUnique({ where: { id }, include: { balances: true } });
  if (!account) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({
    ...account,
    apiKey: account.apiKey ? "****" : null,
    apiSecret: account.apiSecret ? "****" : null,
    passphrase: account.passphrase ? "****" : null,
  });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }
  const data = { ...parsed.data };
  if (data.apiKey && data.apiKey !== "****") data.apiKey = encrypt(data.apiKey);
  else delete data.apiKey;
  if (data.apiSecret && data.apiSecret !== "****") data.apiSecret = encrypt(data.apiSecret);
  else delete data.apiSecret;
  if (data.passphrase && data.passphrase !== "****") data.passphrase = encrypt(data.passphrase);
  else delete data.passphrase;
  const account = await prisma.exchangeAccount.update({ where: { id }, data });
  return NextResponse.json(account);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.exchangeAccount.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
