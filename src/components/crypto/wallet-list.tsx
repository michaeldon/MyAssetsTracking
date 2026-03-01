"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WalletForm, type WalletData } from "./wallet-form";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useCurrency } from "@/hooks/use-currency";
import { useTranslations } from "next-intl";
import { Plus, Pencil, Trash2, RefreshCw } from "lucide-react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function WalletList() {
  const { data: wallets, mutate } = useSWR("/api/crypto", fetcher);
  const [formOpen, setFormOpen] = useState(false);
  const [editData, setEditData] = useState<WalletData | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { formatValue } = useCurrency();
  const t = useTranslations("crypto");
  const tc = useTranslations("common");

  const handleSave = async (data: WalletData) => {
    if (data.id) {
      await fetch(`/api/crypto/${data.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    } else {
      await fetch("/api/crypto", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    }
    setEditData(undefined);
    mutate();
  };

  const handleDelete = async () => {
    if (deleteId) {
      await fetch(`/api/crypto/${deleteId}`, { method: "DELETE" });
      setDeleteId(null);
      mutate();
    }
  };

  const handleSync = async (id: string) => {
    await fetch("/api/sync/crypto", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ walletId: id }) });
    mutate();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <Button onClick={() => { setEditData(undefined); setFormOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" /> {t("addWallet")}
        </Button>
      </div>

      {!wallets || wallets.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center h-32 text-muted-foreground">
            {tc("noData")}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {/* Desktop table */}
          <div className="hidden md:block">
            <div className="rounded-lg border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left">{t("walletName")}</th>
                    <th className="p-3 text-left">{t("chain")}</th>
                    <th className="p-3 text-left">{t("address")}</th>
                    <th className="p-3 text-right">{t("balance")}</th>
                    <th className="p-3 text-right">{t("usdValue")}</th>
                    <th className="p-3 text-center">{tc("actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {wallets.map((w: WalletData & { id: string }) => (
                    <tr key={w.id} className="border-b">
                      <td className="p-3">{w.name}</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-muted text-xs font-mono">{w.chain}</span></td>
                      <td className="p-3 font-mono text-xs">{w.address.slice(0, 8)}...{w.address.slice(-6)}</td>
                      <td className="p-3 text-right font-mono">{w.balance.toFixed(4)}</td>
                      <td className="p-3 text-right">{formatValue(w.usdValue)}</td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleSync(w.id)}>
                            <RefreshCw className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => { setEditData(w); setFormOpen(true); }}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteId(w.id)}>
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {wallets.map((w: WalletData & { id: string }) => (
              <Card key={w.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{w.name}</CardTitle>
                    <span className="px-2 py-0.5 rounded bg-muted text-xs font-mono">{w.chain}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs font-mono text-muted-foreground truncate">{w.address}</p>
                  <div className="flex justify-between mt-2">
                    <span className="text-sm">{w.balance.toFixed(4)} {w.chain}</span>
                    <span className="font-bold">{formatValue(w.usdValue)}</span>
                  </div>
                  <div className="flex justify-end gap-1 mt-2">
                    <Button variant="ghost" size="sm" onClick={() => handleSync(w.id)}><RefreshCw className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => { setEditData(w); setFormOpen(true); }}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteId(w.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <WalletForm open={formOpen} onOpenChange={setFormOpen} onSave={handleSave} initialData={editData} />
      <ConfirmDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} onConfirm={handleDelete} />
    </div>
  );
}
