import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE =
  (Constants.expoConfig?.extra?.apiUrl ?? "http://localhost:4000") + "/api/v1";

async function authHeader() {
  const token = await AsyncStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  async listings(params: Record<string, string> = {}) {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE}/listings${qs ? `?${qs}` : ""}`);
    if (!res.ok) throw new Error("api");
    return res.json();
  },
  async listing(id: string) {
    const res = await fetch(`${BASE}/listings/${id}`);
    if (!res.ok) throw new Error("api");
    return res.json();
  },
  async login(email: string, password: string) {
    const res = await fetch(`${BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error("login");
    const data = await res.json();
    await AsyncStorage.setItem("accessToken", data.tokens.accessToken);
    await AsyncStorage.setItem("refreshToken", data.tokens.refreshToken);
    return data.user;
  },
  async createListing(body: Record<string, unknown>) {
    const res = await fetch(`${BASE}/listings`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(await authHeader()) },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("create");
    return res.json();
  },
  async authed(path: string, method: string, body?: unknown) {
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers: { "Content-Type": "application/json", ...(await authHeader()) },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error("api");
    return res.json();
  },
  myPayments() {
    return this.authed("/payments/mine", "GET");
  },
  payOffer(offerId: string) {
    return this.authed(`/payments/offer/${offerId}/pay`, "POST");
  },
  releaseOffer(offerId: string) {
    return this.authed(`/payments/offer/${offerId}/release`, "POST");
  },
  createReview(listingId: string, rating: number, comment?: string) {
    return this.authed("/reviews", "POST", { listingId, rating, comment });
  },
};

export { BASE };
