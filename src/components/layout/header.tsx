"use client";

import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { CurrencySwitcher } from "@/components/shared/currency-switcher";
import { useCurrency } from "@/hooks/use-currency";
import { useTranslations } from "next-intl";

export function Header() {
  const { rates } = useCurrency();
  const t = useTranslations("dashboard");

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2 md:hidden">
          <span className="font-bold text-lg">AssetTracker</span>
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
          <span>{t("exchangeRate")}:</span>
          <span className="font-mono">1 USD = {rates.HKD.toFixed(2)} HKD = {rates.CNY.toFixed(2)} CNY</span>
        </div>
        <div className="flex items-center gap-2">
          <CurrencySwitcher />
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
