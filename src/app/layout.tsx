import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Asset Tracker",
  description: "Personal asset tracking dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
