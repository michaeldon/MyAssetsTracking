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

interface WalletFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: WalletData) => void;
  initialData?: WalletData;
}

export interface WalletData {
  id?: string;
  name: string;
  address: string;
  chain: string;
  balance: number;
  usdValue: number;
  autoFetch: boolean;
}

const CHAINS = ["ETH", "BTC", "SOL", "BNB", "MATIC", "AVAX", "ARB"];

export function WalletForm({ open, onOpenChange, onSave, initialData }: WalletFormProps) {
  const t = useTranslations("crypto");
  const tc = useTranslations("common");
  const [form, setForm] = useState<WalletData>(
    initialData || { name: "", address: "", chain: "ETH", balance: 0, usdValue: 0, autoFetch: false }
  );

  const handleSave = () => {
    onSave(form);
    onOpenChange(false);
    if (!initialData) setForm({ name: "", address: "", chain: "ETH", balance: 0, usdValue: 0, autoFetch: false });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? t("editWallet") : t("addWallet")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>{t("walletName")}</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <Label>{t("address")}</Label>
            <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="0x..." />
          </div>
          <div>
            <Label>{t("chain")}</Label>
            <Select value={form.chain} onValueChange={(v) => setForm({ ...form, chain: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CHAINS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{t("balance")}</Label>
              <Input type="number" value={form.balance} onChange={(e) => setForm({ ...form, balance: parseFloat(e.target.value) || 0 })} />
            </div>
            <div>
              <Label>{t("usdValue")}</Label>
              <Input type="number" value={form.usdValue} onChange={(e) => setForm({ ...form, usdValue: parseFloat(e.target.value) || 0 })} />
            </div>
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
