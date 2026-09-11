import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { api } from "@/lib/api";
import type { Locale, ListingView, CategoryView } from "@ustam/shared";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "jobBoard" });
  return { title: `${t("title")} | Ustam`, description: t("subtitle") };
}

const URGENCIES = ["URGENT", "WITHIN_WEEK", "FLEXIBLE"] as const;

export default async function JobBoardPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string>>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations();

  let items: ListingView[] = [];
  let categories: CategoryView[] = [];
  let offline = false;
  try {
    [items, categories] = await Promise.all([
      api.listings(sp, locale as Locale).then((d) => d.items),
      api.categories(locale as Locale).then((c) => c.filter((x) => !x.parentId)),
    ]);
  } catch {
    offline = true;
  }

  // Armut tarzı makro grup filtresi (?g=repair|cleaning|moving|tutoring|other)
  const GROUP_SLUGS: Record<string, string[]> = {
    repair: ["plumbing", "electrical", "construction", "painting", "furniture", "hvac", "appliance", "ironwork", "roofing"],
    cleaning: ["cleaning"],
    moving: ["moving"],
    tutoring: ["tutoring", "math", "language", "music"],
    other: ["manufacturing", "events", "photo"],
  };
  const g = sp.g;
  if (g && GROUP_SLUGS[g]) {
    const slugs = GROUP_SLUGS[g];
    items = items.filter((l) => slugs.includes(l.category?.slug));
    categories = categories.filter((c) => slugs.includes(c.slug));
  }

  const buildHref = (patch: Record<string, string | undefined>) => {
    const merged = { ...sp, ...patch };
    const qs = new URLSearchParams(
      Object.entries(merged).filter(([, v]) => v) as [string, string][],
    ).toString();
    return `/listings${qs ? `?${qs}` : ""}`;
  };

  const chip = (active: boolean) =>
    `px-3 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap ${
      active ? "bg-brand text-black" : "bg-white border border-slate-200 hover:border-brand"
    }`;

  return (
    <div className="max-w-5xl mx-auto px-5 py-10">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
        <h1 className="text-3xl font-black">🔧 {t("jobBoard.title")}</h1>
        <Link
          href="/post"
          className="font-bold px-4 py-2 rounded-xl bg-gradient-to-br from-brand to-brand-light text-black"
        >
          + {t("jobBoard.postCta")}
        </Link>
      </div>
      <p className="text-slate-500 mb-6">{t("jobBoard.subtitle")}</p>

      {/* Kategori filtresi */}
      <div className="flex gap-2 flex-wrap mb-3 overflow-x-auto">
        <Link href={buildHref({ categoryId: undefined })} className={chip(!sp.categoryId)}>
          {t("jobBoard.allCategories")}
        </Link>
        {categories.map((c) => (
          <Link key={c.id} href={buildHref({ categoryId: c.id })} className={chip(sp.categoryId === c.id)}>
            {c.icon} {c.name}
          </Link>
        ))}
      </div>

      {/* Aciliyet filtresi */}
      <div className="flex gap-2 flex-wrap mb-8">
        <Link href={buildHref({ urgency: undefined })} className={chip(!sp.urgency)}>
          {t("common.all")}
        </Link>
        {URGENCIES.map((u) => (
          <Link key={u} href={buildHref({ urgency: u })} className={chip(sp.urgency === u)}>
            {t(`listing.urgency${u === "URGENT" ? "Urgent" : u === "WITHIN_WEEK" ? "WithinWeek" : "Flexible"}` as any)}
          </Link>
        ))}
      </div>

      {offline && (
        <div className="bg-brand/10 border border-dashed border-brand rounded-xl p-4 text-brand-light text-sm mb-6">
          ⚙️ Backend çalışmıyor. Başlat: <code>docker compose up -d</code> → <code>pnpm dev</code>
        </div>
      )}

      {!offline && items.length === 0 && (
        <div className="text-center py-16">
          <p className="text-slate-400 mb-4">{t("jobBoard.empty")}</p>
          <Link href="/post" className="font-bold px-5 py-3 rounded-xl bg-gradient-to-br from-brand to-brand-light text-black">
            + {t("jobBoard.postCta")}
          </Link>
        </div>
      )}

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {items.map((l) => (
          <Link
            key={l.id}
            href={`/listings/${l.id}`}
            className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-brand hover:-translate-y-1 transition flex flex-col"
          >
            <div className="h-32 bg-gradient-to-br from-orange-50 to-slate-100 grid place-items-center text-4xl">
              {l.category?.icon ?? "🔧"}
            </div>
            <div className="p-4 flex flex-col gap-2 flex-1">
              <h3 className="font-semibold">{l.title}</h3>
              <div className="text-slate-400 text-sm flex gap-3 flex-wrap">
                <span>📍 {l.location?.cityName}</span>
                {l.category?.name && <span>{l.category.name}</span>}
              </div>
              <div className="mt-auto pt-2 flex justify-between items-center">
                <span className="text-xs font-bold text-brand-light bg-brand/15 px-2.5 py-1 rounded-full">
                  {l.offerCount} {t("listing.offers")}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
