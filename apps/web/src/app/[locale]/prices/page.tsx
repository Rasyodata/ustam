import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { PRICE_RANGES, formatTRY } from "@/lib/price-guide";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "priceGuide" });
  return { title: `${t("indexTitle")} | Ustam`, description: t("indexSubtitle") };
}

export default async function PricesIndex({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <div className="max-w-4xl mx-auto px-5 py-10">
      <h1 className="text-3xl font-black mb-2">{t("priceGuide.indexTitle")}</h1>
      <p className="text-white/60 mb-8">{t("priceGuide.indexSubtitle")}</p>
      <div className="grid sm:grid-cols-2 gap-4">
        {PRICE_RANGES.map((p) => (
          <Link
            key={p.slug}
            href={`/prices/${p.slug}`}
            className="bg-ink-card border border-white/10 rounded-xl p-5 hover:border-brand transition flex items-center gap-4"
          >
            <span className="text-3xl">{p.icon}</span>
            <div>
              <div className="font-bold">{t(`categories.${p.slug}` as any)}</div>
              <div className="text-brand-light text-sm font-semibold">
                {formatTRY(p.min)} – {formatTRY(p.max)} ₺
              </div>
            </div>
          </Link>
        ))}
      </div>
      <p className="text-white/40 text-xs mt-6">{t("priceGuide.disclaimer")}</p>
    </div>
  );
}
