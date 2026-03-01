"use client";

import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useTranslations } from "next-intl";

interface ExchangeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: ExchangeData) => void;
  initialData?: ExchangeData;
}

export interface ExchangeData {
  id?: string;
  exchange: string;
  name: string;
  apiKey?: string;
  apiSecret?: string;
  passphrase?: string;
  autoFetch: boolean;
  totalUsd: number;
}

const EXCHANGES = ["Binance", "Coinbase", "OKX", "Kraken", "Bybit"];

export function ExchangeForm({ open, onOpenChange, onSave, initialData }: ExchangeFormProps) {
  const t = useTranslations("exchanges");
  const tc = useTranslations("common");
  const [form, setForm] = useState<ExchangeData>(
    initialData || { exchange: "Binance", name: "", apiKey: "", apiSecret: "", passphrase: "", autoFetch: false, totalUsd: 0 }
  );

  const handleSave = () => {
    onSave(form);
    onOpenChange(false);
    if (!initialData) setForm({ exchange: "Binance", name: "", apiKey: "", apiSecret: "", passphrase: "", autoFetch: false, totalUsd: 0 });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? t("editAccount") : t("addAccount")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>{t("exchange")}</Label>
            <Select value={form.exchange} onValueChange={(v) => setForm({ ...form, exchange: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {EXCHANGES.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{t("accountName")}</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <Label>{t("apiKey")}</Label>
            <Input value={form.apiKey || ""} onChange={(e) => setForm({ ...form, apiKey: e.target.value })} type="password" />
          </div>
          <div>
            <Label>{t("apiSecret")}</Label>
            <Input value={form.apiSecret || ""} onChange={(e) => setForm({ ...form, apiSecret: e.target.value })} type="password" />
          </div>
          {form.exchange === "OKX" && (
            <div>
              <Label>{t("passphrase")}</Label>
              <Input value={form.passphrase || ""} onChange={(e) => setForm({ ...form, passphrase: e.target.value })} type="password" />
            </div>
          )}
          <div>
            <Label>{t("totalValue")} (USD)</Label>
            <Input type="number" value={form.totalUsd} onChange={(e) => setForm({ ...form, totalUsd: parseFloat(e.target.value) || 0 })} />
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={form.autoFetch} onCheckedChange={(v) => setForm({ ...form, autoFetch: v })} />
            <Label>{t("autoFetch")}</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{tc("cancel")}</Button>
          <Button onClick={handleSave}>{tc("save")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
