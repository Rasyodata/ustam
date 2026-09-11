"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { LOCALES, type Locale } from "@ustam/shared";
import { useTransition } from "react";

const FLAGS: Record<Locale, string> = { tr: "🇹🇷", en: "🇬🇧", de: "🇩🇪", fr: "🇫🇷", es: "🇪🇸" };

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <select
      value={locale}
      disabled={isPending}
      onChange={(e) =>
        startTransition(() => router.replace(pathname, { locale: e.target.value as Locale }))
      }
      className="bg-ink-card border border-white/10 rounded-lg px-3 py-2 text-sm font-bold cursor-pointer"
      aria-label="Language"
    >
      {LOCALES.map((l) => (
        <option key={l} value={l}>
          {FLAGS[l]} {l.toUpperCase()}
        </option>
      ))}
    </select>
  );
}
