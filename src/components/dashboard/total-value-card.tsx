"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrency } from "@/hooks/use-currency";
import { useTranslations } from "next-intl";
import { TrendingUp, TrendingDown } from "lucide-react";

interface TotalValueCardProps {
  total: number;
  todayChange: number;
  todayChangePercent: number;
}

export function TotalValueCard({ total, todayChange, todayChangePercent }: TotalValueCardProps) {
  const { formatValue } = useCurrency();
  const t = useTranslations("dashboard");
  const isPositive = todayChange >= 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {t("totalNetWorth")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{formatValue(total)}</div>
        <div className="flex items-center gap-1 mt-1">
          {isPositive ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
          <span className={`text-sm ${isPositive ? "text-green-500" : "text-red-500"}`}>
            {isPositive ? "+" : ""}{formatValue(todayChange)} ({todayChangePercent.toFixed(2)}%)
          </span>
          <span className="text-xs text-muted-foreground ml-1">{t("todayChange")}</span>
        </div>
      </CardContent>
    </Card>
  );
}
