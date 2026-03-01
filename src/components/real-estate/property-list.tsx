"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PropertyForm, type PropertyData } from "./property-form";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useCurrency } from "@/hooks/use-currency";
import { useTranslations } from "next-intl";
import { Plus, Pencil, Trash2 } from "lucide-react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function PropertyList() {
  const { data: properties, mutate } = useSWR("/api/real-estate", fetcher);
  const [formOpen, setFormOpen] = useState(false);
  const [editData, setEditData] = useState<PropertyData | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { formatValue } = useCurrency();
  const t = useTranslations("realEstate");
  const tc = useTranslations("common");

  const handleSave = async (data: PropertyData) => {
    if (data.id) {
      await fetch(`/api/real-estate/${data.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    } else {
      await fetch("/api/real-estate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    }
    setEditData(undefined);
    mutate();
  };

  const handleDelete = async () => {
    if (deleteId) {
      await fetch(`/api/real-estate/${deleteId}`, { method: "DELETE" });
      setDeleteId(null);
      mutate();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <Button onClick={() => { setEditData(undefined); setFormOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" /> {t("addProperty")}
        </Button>
      </div>

      {!properties || properties.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center h-32 text-muted-foreground">{tc("noData")}</CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          <div className="hidden md:block rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-3 text-left">{t("propertyName")}</th>
                  <th className="p-3 text-left">{t("location")}</th>
                  <th className="p-3 text-right">{t("purchasePrice")}</th>
                  <th className="p-3 text-right">{t("currentValue")}</th>
                  <th className="p-3 text-right">USD Value</th>
                  <th className="p-3 text-left">{t("purchaseDate")}</th>
                  <th className="p-3 text-center">{tc("actions")}</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((p: PropertyData & { id: string }) => (
                  <tr key={p.id} className="border-b">
                    <td className="p-3 font-medium">{p.name}</td>
                    <td className="p-3 text-muted-foreground">{p.location}</td>
                    <td className="p-3 text-right">{p.purchasePrice.toLocaleString()} {p.currency}</td>
                    <td className="p-3 text-right">{p.currentValue.toLocaleString()} {p.currency}</td>
                    <td className="p-3 text-right font-bold">{formatValue(p.usdValue ?? 0)}</td>
                    <td className="p-3">{new Date(p.purchaseDate).toLocaleDateString()}</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => { setEditData(p); setFormOpen(true); }}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(p.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {properties.map((p: PropertyData & { id: string }) => (
              <Card key={p.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{p.name}</CardTitle>
                    <span className="font-bold">{formatValue(p.usdValue ?? 0)}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{p.location}</p>
                  <div className="flex justify-between mt-1 text-sm">
                    <span>Current: {p.currentValue.toLocaleString()} {p.currency}</span>
                    <span className={p.currentValue >= p.purchasePrice ? "text-green-500" : "text-red-500"}>
                      {p.currentValue >= p.purchasePrice ? "▲" : "▼"} {((p.currentValue - p.purchasePrice) / p.purchasePrice * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-end gap-1 mt-2">
                    <Button variant="ghost" size="sm" onClick={() => { setEditData(p); setFormOpen(true); }}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteId(p.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <PropertyForm open={formOpen} onOpenChange={setFormOpen} onSave={handleSave} initialData={editData} />
      <ConfirmDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} onConfirm={handleDelete} />
    </div>
  );
}
