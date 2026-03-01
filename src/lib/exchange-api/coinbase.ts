export async function fetchCoinbaseBalance(apiKey: string, _apiSecret: string): Promise<{ totalUsd: number; balances: { coin: string; amount: number; usdValue: number }[] }> {
  const res = await fetch("https://api.coinbase.com/v2/accounts?limit=100", {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "CB-VERSION": "2016-02-18",
    },
  });

  if (!res.ok) throw new Error(`Coinbase API error: ${res.status}`);
  const data = await res.json();

  const accounts = (data.data || []).filter(
    (a: { balance: { amount: string } }) => parseFloat(a.balance?.amount) > 0.0001
  );

  const balances = accounts.map((a: { currency: string; balance: { amount: string }; native_balance: { amount: string } }) => ({
    coin: a.currency,
    amount: parseFloat(a.balance.amount),
    usdValue: parseFloat(a.native_balance?.amount ?? "0"),
  }));

  const totalUsd = balances.reduce((sum: number, b: { usdValue: number }) => sum + b.usdValue, 0);
  return { totalUsd, balances };
}
