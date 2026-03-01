import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod/v4";
import { encrypt } from "@/lib/encryption";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  exchange: z.string().min(1),
  name: z.string().min(1),
  apiKey: z.string().optional(),
  apiSecret: z.string().optional(),
  passphrase: z.string().optional(),
  autoFetch: z.boolean().optional(),
  totalUsd: z.number().optional(),
});

export async function GET() {
  const accounts = await prisma.exchangeAccount.findMany({
    include: { balances: true },
    orderBy: { createdAt: "desc" },
  });
  const safe = accounts.map((a) => ({
    ...a,
    apiKey: a.apiKey ? "****" : null,
    apiSecret: a.apiSecret ? "****" : null,
    passphrase: a.passphrase ? "****" : null,
  }));
  return NextResponse.json(safe);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }
  const data = { ...parsed.data };
  if (data.apiKey) data.apiKey = encrypt(data.apiKey);
  if (data.apiSecret) data.apiSecret = encrypt(data.apiSecret);
  if (data.passphrase) data.passphrase = encrypt(data.passphrase);
  const account = await prisma.exchangeAccount.create({ data });
  return NextResponse.json(account, { status: 201 });
}
