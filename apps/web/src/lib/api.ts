/** Ustam web — backend API istemcisi (fetch tabanlı). */
import type { Locale, Paginated, ListingView, CategoryView } from "@ustam/shared";

const BASE = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000") + "/api/v1";

async function req<T>(path: string, opts: RequestInit & { locale?: Locale } = {}): Promise<T> {
  const { locale, headers, ...rest } = opts;
  const res = await fetch(`${BASE}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(locale ? { "x-lang": locale } : {}),
      ...headers,
    },
    // ilanlar sık değişir → kısa cache
    next: { revalidate: 30 },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw Object.assign(new Error(body.message ?? "API error"), { body, status: res.status });
  }
  return res.json() as Promise<T>;
}

export const api = {
  categories: (locale: Locale) => req<CategoryView[]>(`/categories?lang=${locale}`, { locale }),
  listings: (params: Record<string, string> = {}, locale?: Locale) => {
    const qs = new URLSearchParams(params).toString();
    return req<Paginated<ListingView>>(`/listings${qs ? `?${qs}` : ""}`, { locale });
  },
  listing: (id: string, locale?: Locale) => req<ListingView>(`/listings/${id}`, { locale }),
  cities: () => req<{ id: string; name: string }[]>(`/locations/cities`),
  stats: (locale: Locale) => req<StatsOverview>(`/stats?lang=${locale}`, { locale }),
};

export interface StatsOverview {
  totals: {
    listings: number;
    activeListings: number;
    providers: number;
    offers: number;
    cities: number;
    categories: number;
  };
  categories: {
    id: string;
    slug: string;
    icon?: string;
    parentId: string | null;
    name: string;
    listingCount: number;
    providerCount: number;
  }[];
}

export { BASE as API_BASE };
