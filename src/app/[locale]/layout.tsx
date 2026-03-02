import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { CurrencyProvider } from "@/hooks/use-currency";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = (await import(`@/messages/${locale}.json`)).default;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <CurrencyProvider>
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1 md:ml-60 pb-16 md:pb-0">
            <Header />
            <main className="p-4 md:p-6">{children}</main>
          </div>
        </div>
        <MobileNav />
      </CurrencyProvider>
    </NextIntlClientProvider>
  );
}
