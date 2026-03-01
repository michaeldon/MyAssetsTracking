import crypto from "crypto";

export async function fetchBinanceBalance(apiKey: string, apiSecret: string): Promise<{ totalUsd: number; balances: { coin: string; amount: number; usdValue: number }[] }> {
  const timestamp = Date.now();
  const queryString = `timestamp=${timestamp}`;
  const signature = crypto.createHmac("sha256", apiSecret).update(queryString).digest("hex");

  const res = await fetch(
    `https://api.binance.com/api/v3/account?${queryString}&signature=${signature}`,
    { headers: { "X-MBX-APIKEY": apiKey } }
  );

  if (!res.ok) throw new Error(`Binance API error: ${res.status}`);
  const data = await res.json();

  // Get coin prices for non-zero balances
  const nonZero = (data.balances || []).filter(
    (b: { asset: string; free: string; locked: string }) => parseFloat(b.free) + parseFloat(b.locked) > 0.0001
  );

  const coins = nonZero.map((b: { asset: string }) => b.asset).join(",");
  let prices: Record<string, number> = {};

  if (coins) {
    try {
      const priceRes = await fetch(`https://api.binance.com/api/v3/ticker/price`);
      const priceData = await priceRes.json();
      const usdtPrices: Record<string, number> = {};
      for (const p of priceData) {
        if (p.symbol.endsWith("USDT")) {
          usdtPrices[p.symbol.replace("USDT", "")] = parseFloat(p.price);
        }
      }
      usdtPrices["USDT"] = 1;
      usdtPrices["BUSD"] = 1;
      prices = usdtPrices;
    } catch {
      /* ignore */
    }
  }

  const balances = nonZero.map((b: { asset: string; free: string; locked: string }) => {
    const amount = parseFloat(b.free) + parseFloat(b.locked);
    const usdValue = amount * (prices[b.asset] ?? 0);
    return { coin: b.asset, amount, usdValue };
  });

  const totalUsd = balances.reduce((sum: number, b: { usdValue: number }) => sum + b.usdValue, 0);
  return { totalUsd, balances };
}
