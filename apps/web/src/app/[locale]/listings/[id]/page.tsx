import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { PaymentFlow } from "@/components/PaymentFlow";
import { TierBadge } from "@/components/TierBadge";
import type { Locale, ListingView, OfferView } from "@ustam/shared";

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  let listing: (ListingView & { offers?: OfferView[] }) | null = null;
  try {
    listing = (await api.listing(id, locale as Locale)) as any;
  } catch {
    notFound();
  }
  if (!listing) notFound();

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <div className="flex gap-2 flex-wrap mb-4">
        <Badge>📍 {listing.location?.cityName}</Badge>
        <Badge>💰 {listing.budgetMin ?? "—"} {listing.currency}</Badge>
        <Badge>{listing.offerCount} {t("listing.offers")}</Badge>
      </div>
      <h1 className="text-3xl font-black mb-3">{listing.title}</h1>
      <p className="text-slate-600 whitespace-pre-line mb-8">{listing.description}</p>

      <h2 className="text-xl font-bold mb-4">
        {listing.offerCount} {t("listing.offers")}
      </h2>
      <div className="space-y-3">
        {(listing.offers ?? []).map((o: any) => (
          <div key={o.id} className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex justify-between items-center mb-1.5">
              <div className="flex items-center gap-2">
                <Link href={`/providers/${o.provider?.id}`} className="font-bold hover:text-brand-light">
                  {o.provider?.displayName}
                </Link>
                {o.provider?.providerProfile && (
                  <>
                    <span className="text-xs text-amber-400">
                      ★ {Number(o.provider.providerProfile.avgRating).toFixed(1)}
                      <span className="text-slate-400"> ({o.provider.providerProfile.reviewCount})</span>
                    </span>
                    <TierBadge
                      avgRating={Number(o.provider.providerProfile.avgRating)}
                      reviewCount={o.provider.providerProfile.reviewCount}
                      completedJobs={o.provider.providerProfile.completedJobs}
                      verified={o.provider.providerProfile.verified}
                    />
                  </>
                )}
              </div>
              <span className="font-black text-brand-light text-lg">
                {Number(o.price).toLocaleString()} {o.currency}
              </span>
            </div>
            <p className="text-slate-500 text-sm">{o.message}</p>
            <PaymentFlow offerId={o.id} listingId={listing.id} price={Number(o.price)} currency={o.currency} />
          </div>
        ))}
        {(!listing.offers || listing.offers.length === 0) && (
          <p className="text-slate-400">{t("listing.noOffers")}</p>
        )}
      </div>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-bold bg-slate-200 px-2.5 py-1 rounded-full">{children}</span>
  );
}
