import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { LanguageSwitcher } from "./LanguageSwitcher";

// Armut tarzı üst menü sayfaları (makro kategoriler) — 5 dilli etiketler
const GROUPS: { key: string; href: string; label: Record<string, string> }[] = [
  { key: "home", href: "/", label: { tr: "Ana Sayfa", en: "Home", de: "Startseite", fr: "Accueil", es: "Inicio" } },
  { key: "repair", href: "/listings?g=repair", label: { tr: "Tamirat", en: "Repair", de: "Reparatur", fr: "Réparation", es: "Reparación" } },
  { key: "cleaning", href: "/listings?g=cleaning", label: { tr: "Temizlik", en: "Cleaning", de: "Reinigung", fr: "Nettoyage", es: "Limpieza" } },
  { key: "moving", href: "/listings?g=moving", label: { tr: "Nakliyat", en: "Moving", de: "Umzug", fr: "Déménagement", es: "Mudanzas" } },
  { key: "tutoring", href: "/listings?g=tutoring", label: { tr: "Özel Ders", en: "Tutoring", de: "Nachhilfe", fr: "Cours particuliers", es: "Clases" } },
  { key: "other", href: "/listings?g=other", label: { tr: "Diğer", en: "Other", de: "Andere", fr: "Autre", es: "Otros" } },
];

export function Header() {
  const t = useTranslations();
  const locale = useLocale();
  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-white/90 border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 font-black text-xl text-slate-900">
          <span className="w-8 h-8 rounded-lg grid place-items-center bg-gradient-to-br from-brand to-brand-light text-black">
            🛠️
          </span>
          Ustam
        </Link>
        <nav className="ml-auto flex items-center gap-1 text-sm">
          {GROUPS.map((g) => (
            <Link
              key={g.key}
              href={g.href}
              className="hidden md:block text-slate-600 hover:text-brand font-semibold px-3 py-2 rounded-lg hover:bg-orange-50"
            >
              {g.label[locale] ?? g.label.tr}
            </Link>
          ))}
          <Link
            href="/post"
            className="ml-2 font-bold px-4 py-2 rounded-xl bg-gradient-to-br from-brand to-brand-light text-black whitespace-nowrap"
          >
            + {t("listing.create")}
          </Link>
          <Link href="/login" className="text-slate-600 hover:text-slate-900 px-2 whitespace-nowrap">
            {t("common.login")}
          </Link>
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  );
}
