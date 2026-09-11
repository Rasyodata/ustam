"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { clientApi } from "@/lib/client-api";
import { TierBadge } from "./TierBadge";
import { PRICE_RANGES } from "@/lib/price-guide";

/** Puana göre sıralı usta dizini + kategori filtresi + teklif daveti. */
export function ProvidersDirectory({ categories }: { categories: { id: string; slug: string; name: string }[] }) {
  const t = useTranslations();
  const [categoryId, setCategoryId] = useState<string>("");
  const [items, setItems] = useState<any[]>([]);
  const [offline, setOffline] = useState(false);
  const [requested, setRequested] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setOffline(false);
    clientApi
      .providers(categoryId ? { categoryId } : {})
      .then(setItems)
      .catch(() => setOffline(true));
  }, [categoryId]);

  async function requestQuote(providerUserId: string) {
    try {
      await clientApi.requestQuote(providerUserId, {});
      setRequested((r) => ({ ...r, [providerUserId]: true }));
    } catch {
      alert(t("pros.loginToRequest"));
    }
  }

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div>
      {/* Kategori filtresi */}
      <div className="flex gap-2 flex-wrap mb-6">
        <button
          onClick={() => setCategoryId("")}
          className={`px-3 py-1.5 rounded-full text-sm font-semibold ${categoryId === "" ? "bg-brand text-black" : "bg-ink-card border border-white/10"}`}
        >
          {t("pros.all")}
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategoryId(c.id)}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold ${categoryId === c.id ? "bg-brand text-black" : "bg-ink-card border border-white/10"}`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {offline && (
        <div className="bg-brand/10 border border-dashed border-brand rounded-xl p-4 text-brand-light text-sm mb-6">
          ⚙️ Backend çalışmıyor. <code>pnpm dev</code> ile başlatın.
        </div>
      )}

      <div className="space-y-3">
        {items.map((p, i) => (
          <div key={p.userId} className="bg-ink-card border border-white/10 rounded-xl p-4 flex items-center gap-4">
            <div className="text-2xl w-8 text-center font-black text-white/50">
              {medals[i] ?? `#${p.rank}`}
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand to-brand-light grid place-items-center text-black font-black text-lg">
              {p.displayName?.[0] ?? "?"}
            </div>
            <div className="flex-1 min-w-0">
              <Link href={`/providers/${p.userId}`} className="font-bold hover:text-brand-light flex items-center gap-2 flex-wrap">
                {p.businessName || p.displayName}
                <TierBadge avgRating={p.avgRating} reviewCount={p.reviewCount} completedJobs={p.completedJobs} verified={p.verified} />
              </Link>
              <div className="text-white/50 text-sm">
                <span className="text-amber-400 font-bold">★ {Number(p.avgRating).toFixed(1)}</span> · {p.reviewCount} {t("review.reviews")} · {p.completedJobs} {t("pros.jobs")}
              </div>
            </div>
            <button
              disabled={requested[p.userId]}
              onClick={() => requestQuote(p.userId)}
              className="text-sm font-bold px-4 py-2 rounded-lg bg-gradient-to-br from-brand to-brand-light text-black disabled:opacity-60 whitespace-nowrap"
            >
              {requested[p.userId] ? t("pros.requested") : t("pros.requestQuote")}
            </button>
          </div>
        ))}
        {!offline && items.length === 0 && <p className="text-white/50">—</p>}
      </div>
    </div>
  );
}

/** Fiyat rehberi slug'larından basit kategori listesi (backend kapalıyken de çalışır). */
export function fallbackCategories(t: (k: string) => string) {
  return PRICE_RANGES.map((p) => ({ id: p.slug, slug: p.slug, name: t(`categories.${p.slug}`) }));
}
