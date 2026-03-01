import { prisma } from "./db";
import { getExchangeRates } from "./exchange-rate";

export async function createDailySnapshot(): Promise<void> {
  const today = new Date().toISOString().split("T")[0];
  const rates = await getExchangeRates();

  // Aggregate all asset categories
  const [cryptoAgg, exchangeAgg, bankAgg, realEstateAgg, otherAgg] = await Promise.all([
    prisma.cryptoWallet.aggregate({ _sum: { usdValue: true } }),
    prisma.exchangeAccount.aggregate({ _sum: { totalUsd: true } }),
    prisma.bankAccount.aggregate({ _sum: { usdValue: true } }),
    prisma.realEstate.aggregate({ _sum: { usdValue: true } }),
    prisma.otherAsset.aggregate({ _sum: { usdValue: true } }),
  ]);

  const cryptoValue = cryptoAgg._sum.usdValue ?? 0;
  const exchangeValue = exchangeAgg._sum.totalUsd ?? 0;
  const bankValue = bankAgg._sum.usdValue ?? 0;
  const realEstateValue = realEstateAgg._sum.usdValue ?? 0;
  const otherValue = otherAgg._sum.usdValue ?? 0;
  const totalValue = cryptoValue + exchangeValue + bankValue + realEstateValue + otherValue;

  await prisma.dailySnapshot.upsert({
    where: { date: today },
    update: {
      totalValue,
      cryptoValue,
      exchangeValue,
      bankValue,
      realEstateValue,
      otherValue,
      exchangeRates: JSON.stringify(rates),
    },
    create: {
      date: today,
      totalValue,
      cryptoValue,
      exchangeValue,
      bankValue,
      realEstateValue,
      otherValue,
      exchangeRates: JSON.stringify(rates),
    },
  });
}
