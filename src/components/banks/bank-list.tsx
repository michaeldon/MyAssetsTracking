"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BankForm, type BankData } from "./bank-form";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useCurrency } from "@/hooks/use-currency";
import { useTranslations } from "next-intl";
import { Plus, Pencil, Trash2 } from "lucide-react";
import useSWR from "swr";
import { maskAccountNumber } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function BankList() {
  const { data: accounts, mutate } = useSWR("/api/banks", fetcher);
  const [formOpen, setFormOpen] = useState(false);
  const [editData, setEditData] = useState<BankData | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { formatValue } = useCurrency();
  const t = useTranslations("banks");
  const tc = useTranslations("common");

  const handleSave = async (data: BankData) => {
    if (data.id) {
      await fetch(`/api/banks/${data.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    } else {
      await fetch("/api/banks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    }
    setEditData(undefined);
    mutate();
  };

  const handleDelete = async () => {
    if (deleteId) {
      await fetch(`/api/banks/${deleteId}`, { method: "DELETE" });
      setDeleteId(null);
      mutate();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <Button onClick={() => { setEditData(undefined); setFormOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" /> {t("addAccount")}
        </Button>
      </div>

      {!accounts || accounts.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center h-32 text-muted-foreground">{tc("noData")}</CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          <div className="hidden md:block rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-3 text-left">{t("bankName")}</th>
                  <th className="p-3 text-left">{t("accountName")}</th>
                  <th className="p-3 text-left">{t("accountNumber")}</th>
                  <th className="p-3 text-left">{t("accountType")}</th>
                  <th className="p-3 text-right">{t("balance")}</th>
                  <th className="p-3 text-right">USD Value</th>
                  <th className="p-3 text-center">{tc("actions")}</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((a: BankData & { id: string }) => (
                  <tr key={a.id} className="border-b">
                    <td className="p-3 font-medium">{a.bankName}</td>
                    <td className="p-3">{a.accountName}</td>
                    <td className="p-3 font-mono text-xs">{maskAccountNumber(a.accountNumber)}</td>
                    <td className="p-3 capitalize">{a.accountType}</td>
                    <td className="p-3 text-right font-mono">{a.balance.toLocaleString()} {a.currency}</td>
                    <td className="p-3 text-right font-bold">{formatValue(a.usdValue ?? 0)}</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => { setEditData(a); setFormOpen(true); }}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(a.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {accounts.map((a: BankData & { id: string }) => (
              <Card key={a.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{a.bankName}</CardTitle>
                    <span className="font-bold">{formatValue(a.usdValue ?? 0)}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{a.accountName} · {maskAccountNumber(a.accountNumber)}</p>
                  <p className="text-sm text-muted-foreground">{a.balance.toLocaleString()} {a.currency} · {a.accountType}</p>
                  <div className="flex justify-end gap-1 mt-2">
                    <Button variant="ghost" size="sm" onClick={() => { setEditData(a); setFormOpen(true); }}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteId(a.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <BankForm open={formOpen} onOpenChange={setFormOpen} onSave={handleSave} initialData={editData} />
      <ConfirmDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} onConfirm={handleDelete} />
    </div>
  );
}
