"use client";

/** İstemci tarafı (token'lı) API çağrıları — tarayıcıda çalışır. */
import { API_BASE } from "./api";

function authHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function send<T>(path: string, method: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: authHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw await res.json().catch(() => new Error("error"));
  return res.json();
}

export const clientApi = {
  acceptOffer: (offerId: string) => send(`/offers/${offerId}/accept`, "PATCH"),
  // Ödeme / taahhüt (escrow)
  pay: (offerId: string) => send(`/payments/offer/${offerId}/pay`, "POST"),
  release: (offerId: string) => send(`/payments/offer/${offerId}/release`, "POST"),
  refund: (offerId: string) => send(`/payments/offer/${offerId}/refund`, "POST"),
  myPayments: () => send<any[]>(`/payments/mine`, "GET"),
  // Değerlendirme / puanlama
  createReview: (listingId: string, rating: number, comment?: string) =>
    send(`/reviews`, "POST", { listingId, rating, comment }),
  // Usta dizini + teklif daveti
  providers: (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return send<any[]>(`/providers${qs ? `?${qs}` : ""}`, "GET");
  },
  requestQuote: (providerUserId: string, body: { listingId?: string; message?: string } = {}) =>
    send(`/providers/${providerUserId}/request-quote`, "POST", body),
  // Analiz (public)
  stats: (locale: string, cityId?: string) =>
    send<any>(`/stats?lang=${locale}${cityId ? `&cityId=${cityId}` : ""}`, "GET"),
  cities: () => send<{ id: string; name: string }[]>(`/locations/cities`, "GET"),
};
