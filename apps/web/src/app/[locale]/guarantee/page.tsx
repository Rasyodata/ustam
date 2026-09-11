import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { GUARANTEE_COVERAGE } from "@ustam/shared";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "guarantee" });
  return { title: `${t("title")} | Ustam`, description: t("subtitle") };
}

const POINTS = [
  { icon: "🔒", k: "p1" },
  { icon: "💸", k: "p2" },
  { icon: "✅", k: "p3" },
  { icon: "🤝", k: "p4" },
];

export default async function GuaranteePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <div className="max-w-3xl mx-auto px-5 py-12">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-teal-400/15 text-teal-300 font-bold px-4 py-1.5 rounded-full mb-4">
          🛡️ {t("guarantee.badge")}
        </div>
        <h1 className="text-3xl sm:text-4xl font-black mb-3">{t("guarantee.title")}</h1>
        <div className="text-3xl font-black text-teal-300 mb-3">
          {GUARANTEE_COVERAGE.toLocaleString(locale === "tr" ? "tr-TR" : locale)} ₺
          <span className="text-sm text-slate-400 font-semibold"> {locale === "tr" ? "'ye kadar koruma" : "coverage"}</span>
        </div>
        <p className="text-slate-500 max-w-xl mx-auto">{t("guarantee.subtitle")}</p>
      </div>

      <h2 className="text-xl font-bold mb-4">{t("guarantee.howTitle")}</h2>
      <div className="grid sm:grid-cols-2 gap-4 mb-10">
        {POINTS.map((p) => (
          <div key={p.k} className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="text-3xl mb-3">{p.icon}</div>
            <h3 className="font-bold mb-1.5">{t(`guarantee.${p.k}title` as any)}</h3>
            <p className="text-slate-500 text-sm">{t(`guarantee.${p.k}desc` as any)}</p>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-teal-400/15 to-emerald-400/10 border border-teal-400/30 rounded-2xl p-6 text-center">
        <div className="text-2xl mb-3">🛡️</div>
        <Link
          href="/post"
          className="inline-block font-bold px-6 py-3 rounded-xl bg-gradient-to-br from-brand to-brand-light text-black"
        >
          {t("guarantee.cta")}
        </Link>
      </div>
    </div>
  );
}
