import crypto from "crypto";

export async function fetchOkxBalance(apiKey: string, apiSecret: string, passphrase: string): Promise<{ totalUsd: number; balances: { coin: string; amount: number; usdValue: number }[] }> {
  const timestamp = new Date().toISOString();
  const method = "GET";
  const requestPath = "/api/v5/account/balance";
  const body = "";
  const prehash = timestamp + method + requestPath + body;
  const signature = crypto.createHmac("sha256", apiSecret).update(prehash).digest("base64");

  const res = await fetch(`https://www.okx.com${requestPath}`, {
    headers: {
      "OK-ACCESS-KEY": apiKey,
      "OK-ACCESS-SIGN": signature,
      "OK-ACCESS-TIMESTAMP": timestamp,
      "OK-ACCESS-PASSPHRASE": passphrase,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) throw new Error(`OKX API error: ${res.status}`);
  const data = await res.json();

  const details = data?.data?.[0]?.details ?? [];
  const balances = details
    .filter((d: { cashBal: string }) => parseFloat(d.cashBal) > 0.0001)
    .map((d: { ccy: string; cashBal: string; eqUsd: string }) => ({
      coin: d.ccy,
      amount: parseFloat(d.cashBal),
      usdValue: parseFloat(d.eqUsd) || 0,
    }));

  const totalUsd = balances.reduce((sum: number, b: { usdValue: number }) => sum + b.usdValue, 0);
  return { totalUsd, balances };
}
