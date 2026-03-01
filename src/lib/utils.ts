import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency: string = "USD"): string {
  const symbols: Record<string, string> = {
    USD: "$",
    HKD: "HK$",
    CNY: "¥",
  };
  const symbol = symbols[currency] || "$";
  return `${symbol}${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function maskAccountNumber(num: string): string {
  if (num.length <= 4) return num;
  return "****" + num.slice(-4);
}
