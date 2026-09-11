/** Ustam — paylaşılan sabitler. */

export const APP_NAME = "Ustam";
export const APP_TAGLINE = "İşini ustasına bırak.";

/** Sayfalama varsayılanları (cursor tabanlı). */
export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

/** İlan kuralları. */
export const LISTING = {
  TITLE_MIN: 5,
  TITLE_MAX: 120,
  DESCRIPTION_MIN: 20,
  DESCRIPTION_MAX: 5000,
  MAX_PHOTOS: 10,
  PUBLISHED_TTL_DAYS: 60, // yayında kalma süresi
} as const;

/** Teklif kuralları. */
export const OFFER = {
  MESSAGE_MIN: 10,
  MESSAGE_MAX: 2000,
  MAX_PER_LISTING_PER_PROVIDER: 1,
  // armut.com mantığı: ilan başına en fazla 5 teklif (kalite rekabeti)
  MAX_PER_LISTING: 5,
} as const;

/** Ustam Güvencesi kapsam tutarı (TRY). */
export const GUARANTEE_COVERAGE = 10000;

/** Şifre politikası. */
export const PASSWORD = {
  MIN: 8,
  MAX: 128,
  // en az bir harf + bir rakam
  REGEX: /^(?=.*[A-Za-z])(?=.*\d).{8,128}$/,
} as const;

/** Güvenlik. */
export const SECURITY = {
  OTP_LENGTH: 6,
  OTP_TTL_SECONDS: 300,
  OTP_MAX_ATTEMPTS: 5,
  LOGIN_MAX_ATTEMPTS: 5,
  LOGIN_LOCK_MINUTES: 15,
} as const;

/** Para birimi varsayılanları. */
export const CURRENCY = {
  DEFAULT: "TRY",
  SUPPORTED: ["TRY", "USD", "EUR"] as const,
} as const;

/** Platform komisyonu (ödeme/taahhüt akışı). */
export const COMMISSION = {
  RATE: 0.1, // %10 platform komisyonu
  MIN: 0, // minimum komisyon
} as const;

/** Komisyon ve net ödeme hesaplar (2 ondalık). */
export function calcCommission(amount: number, rate: number = COMMISSION.RATE) {
  const commission = Math.max(COMMISSION.MIN, Math.round(amount * rate * 100) / 100);
  const payout = Math.round((amount - commission) * 100) / 100;
  return { commission, payout };
}

/** Meilisearch index adları. */
export const SEARCH_INDEX = {
  LISTINGS: "listings",
  PROVIDERS: "providers",
  CATEGORIES: "categories",
} as const;
