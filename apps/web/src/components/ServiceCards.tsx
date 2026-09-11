"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { SERVICES, POP_LABEL, type ServiceItem } from "@/lib/services";

/** armut.com tarzı resimli hizmet kartları (grup bazlı). */
export function ServiceCards({ group }: { group: string }) {
  const t = useTranslations();
  const locale = useLocale();
  const list = SERVICES[group];
  if (!list?.length) return null;
  const name = (s: ServiceItem) => (s as any)[locale] ?? s.en ?? s.tr;

  return (
    <div className="mb-10">
      <h2 className="text-xl font-bold mb-4">{POP_LABEL[locale] ?? POP_LABEL.en}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {list.map((s, i) => (
          <Link
            key={i}
            href="/post"
            className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-brand hover:-translate-y-1 transition flex flex-col"
          >
            <div className="h-24 bg-gradient-to-br from-orange-50 to-slate-100 grid place-items-center text-5xl">
              {s.icon}
            </div>
            <div className="p-3 flex flex-col gap-1 flex-1">
              <div className="font-semibold text-sm leading-tight">{name(s)}</div>
              <div className="text-slate-500 text-xs flex items-center gap-1.5">
                <span className="text-amber-500 font-bold">★ {s.rating}</span>
                <span>· {s.pros} {t("analytics.pros")}</span>
              </div>
              <div className="mt-auto pt-1">
                <span className="text-xs font-bold text-brand">{t("pros.requestQuote")} →</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
