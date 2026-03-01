"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrency } from "@/hooks/use-currency";
import { useTranslations } from "next-intl";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface CategoryBreakdownProps {
  breakdown: {
    crypto: number;
    exchange: number;
    bank: number;
    realEstate: number;
    other: number;
  };
}

const COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#8b5cf6", "#ec4899"];

export function CategoryBreakdown({ breakdown }: CategoryBreakdownProps) {
  const { formatValue } = useCurrency();
  const t = useTranslations("dashboard");

  const data = [
    { name: t("categories.crypto"), value: breakdown.crypto },
    { name: t("categories.exchange"), value: breakdown.exchange },
    { name: t("categories.bank"), value: breakdown.bank },
    { name: t("categories.realEstate"), value: breakdown.realEstate },
    { name: t("categories.other"), value: breakdown.other },
  ].filter((d) => d.value > 0);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">{t("categoryBreakdown")}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
          {t("categories.crypto")} - No data
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{t("categoryBreakdown")}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => formatValue(value)}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
