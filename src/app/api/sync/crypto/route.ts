import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { fetchOnChainBalance } from "@/lib/crypto-api";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { walletId } = body;

  const wallets = walletId
    ? await prisma.cryptoWallet.findMany({ where: { id: walletId } })
    : await prisma.cryptoWallet.findMany({ where: { autoFetch: true } });

  const results = [];
  for (const wallet of wallets) {
    try {
      const { balance, usdValue } = await fetchOnChainBalance(wallet.address, wallet.chain);
      await prisma.cryptoWallet.update({
        where: { id: wallet.id },
        data: { balance, usdValue, lastSyncAt: new Date() },
      });
      results.push({ id: wallet.id, success: true, balance, usdValue });
    } catch (e) {
      results.push({ id: wallet.id, success: false, error: String(e) });
    }
  }

  return NextResponse.json({ results });
}
