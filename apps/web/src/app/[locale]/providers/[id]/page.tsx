import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { API_BASE } from "@/lib/api";
import { TierBadge } from "@/components/TierBadge";
import { RequestQuoteButton } from "@/components/RequestQuoteButton";

async function getProfile(id: string) {
  const res = await fetch(`${API_BASE}/users/${id}`, { next: { revalidate: 30 } });
  if (!res.ok) return null;
  return res.json();
}
async function getReviews(id: string) {
  const res = await fetch(`${API_BASE}/reviews/user/${id}`, { next: { revalidate: 30 } });
  if (!res.ok) return [];
  return res.json();
}

export default async function ProviderProfilePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const profile = await getProfile(id);
  if (!profile) notFound();
  const reviews = await getReviews(id);
  const pp = profile.providerProfile;

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand to-brand-light grid place-items-center text-3xl text-black font-black">
          {profile.displayName?.[0] ?? "?"}
        </div>
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2 flex-wrap">
            {pp?.businessName ?? profile.displayName}
            {pp?.verified && <span className="text-teal-300 text-sm">✓ Doğrulanmış</span>}
            {pp && (
              <TierBadge
                avgRating={Number(pp.avgRating)}
                reviewCount={pp.reviewCount}
                completedJobs={pp.completedJobs}
                verified={pp.verified}
                size="md"
              />
            )}
          </h1>
          {pp && (
            <div className="text-slate-500 text-sm mt-1">
              <span className="text-amber-400 font-bold">★ {Number(pp.avgRating).toFixed(1)}</span> ·{" "}
              {pp.reviewCount} {t("review.reviews")} · {pp.completedJobs} {t("review.completedJobs")}
            </div>
          )}
        </div>
      </div>

      {pp && (
        <div className="mb-8">
          <RequestQuoteButton providerUserId={id} />
        </div>
      )}

      {pp?.bio && <p className="text-slate-600 mb-8">{pp.bio}</p>}

      <h2 className="text-xl font-bold mb-4">{t("review.reviews")}</h2>
      <div className="space-y-3">
        {reviews.map((r: any) => (
          <div key={r.id} className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold">{r.author?.displayName ?? "—"}</span>
              <span className="text-amber-400">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
            </div>
            {r.comment && <p className="text-slate-500 text-sm">{r.comment}</p>}
          </div>
        ))}
        {reviews.length === 0 && <p className="text-slate-400">—</p>}
      </div>
    </div>
  );
}
