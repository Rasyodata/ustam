import { getTranslations, setRequestLocale } from "next-intl/server";
import { api } from "@/lib/api";
import { ProvidersDirectory } from "@/components/ProvidersDirectory";
import { PRICE_RANGES } from "@/lib/price-guide";
import type { Locale } from "@ustam/shared";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pros" });
  return { title: `${t("title")} | Ustam`, description: t("subtitle") };
}

export default async function ProvidersIndex({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  // Kategori filtresi için gerçek kategorileri çek (backend kapalıysa slug fallback)
  let categories: { id: string; slug: string; name: string }[] = [];
  try {
    const cats = await api.categories(locale as Locale);
    categories = cats
      .filter((c) => !c.parentId)
      .map((c) => ({ id: c.id, slug: c.slug, name: c.name }));
  } catch {
    categories = PRICE_RANGES.map((p) => ({ id: p.slug, slug: p.slug, name: t(`categories.${p.slug}` as any) }));
  }

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <h1 className="text-3xl font-black mb-2">🏆 {t("pros.title")}</h1>
      <p className="text-slate-500 mb-8">{t("pros.subtitle")}</p>
      <ProvidersDirectory categories={categories} />
    </div>
  );
}
