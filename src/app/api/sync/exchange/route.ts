import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/encryption";
import { fetchBinanceBalance } from "@/lib/exchange-api/binance";
import { fetchOkxBalance } from "@/lib/exchange-api/okx";
import { fetchCoinbaseBalance } from "@/lib/exchange-api/coinbase";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { accountId } = body;

  const accounts = accountId
    ? await prisma.exchangeAccount.findMany({ where: { id: accountId } })
    : await prisma.exchangeAccount.findMany({ where: { autoFetch: true } });

  const results = [];
  for (const account of accounts) {
    try {
      if (!account.apiKey || !account.apiSecret) {
        results.push({ id: account.id, success: false, error: "No API key" });
        continue;
      }

      const apiKey = decrypt(account.apiKey);
      const apiSecret = decrypt(account.apiSecret);

      let data: { totalUsd: number; balances: { coin: string; amount: number; usdValue: number }[] };

      switch (account.exchange.toLowerCase()) {
        case "binance":
          data = await fetchBinanceBalance(apiKey, apiSecret);
          break;
        case "okx":
          data = await fetchOkxBalance(apiKey, apiSecret, account.passphrase ? decrypt(account.passphrase) : "");
          break;
        case "coinbase":
          data = await fetchCoinbaseBalance(apiKey, apiSecret);
          break;
        default:
          results.push({ id: account.id, success: false, error: "Unsupported exchange" });
          continue;
      }

      await prisma.exchangeAccount.update({
        where: { id: account.id },
        data: { totalUsd: data.totalUsd, lastSyncAt: new Date() },
      });

      for (const bal of data.balances) {
        await prisma.exchangeBalance.upsert({
          where: { accountId_coin: { accountId: account.id, coin: bal.coin } },
          update: { amount: bal.amount, usdValue: bal.usdValue },
          create: { accountId: account.id, coin: bal.coin, amount: bal.amount, usdValue: bal.usdValue },
        });
      }

      results.push({ id: account.id, success: true, totalUsd: data.totalUsd });
    } catch (e) {
      results.push({ id: account.id, success: false, error: String(e) });
    }
  }

  return NextResponse.json({ results });
}
