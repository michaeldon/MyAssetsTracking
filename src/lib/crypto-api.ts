interface CryptoBalance {
  balance: number;
  usdValue: number;
}

const COINGECKO_IDS: Record<string, string> = {
  ETH: "ethereum",
  BTC: "bitcoin",
  SOL: "solana",
  BNB: "binancecoin",
  MATIC: "matic-network",
  AVAX: "avalanche-2",
  ARB: "arbitrum",
};

async function getCoinPrice(coin: string): Promise<number> {
  try {
    const id = COINGECKO_IDS[coin.toUpperCase()];
    if (!id) return 0;
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`,
      { next: { revalidate: 300 } }
    );
    const data = await res.json();
    return data[id]?.usd ?? 0;
  } catch {
    return 0;
  }
}

async function getEthBalance(address: string): Promise<number> {
  try {
    const apiKey = process.env.ETHERSCAN_API_KEY;
    const url = apiKey
      ? `https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest&apikey=${apiKey}`
      : `https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.status === "1") {
      return parseInt(data.result) / 1e18;
    }
    return 0;
  } catch {
    return 0;
  }
}

async function getBtcBalance(address: string): Promise<number> {
  try {
    const res = await fetch(`https://blockchain.info/q/addressbalance/${address}?confirmations=3`);
    const satoshi = await res.text();
    return parseInt(satoshi) / 1e8;
  } catch {
    return 0;
  }
}

export async function fetchOnChainBalance(address: string, chain: string): Promise<CryptoBalance> {
  let balance = 0;

  switch (chain.toUpperCase()) {
    case "ETH":
    case "MATIC":
    case "ARB":
    case "BNB":
      balance = await getEthBalance(address);
      break;
    case "BTC":
      balance = await getBtcBalance(address);
      break;
    default:
      return { balance: 0, usdValue: 0 };
  }

  const price = await getCoinPrice(chain);
  return { balance, usdValue: balance * price };
}
