import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { api, type StatsOverview } from "@/lib/api";
import { CityAnalytics } from "@/components/CityAnalytics";
import type { Locale } from "@ustam/shared";

// Backend kapalıyken gösterilecek örnek analiz
const FALLBACK: StatsOverview = {
  totals: { listings: 89300, activeListings: 12840, providers: 12400, offers: 240500, cities: 81, categories: 12 },
  categories: [
    { id: "1", slug: "construction", icon: "🏗️", parentId: null, name: "İnşaat & Tadilat", listingCount: 1530, providerCount: 980 },
    { id: "2", slug: "plumbing", icon: "🚰", parentId: null, name: "Tesisat & Su", listingCount: 1240, providerCount: 1100 },
    { id: "3", slug: "cleaning", icon: "🧹", parentId: null, name: "Temizlik", listingCount: 1120, providerCount: 640 },
    { id: "4", slug: "electrical", icon: "💡", parentId: null, name: "Elektrik", listingCount: 980, providerCount: 870 },
    { id: "5", slug: "appliance", icon: "🧰", parentId: null, name: "Beyaz Eşya Servisi", listingCount: 870, providerCount: 520 },
    { id: "6", slug: "painting", icon: "🎨", parentId: null, name: "Boya & Badana", listingCount: 760, providerCount: 410 },
    { id: "7", slug: "moving", icon: "🚚", parentId: null, name: "Nakliyat", listingCount: 690, providerCount: 300 },
    { id: "8", slug: "furniture", icon: "🪚", parentId: null, name: "Mobilya & Marangoz", listingCount: 640, providerCount: 280 },
    { id: "9", slug: "hvac", icon: "❄️", parentId: null, name: "Isıtma & Soğutma", listingCount: 520, providerCount: 260 },
    { id: "10", slug: "ironwork", icon: "🔩", parentId: null, name: "Demir & Kaynak", listingCount: 410, providerCount: 190 },
    { id: "11", slug: "roofing", icon: "🏠", parentId: null, name: "Çatı & İzolasyon", listingCount: 330, providerCount: 150 },
    { id: "12", slug: "manufacturing", icon: "🏭", parentId: null, name: "İmalat & Üretim", listingCount: 280, providerCount: 210 },
  ],
};

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  let stats: StatsOverview = FALLBACK;
  try {
    const live = await api.stats(locale as Locale);
    if (live?.categories?.length) stats = live;
  } catch {
    /* fallback */
  }

  return (
    <div>
      {/* HERO + arama */}
      <section className="max-w-5xl mx-auto px-5 pt-12 pb-6">
        <h1 className="text-3xl sm:text-4xl font-black leading-tight mb-3">{t("home.heroTitle")}</h1>
        <p className="text-slate-500 mb-6 max-w-xl">{t("home.heroSubtitle")}</p>
        <form action={`/${locale}/listings`} className="flex gap-2 bg-white border border-slate-200 p-2.5 rounded-2xl max-w-2xl">
          <input
            name="q"
            placeholder={t("common.searchPlaceholder")}
            className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 outline-none"
          />
          <button className="font-bold px-5 rounded-xl bg-gradient-to-br from-brand to-brand-light text-black">
            {t("common.search")} 🔎
          </button>
        </form>
      </section>

      {/* ŞEHİR BAZLI İŞ + USTA ANALİZİ */}
      <section className="max-w-5xl mx-auto px-5 py-4">
        <CityAnalytics initial={stats} />
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-5 py-10">
        <div className="bg-gradient-to-br from-brand/20 to-brand-light/10 border border-brand/40 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4">
          <div className="font-bold text-lg">{t("home.ctaPost")}</div>
          <div className="flex gap-2">
            <Link href="/listings" className="font-bold px-5 py-2.5 rounded-xl bg-white border border-slate-200">
              {t("analytics.viewJobs")}
            </Link>
            <Link href="/post" className="font-bold px-5 py-2.5 rounded-xl bg-gradient-to-br from-brand to-brand-light text-black">
              + {t("listing.create")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
