import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import { PRICE_RANGES, priceRangeBySlug, formatTRY } from "@/lib/price-guide";

/** SEO: her dil × her kategori için statik sayfa üret. */
export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    PRICE_RANGES.map((p) => ({ locale, slug: p.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const range = priceRangeBySlug(slug);
  if (!range) return {};
  const t = await getTranslations({ locale });
  const category = t(`categories.${slug}` as any);
  return {
    title: t("priceGuide.metaTitle", { category }),
    description: t("priceGuide.metaDesc", { category }),
  };
}

export default async function PriceGuidePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const range = priceRangeBySlug(slug);
  if (!range) notFound();
  const t = await getTranslations();
  const category = t(`categories.${slug}` as any);

  // SEO: yapısal veri (FAQPage)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: t("priceGuide.faqQ", { category }),
        acceptedAnswer: { "@type": "Answer", text: t("priceGuide.faqA", { category }) },
      },
    ],
  };

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="text-5xl mb-4">{range.icon}</div>
      <h1 className="text-3xl font-black mb-6">{t("priceGuide.heading", { category })}</h1>

      <div className="bg-ink-card border border-white/10 rounded-2xl p-6 mb-8">
        <div className="text-white/60 text-sm mb-1">{t("priceGuide.avgLabel")}</div>
        <div className="text-3xl font-black text-brand-light">
          {formatTRY(range.min)} – {formatTRY(range.max)} ₺
        </div>
      </div>

      <h2 className="text-xl font-bold mb-3">{t("priceGuide.factorsTitle")}</h2>
      <ul className="space-y-2 mb-8 text-white/70">
        {["factor1", "factor2", "factor3"].map((f) => (
          <li key={f} className="flex gap-2">
            <span className="text-brand">•</span>
            {t(`priceGuide.${f}` as any)}
          </li>
        ))}
      </ul>

      <h2 className="text-xl font-bold mb-3">{t("priceGuide.faqTitle")}</h2>
      <div className="bg-ink-card border border-white/10 rounded-xl p-5 mb-8">
        <div className="font-semibold mb-2">{t("priceGuide.faqQ", { category })}</div>
        <p className="text-white/60 text-sm">{t("priceGuide.faqA", { category })}</p>
      </div>

      <div className="bg-gradient-to-br from-brand/20 to-brand-light/10 border border-brand/40 rounded-2xl p-6 text-center">
        <div className="font-bold text-lg mb-3">{t("priceGuide.ctaTitle")}</div>
        <Link
          href="/post"
          className="inline-block font-bold px-6 py-3 rounded-xl bg-gradient-to-br from-brand to-brand-light text-black"
        >
          {t("priceGuide.ctaBtn")}
        </Link>
      </div>

      <p className="text-white/40 text-xs mt-6">{t("priceGuide.disclaimer")}</p>

      <div className="mt-8">
        <Link href="/prices" className="text-brand-light text-sm">
          ← {t("priceGuide.indexTitle")}
        </Link>
      </div>
    </div>
  );
}
