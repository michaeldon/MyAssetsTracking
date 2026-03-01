"use client";

import { useState, useEffect, useCallback } from "react";
import { TotalValueCard } from "@/components/dashboard/total-value-card";
import { CategoryBreakdown } from "@/components/dashboard/category-breakdown";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { ExchangeRateBar } from "@/components/dashboard/exchange-rate-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrency } from "@/hooks/use-currency";
import { useTranslations } from "next-intl";
import { Wallet, ArrowLeftRight, Landmark, Building2, Package } from "lucide-react";

interface DashboardData {
  total: number;
  breakdown: {
    crypto: number;
    exchange: number;
    bank: number;
    realEstate: number;
    other: number;
  };
  todayChange: number;
  todayChangePercent: number;
  snapshots: Array<{
    date: string;
    totalValue: number;
    cryptoValue: number;
    exchangeValue: number;
    bankValue: number;
    realEstateValue: number;
    otherValue: number;
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [period, setPeriod] = useState("30d");
  const { formatValue } = useCurrency();
  const t = useTranslations("dashboard");

  const fetchData = useCallback(async () => {
    const res = await fetch(`/api/dashboard?period=${period}`);
    const json = await res.json();
    setData(json);
  }, [period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (!data) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;
  }

  const categoryCards = [
    { key: "crypto", icon: Wallet, value: data.breakdown.crypto, color: "text-chart-1" },
    { key: "exchange", icon: ArrowLeftRight, value: data.breakdown.exchange, color: "text-chart-2" },
    { key: "bank", icon: Landmark, value: data.breakdown.bank, color: "text-chart-3" },
    { key: "realEstate", icon: Building2, value: data.breakdown.realEstate, color: "text-chart-4" },
    { key: "other", icon: Package, value: data.breakdown.other, color: "text-chart-5" },
  ];

  return (
    <div className="space-y-6">
      <ExchangeRateBar />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <TotalValueCard
          total={data.total}
          todayChange={data.todayChange}
          todayChangePercent={data.todayChangePercent}
        />
        {categoryCards.map((cat) => (
          <Card key={cat.key}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t(`categories.${cat.key}`)}
              </CardTitle>
              <cat.icon className={`h-4 w-4 ${cat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{formatValue(cat.value)}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <TrendChart snapshots={data.snapshots} onPeriodChange={setPeriod} />
        <CategoryBreakdown breakdown={data.breakdown} />
      </div>
    </div>
  );
}
