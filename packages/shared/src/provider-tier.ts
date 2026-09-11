/**
 * Ustam — usta seviye/rozet sistemi (TaskRabbit "Elite" / Thumbtack "Top Pro" ilhamı).
 * Seviye; ortalama puan + tamamlanan iş + doğrulama durumundan hesaplanır.
 */

export enum ProviderTier {
  NEW = "NEW", // yeni
  RISING = "RISING", // yükselen
  PRO = "PRO",
  TOP_RATED = "TOP_RATED", // top-rated
  ELITE = "ELITE",
}

export interface TierMeta {
  tier: ProviderTier;
  emoji: string;
  /** i18n anahtarı: badge.<key> */
  key: string;
  color: string;
}

export const TIER_META: Record<ProviderTier, TierMeta> = {
  [ProviderTier.NEW]: { tier: ProviderTier.NEW, emoji: "🌱", key: "new", color: "#97a3be" },
  [ProviderTier.RISING]: { tier: ProviderTier.RISING, emoji: "📈", key: "rising", color: "#5eead4" },
  [ProviderTier.PRO]: { tier: ProviderTier.PRO, emoji: "🔧", key: "pro", color: "#60a5fa" },
  [ProviderTier.TOP_RATED]: { tier: ProviderTier.TOP_RATED, emoji: "⭐", key: "topRated", color: "#ffb347" },
  [ProviderTier.ELITE]: { tier: ProviderTier.ELITE, emoji: "👑", key: "elite", color: "#f0abfc" },
};

export function computeProviderTier(input: {
  avgRating: number;
  reviewCount: number;
  completedJobs: number;
  verified: boolean;
}): ProviderTier {
  const { avgRating, completedJobs, verified } = input;
  if (verified && avgRating >= 4.8 && completedJobs >= 100) return ProviderTier.ELITE;
  if (verified && avgRating >= 4.7 && completedJobs >= 25) return ProviderTier.TOP_RATED;
  if (avgRating >= 4.3 && completedJobs >= 10) return ProviderTier.PRO;
  if (completedJobs >= 3) return ProviderTier.RISING;
  return ProviderTier.NEW;
}

export function tierMeta(input: {
  avgRating: number;
  reviewCount: number;
  completedJobs: number;
  verified: boolean;
}): TierMeta {
  return TIER_META[computeProviderTier(input)];
}
