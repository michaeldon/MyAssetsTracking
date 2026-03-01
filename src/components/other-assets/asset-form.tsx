"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslations } from "next-intl";

export interface AssetData {
  id?: string;
  name: string;
  category: string;
  value: number;
  currency: string;
  usdValue?: number;
  description?: string;
}

interface AssetFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: AssetData) => void;
  initialData?: AssetData;
}

const CURRENCIES = ["USD", "HKD", "CNY", "EUR", "GBP"];
const CATEGORIES = ["vehicle", "jewelry", "art", "stocks", "other"];

export function AssetForm({ open, onOpenChange, onSave, initialData }: AssetFormProps) {
  const t = useTranslations("otherAssets");
  const tc = useTranslations("common");
  const empty: AssetData = { name: "", category: "other", value: 0, currency: "USD", description: "" };
  const [form, setForm] = useState<AssetData>(initialData || empty);

  const handleSave = () => {
    onSave(form);
    onOpenChange(false);
    if (!initialData) setForm(empty);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{initialData ? t("editAsset") : t("addAsset")}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>{t("assetName")}</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <Label>{t("category")}</Label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{t(`categories.${c}`)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{tc("currency")}</Label>
              <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{tc("value")} ({form.currency})</Label>
              <Input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: parseFloat(e.target.value) || 0 })} />
            </div>
          </div>
          <div>
            <Label>{t("description")}</Label>
            <Input value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
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
