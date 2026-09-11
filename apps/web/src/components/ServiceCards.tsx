"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { SERVICES, POP_LABEL, serviceImage, type ServiceItem } from "@/lib/services";

const SEARCH_PH: Record<string, string> = {
  tr: "hizmeti ara…",
  en: "search service…",
  de: "Dienst suchen…",
  fr: "rechercher un service…",
  es: "buscar servicio…",
};

/** armut.com tarzı: arama çubuğu + altında resimli popüler hizmet kartları. */
export function ServiceCards({ group, groupLabel }: { group: string; groupLabel?: string }) {
  const t = useTranslations();
  const locale = useLocale();
  const [q, setQ] = useState("");
  const list = SERVICES[group];
  if (!list?.length) return null;

  const name = (s: ServiceItem) => (s as any)[locale] ?? s.en ?? s.tr;
  const GRADS = [
    "linear-gradient(135deg,#ffe4cf,#ffcfa1)",
    "linear-gradient(135deg,#d7f0ff,#a9deff)",
    "linear-gradient(135deg,#e3ffe0,#b8f5bd)",
    "linear-gradient(135deg,#ffe0ec,#ffc2da)",
    "linear-gradient(135deg,#ece2ff,#d0c2ff)",
    "linear-gradient(135deg,#fff3c4,#ffe08a)",
    "linear-gradient(135deg,#d9fff4,#a9f0e0)",
    "linear-gradient(135deg,#ffe0e0,#ffc2c2)",
  ];
  const filtered = q
    ? list.filter((s) => name(s).toLocaleLowerCase("tr").includes(q.toLocaleLowerCase("tr")))
    : list;

  return (
    <div className="mb-10">
      {/* Arama çubuğu */}
      <div className="flex gap-2 bg-white border border-slate-200 p-2 rounded-2xl max-w-2xl mb-5">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={`${groupLabel ?? ""} ${SEARCH_PH[locale] ?? SEARCH_PH.en}`.trim()}
          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none text-sm"
        />
        <span className="grid place-items-center px-3 text-slate-400">🔎</span>
      </div>

      <h2 className="text-xl font-bold mb-4">{POP_LABEL[locale] ?? POP_LABEL.en}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {filtered.map((s, i) => (
          <Link
            key={i}
            href="/post"
            className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-brand hover:-translate-y-1 transition flex flex-col"
          >
            <div className="h-28 relative grid place-items-center text-6xl overflow-hidden" style={{ background: GRADS[i % GRADS.length] }}>
              <span>{s.icon}</span>
              <img
                src={serviceImage(s.q)}
                alt={name(s)}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
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
        {filtered.length === 0 && <p className="text-slate-400 col-span-full">—</p>}
      </div>
    </div>
  );
}
