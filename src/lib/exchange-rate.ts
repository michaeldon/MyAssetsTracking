import { prisma } from "./db";

const CACHE_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export interface Rates {
  HKD: number;
  CNY: number;
}

const DEFAULT_RATES: Rates = { HKD: 7.8, CNY: 7.23 };

export async function getExchangeRates(): Promise<Rates> {
  const cached = await prisma.exchangeRate.findMany();
  const now = new Date();

  if (cached.length > 0) {
    const oldest = cached.reduce((a, b) =>
      a.updatedAt < b.updatedAt ? a : b
    );
    if (now.getTime() - oldest.updatedAt.getTime() < CACHE_DURATION_MS) {
      const rates: Rates = { ...DEFAULT_RATES };
      for (const r of cached) {
        if (r.currency === "HKD") rates.HKD = r.rate;
        if (r.currency === "CNY") rates.CNY = r.rate;
      }
      return rates;
    }
  }

  try {
    const res = await fetch(
      "https://open.er-api.com/v6/latest/USD",
      { next: { revalidate: 900 } }
    );
    const data = await res.json();
    if (data.result === "success" && data.rates) {
      const rates: Rates = {
        HKD: data.rates.HKD ?? DEFAULT_RATES.HKD,
        CNY: data.rates.CNY ?? DEFAULT_RATES.CNY,
      };

      for (const [currency, rate] of Object.entries(rates)) {
        await prisma.exchangeRate.upsert({
          where: { currency },
          update: { rate },
          create: { base: "USD", currency, rate },
        });
      }

      return rates;
    }
  } catch {
    // Fallback to cached or defaults
  }

  if (cached.length > 0) {
    const rates: Rates = { ...DEFAULT_RATES };
    for (const r of cached) {
      if (r.currency === "HKD") rates.HKD = r.rate;
      if (r.currency === "CNY") rates.CNY = r.rate;
    }
    return rates;
  }

  return DEFAULT_RATES;
}

export function convertFromUsd(usd: number, currency: string, rates: Rates): number {
  if (currency === "USD") return usd;
  if (currency === "HKD") return usd * rates.HKD;
  if (currency === "CNY") return usd * rates.CNY;
  return usd;
}

export function convertToUsd(amount: number, currency: string, rates: Rates): number {
  if (currency === "USD") return amount;
  if (currency === "HKD") return amount / rates.HKD;
  if (currency === "CNY") return amount / rates.CNY;
  return amount;
}
