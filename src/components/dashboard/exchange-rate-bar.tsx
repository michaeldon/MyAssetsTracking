"use client";

import { useCurrency } from "@/hooks/use-currency";
import { useTranslations } from "next-intl";

export function ExchangeRateBar() {
  const { rates } = useCurrency();
  const t = useTranslations("dashboard");

  return (
    <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-3 text-sm">
      <span className="text-muted-foreground font-medium">{t("exchangeRate")}:</span>
      <div className="flex items-center gap-4 font-mono text-xs">
        <span>1 USD = <strong>{rates.HKD.toFixed(4)}</strong> HKD</span>
        <span>1 USD = <strong>{rates.CNY.toFixed(4)}</strong> CNY</span>
      </div>
    </div>
  );
}
