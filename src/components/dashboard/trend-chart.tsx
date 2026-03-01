"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCurrency } from "@/hooks/use-currency";
import { useTranslations } from "next-intl";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Snapshot {
  date: string;
  totalValue: number;
  cryptoValue: number;
  exchangeValue: number;
  bankValue: number;
  realEstateValue: number;
  otherValue: number;
}

interface TrendChartProps {
  snapshots: Snapshot[];
  onPeriodChange: (period: string) => void;
}

export function TrendChart({ snapshots, onPeriodChange }: TrendChartProps) {
  const { convert, symbol } = useCurrency();
  const t = useTranslations("dashboard");
  const [period, setPeriod] = useState("30d");

  const handlePeriodChange = (p: string) => {
    setPeriod(p);
    onPeriodChange(p);
  };

  const data = snapshots.map((s) => ({
    date: s.date,
    total: convert(s.totalValue),
  }));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{t("trend")}</CardTitle>
        <Tabs value={period} onValueChange={handlePeriodChange}>
          <TabsList className="h-8">
            {["7d", "30d", "90d", "1y", "all"].map((p) => (
              <TabsTrigger key={p} value={p} className="text-xs px-2">
                {t(`period.${p}`)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
            No snapshot data yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} className="text-muted-foreground" />
              <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
              <Tooltip
                formatter={(value: number) => [
                  `${symbol}${value.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
                  "Total",
                ]}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
