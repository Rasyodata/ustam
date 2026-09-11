import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Header() {
  const t = useTranslations();
  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-ink/80 border-b border-white/10">
      <div className="max-w-5xl mx-auto px-5 h-16 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 font-black text-xl">
          <span className="w-8 h-8 rounded-lg grid place-items-center bg-gradient-to-br from-brand to-brand-light text-black">
            🛠️
          </span>
          Ustam
        </Link>
        <nav className="ml-auto flex items-center gap-4 text-sm">
          <Link href="/" className="text-white/60 hover:text-white hidden sm:block">
            {t("nav.home")}
          </Link>
          <Link href="/listings" className="text-white/60 hover:text-white hidden sm:block">
            {t("jobBoard.title")}
          </Link>
          <Link href="/providers" className="text-white/60 hover:text-white hidden sm:block">
            {t("pros.title")}
          </Link>
          <Link href="/prices" className="text-white/60 hover:text-white hidden sm:block">
            {t("priceGuide.indexTitle")}
          </Link>
          <Link href="/guarantee" className="text-teal-300 hover:text-teal-200 hidden md:block font-semibold">
            🛡️ {t("guarantee.learnMore")}
          </Link>
          <Link href="/payments" className="text-white/60 hover:text-white hidden sm:block">
            💳
          </Link>
          <Link
            href="/post"
            className="font-bold px-4 py-2 rounded-xl bg-gradient-to-br from-brand to-brand-light text-black"
          >
            + {t("listing.create")}
          </Link>
          <Link href="/login" className="text-white/60 hover:text-white">
            {t("common.login")}
          </Link>
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  );
}
