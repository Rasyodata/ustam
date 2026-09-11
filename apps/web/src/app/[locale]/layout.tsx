import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Header } from "@/components/Header";
import "../globals.css";

export const metadata: Metadata = {
  title: "Ustam — İşini Ustasına Bırak",
  description: "Tamirat, imalat ve teknik servis işleriniz için ilan açın, ustalardan teklif alın.",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as never)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <Header />
          <main>{children}</main>
          <footer className="border-t border-white/10 mt-10 py-6 text-white/50 text-sm">
            <div className="max-w-5xl mx-auto px-5">© 2026 Ustam · İşini ustasına bırak.</div>
          </footer>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
