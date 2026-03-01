"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslations } from "next-intl";

export interface BankData {
  id?: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  accountType: string;
  currency: string;
  balance: number;
  usdValue?: number;
  notes?: string;
}

interface BankFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: BankData) => void;
  initialData?: BankData;
}

const ACCOUNT_TYPES = ["checking", "savings", "fixedDeposit", "other"];
const CURRENCIES = ["USD", "HKD", "CNY", "EUR", "GBP"];

export function BankForm({ open, onOpenChange, onSave, initialData }: BankFormProps) {
  const t = useTranslations("banks");
  const tc = useTranslations("common");
  const empty: BankData = { bankName: "", accountName: "", accountNumber: "", accountType: "checking", currency: "USD", balance: 0, notes: "" };
  const [form, setForm] = useState<BankData>(initialData || empty);

  const handleSave = () => {
    onSave(form);
    onOpenChange(false);
    if (!initialData) setForm(empty);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{initialData ? t("editAccount") : t("addAccount")}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>{t("bankName")}</Label>
            <Input value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} />
          </div>
          <div>
            <Label>{t("accountName")}</Label>
            <Input value={form.accountName} onChange={(e) => setForm({ ...form, accountName: e.target.value })} />
          </div>
          <div>
            <Label>{t("accountNumber")}</Label>
            <Input value={form.accountNumber} onChange={(e) => setForm({ ...form, accountNumber: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{t("accountType")}</Label>
              <Select value={form.accountType} onValueChange={(v) => setForm({ ...form, accountType: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ACCOUNT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>{t(`types.${type}`)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{tc("currency")}</Label>
              <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>{t("balance")} ({form.currency})</Label>
            <Input type="number" value={form.balance} onChange={(e) => setForm({ ...form, balance: parseFloat(e.target.value) || 0 })} />
          </div>
          <div>
            <Label>{tc("notes")}</Label>
            <Input value={form.notes || ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
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
