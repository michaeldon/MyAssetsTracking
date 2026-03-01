"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { CurrencySwitcher } from "@/components/shared/currency-switcher";
import { CheckCircle, Camera, Download } from "lucide-react";

export default function SettingsPage() {
  const t = useTranslations("settings");
  const [snapshotStatus, setSnapshotStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const triggerSnapshot = async () => {
    setSnapshotStatus("loading");
    try {
      const res = await fetch("/api/snapshot", { method: "POST" });
      if (res.ok) {
        setSnapshotStatus("success");
        setTimeout(() => setSnapshotStatus("idle"), 3000);
      } else {
        setSnapshotStatus("error");
      }
    } catch {
      setSnapshotStatus("error");
    }
  };

  const exportData = async () => {
    const [snapshots, wallets, exchanges, banks, realEstate, otherAssets] = await Promise.all([
      fetch("/api/snapshot").then((r) => r.json()),
      fetch("/api/crypto").then((r) => r.json()),
      fetch("/api/exchanges").then((r) => r.json()),
      fetch("/api/banks").then((r) => r.json()),
      fetch("/api/real-estate").then((r) => r.json()),
      fetch("/api/other-assets").then((r) => r.json()),
    ]);

    const exportData = { snapshots, wallets, exchanges, banks, realEstate, otherAssets, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `asset-tracker-export-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">{t("title")}</h1>

      <Card>
        <CardHeader><CardTitle className="text-base">{t("language")}</CardTitle></CardHeader>
        <CardContent className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">Interface language</span>
          <LanguageSwitcher />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">{t("defaultCurrency")}</CardTitle></CardHeader>
        <CardContent className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">Display currency</span>
          <CurrencySwitcher />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">{t("triggerSnapshot")}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Manually create a daily snapshot of all your current asset values.
            This happens automatically when the cron job runs (daily).
          </p>
          <Button onClick={triggerSnapshot} disabled={snapshotStatus === "loading"} className="gap-2">
            <Camera className="h-4 w-4" />
            {snapshotStatus === "loading" ? "Creating..." : snapshotStatus === "success" ? "✓ Created!" : t("triggerSnapshot")}
          </Button>
          {snapshotStatus === "success" && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" /> Snapshot saved successfully
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">{t("dataExport")}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Export all your asset data (snapshots, wallets, accounts) as a JSON file.
          </p>
          <Button variant="outline" onClick={exportData} className="gap-2">
            <Download className="h-4 w-4" /> {t("dataExport")}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Cron Setup</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            To automate daily snapshots, set up a cron job on your server to call:
          </p>
          <code className="block bg-muted rounded p-3 text-xs font-mono">
            {`# Run daily at midnight\n0 0 * * * curl -X POST http://your-domain/api/snapshot/cron -H "x-cron-secret: YOUR_CRON_SECRET"`}
          </code>
        </CardContent>
      </Card>
    </div>
  );
}
