"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslations } from "next-intl";

export interface PropertyData {
  id?: string;
  name: string;
  location: string;
  purchasePrice: number;
  currentValue: number;
  currency: string;
  usdValue?: number;
  purchaseDate: string;
  notes?: string;
}

interface PropertyFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: PropertyData) => void;
  initialData?: PropertyData;
}

const CURRENCIES = ["USD", "HKD", "CNY", "EUR", "GBP"];

export function PropertyForm({ open, onOpenChange, onSave, initialData }: PropertyFormProps) {
  const t = useTranslations("realEstate");
  const tc = useTranslations("common");
  const today = new Date().toISOString().split("T")[0];
  const empty: PropertyData = { name: "", location: "", purchasePrice: 0, currentValue: 0, currency: "USD", purchaseDate: today, notes: "" };
  const [form, setForm] = useState<PropertyData>(
    initialData
      ? { ...initialData, purchaseDate: initialData.purchaseDate ? new Date(initialData.purchaseDate).toISOString().split("T")[0] : today }
      : empty
  );

  const handleSave = () => {
    onSave(form);
    onOpenChange(false);
    if (!initialData) setForm(empty);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{initialData ? t("editProperty") : t("addProperty")}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>{t("propertyName")}</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <Label>{t("location")}</Label>
            <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{t("purchasePrice")} ({form.currency})</Label>
              <Input type="number" value={form.purchasePrice} onChange={(e) => setForm({ ...form, purchasePrice: parseFloat(e.target.value) || 0 })} />
            </div>
            <div>
              <Label>{t("currentValue")} ({form.currency})</Label>
              <Input type="number" value={form.currentValue} onChange={(e) => setForm({ ...form, currentValue: parseFloat(e.target.value) || 0 })} />
            </div>
          </div>
          <div>
            <Label>{t("purchaseDate")}</Label>
            <Input type="date" value={form.purchaseDate} onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })} />
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
