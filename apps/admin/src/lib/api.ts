"use client";

const BASE = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000") + "/api/v1";

function token() {
  return typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${token() ?? ""}` },
  });
  if (!res.ok) throw await res.json().catch(() => new Error("error"));
  return res.json();
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token() ?? ""}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw await res.json().catch(() => new Error("error"));
  return res.json();
}

export async function adminLogin(email: string, password: string) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error("login_failed");
  const data = await res.json();
  localStorage.setItem("admin_token", data.tokens.accessToken);
  return data.user;
}

export { BASE };
