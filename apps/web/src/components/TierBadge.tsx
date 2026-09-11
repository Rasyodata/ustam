"use client";

import { useTranslations } from "next-intl";
import { tierMeta } from "@ustam/shared";

/** Usta seviye rozeti (Yeni / Yükselen / Pro / En İyi / Elit). */
export function TierBadge({
  avgRating,
  reviewCount,
  completedJobs,
  verified,
  size = "sm",
}: {
  avgRating: number;
  reviewCount: number;
  completedJobs: number;
  verified: boolean;
  size?: "sm" | "md";
}) {
  const t = useTranslations();
  const meta = tierMeta({ avgRating, reviewCount, completedJobs, verified });
  const pad = size === "md" ? "px-3 py-1 text-sm" : "px-2 py-0.5 text-xs";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-bold ${pad}`}
      style={{ color: meta.color, backgroundColor: `${meta.color}22` }}
      title={t(`badge.${meta.key}` as any)}
    >
      {meta.emoji} {t(`badge.${meta.key}` as any)}
    </span>
  );
}
