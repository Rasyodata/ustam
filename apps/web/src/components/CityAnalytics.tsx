"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { clientApi } from "@/lib/client-api";
import type { StatsOverview } from "@/lib/api";

/** Şehir bazlı iş + usta analizi (canlı filtre). */
export function CityAnalytics({ initial }: { initial: StatsOverview }) {
  const t = useTranslations();
  const locale = useLocale();
  const [cityId, setCityId] = useState("");
  const [cities, setCities] = useState<{ id: string; name: string }[]>([]);
  const [stats, setStats] = useState<StatsOverview>(initial);

  useEffect(() => {
    clientApi.cities().then(setCities).catch(() => setCities([]));
  }, []);

  useEffect(() => {
    let active = true;
    clientApi
      .stats(locale, cityId || undefined)
      .then((s) => {
        if (active && s?.categories) setStats(s);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [cityId, locale]);

  const nf = (n: number) => n.toLocaleString(locale === "tr" ? "tr-TR" : locale);
  const topLevel = stats.categories.filter((c) => !c.parentId);
  const maxJobs = Math.max(1, ...topLevel.map((c) => c.listingCount));
  const maxPros = Math.max(1, ...topLevel.map((c) => c.providerCount));
  const byPros = [...topLevel].sort((a, b) => b.providerCount - a.providerCount);

  return (
    <div>
      {/* Şehir seçici */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <label className="text-sm text-white/60 font-semibold">🏙️ {t("analytics.cityFilter")}:</label>
        <select
          value={cityId}
          onChange={(e) => setCityId(e.target.value)}
          className="bg-ink-card border border-white/10 rounded-lg px-3 py-2 text-sm font-semibold outline-none"
        >
          <option value="">{t("analytics.allCities")}</option>
          {cities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Genel istatistik */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-10">
        <Tile n={nf(stats.totals.activeListings)} l={t("analytics.activeJobs")} icon="📋" />
        <Tile n={nf(stats.totals.listings)} l={t("analytics.totalJobs")} icon="🗂️" />
        <Tile n={nf(stats.totals.providers)} l={t("analytics.totalPros")} icon="🛠️" />
        <Tile n={nf(stats.totals.offers)} l={t("analytics.totalOffers")} icon="💬" />
        <Tile n={nf(stats.totals.cities)} l={t("analytics.cities")} icon="📍" />
      </div>

      {/* Kategori analizi: her kategoride iş + usta */}
      <h2 className="text-2xl font-bold mb-1">📊 {t("analytics.categoryTitle")}</h2>
      <p className="text-white/50 text-sm mb-5">{t("analytics.categorySubtitle")}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-12">
        {topLevel.map((c) => (
          <Link
            key={c.id}
            href={`/listings?categoryId=${c.id}${cityId ? `&cityId=${cityId}` : ""}`}
            className="bg-ink-card border border-white/10 rounded-xl p-4 hover:border-brand transition"
          >
            <div className="font-semibold flex items-center gap-2 mb-3">
              <span className="text-2xl">{c.icon ?? "🔧"}</span> {c.name}
            </div>
            <Row label={`📋 ${t("analytics.jobs")}`} value={nf(c.listingCount)} color="text-brand-light" />
            <Bar pct={Math.round((c.listingCount / maxJobs) * 100)} from="from-brand" to="to-brand-light" />
            <div className="h-2" />
            <Row label={`🛠️ ${t("analytics.pros")}`} value={nf(c.providerCount)} color="text-teal-300" />
            <Bar pct={Math.round((c.providerCount / maxPros) * 100)} from="from-teal-400" to="to-emerald-400" />
          </Link>
        ))}
      </div>

      {/* Usta analizi */}
      <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
        <h2 className="text-2xl font-bold">🛠️ {t("analytics.providerTitle")}</h2>
        <Link href="/providers" className="text-brand-light text-sm font-semibold">
          {t("analytics.viewPros")} →
        </Link>
      </div>
      <p className="text-white/50 text-sm mb-5">{t("analytics.providerSubtitle")}</p>
      <div className="bg-ink-card border border-white/10 rounded-2xl p-5 space-y-3">
        {byPros.slice(0, 8).map((c) => (
          <div key={c.id} className="flex items-center gap-3">
            <span className="w-40 shrink-0 text-sm flex items-center gap-2">
              <span>{c.icon ?? "🔧"}</span>
              <span className="truncate">{c.name}</span>
            </span>
            <div className="flex-1 h-2.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-400 to-emerald-400"
                style={{ width: `${Math.round((c.providerCount / maxPros) * 100)}%` }}
              />
            </div>
            <span className="w-16 text-right text-sm font-bold text-teal-300 tabular-nums">
              {nf(c.providerCount)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Tile({ n, l, icon }: { n: string; l: string; icon: string }) {
  return (
    <div className="bg-ink-card border border-white/10 rounded-xl p-4">
      <div className="text-xl mb-1">{icon}</div>
      <div className="text-2xl font-black tabular-nums">{n}</div>
      <div className="text-white/50 text-xs">{l}</div>
    </div>
  );
}
function Row({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center justify-between text-xs mb-1">
      <span className="text-white/50">{label}</span>
      <span className={`font-bold tabular-nums ${color}`}>{value}</span>
    </div>
  );
}
function Bar({ pct, from, to }: { pct: number; from: string; to: string }) {
  return (
    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
      <div className={`h-full bg-gradient-to-r ${from} ${to}`} style={{ width: `${pct}%` }} />
    </div>
  );
}
