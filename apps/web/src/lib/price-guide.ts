/**
 * Kategori bazlı ortalama fiyat aralıkları (TRY).
 * SEO fiyat rehberi sayfalarında ve maliyet tahmininde kullanılır.
 * Not: Tahmini değerlerdir; gerçek fiyat işin kapsamına göre değişir.
 */
export interface PriceRange {
  slug: string;
  icon: string;
  min: number;
  max: number;
}

export const PRICE_RANGES: PriceRange[] = [
  { slug: "plumbing", icon: "🚰", min: 800, max: 3500 },
  { slug: "electrical", icon: "💡", min: 600, max: 4000 },
  { slug: "construction", icon: "🏗️", min: 15000, max: 250000 },
  { slug: "painting", icon: "🎨", min: 3000, max: 25000 },
  { slug: "ironwork", icon: "🔩", min: 2000, max: 60000 },
  { slug: "roofing", icon: "🏠", min: 20000, max: 150000 },
  { slug: "appliance", icon: "🧰", min: 500, max: 5000 },
  { slug: "manufacturing", icon: "🏭", min: 5000, max: 200000 },
];

export function priceRangeBySlug(slug: string): PriceRange | undefined {
  return PRICE_RANGES.find((p) => p.slug === slug);
}

export function formatTRY(n: number): string {
  return n.toLocaleString("tr-TR");
}
