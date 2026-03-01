"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface Rates {
  HKD: number;
  CNY: number;
}

interface CurrencyContextType {
  currency: string;
  setCurrency: (c: string) => void;
  rates: Rates;
  convert: (usd: number) => number;
  symbol: string;
  formatValue: (usd: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: "USD",
  setCurrency: () => {},
  rates: { HKD: 7.8, CNY: 7.23 },
  convert: (usd) => usd,
  symbol: "$",
  formatValue: (usd) => `$${usd.toFixed(2)}`,
});

const SYMBOLS: Record<string, string> = { USD: "$", HKD: "HK$", CNY: "¥" };

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState("USD");
  const [rates, setRates] = useState<Rates>({ HKD: 7.8, CNY: 7.23 });

  useEffect(() => {
    fetch("/api/exchange-rates")
      .then((r) => r.json())
      .then((data) => {
        if (data.HKD && data.CNY) setRates(data);
      })
      .catch(() => {});
  }, []);

  const convert = (usd: number) => {
    if (currency === "USD") return usd;
    if (currency === "HKD") return usd * rates.HKD;
    if (currency === "CNY") return usd * rates.CNY;
    return usd;
  };

  const symbol = SYMBOLS[currency] || "$";

  const formatValue = (usd: number) => {
    const val = convert(usd);
    return `${symbol}${val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, rates, convert, symbol, formatValue }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
