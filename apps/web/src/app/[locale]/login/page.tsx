"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { API_BASE } from "@/lib/api";

export default function LoginPage() {
  const t = useTranslations();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const path = mode === "login" ? "/auth/login" : "/auth/register";
    const body: Record<string, unknown> = {
      email: form.get("email"),
      password: form.get("password"),
    };
    if (mode === "register") {
      body.displayName = form.get("displayName");
      body.phone = form.get("phone");
      body.role = form.get("role");
      body.acceptTerms = true;
    }
    try {
      const res = await fetch(`${API_BASE}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? t("errors.generic"));
        return;
      }
      localStorage.setItem("accessToken", data.tokens.accessToken);
      localStorage.setItem("refreshToken", data.tokens.refreshToken);
      router.push("/");
    } catch {
      setError(t("errors.network"));
    }
  }

  return (
    <div className="max-w-md mx-auto px-5 py-12">
      <div className="flex gap-2 mb-6">
        {(["login", "register"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 py-2.5 rounded-xl font-bold text-sm ${
              mode === m ? "bg-gradient-to-br from-brand to-brand-light text-black" : "bg-ink-card border border-white/10"
            }`}
          >
            {t(m === "login" ? "common.login" : "common.register")}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {mode === "register" && (
          <>
            <input name="displayName" required placeholder={t("auth.displayName")} className="input" />
            <select name="role" className="input">
              <option value="CUSTOMER">{t("auth.customer")}</option>
              <option value="PROVIDER">{t("auth.provider")}</option>
              <option value="COMPANY">{t("auth.company")}</option>
            </select>
            <input name="phone" required placeholder={t("auth.phone")} className="input" />
          </>
        )}
        <input name="email" type="email" required placeholder={t("auth.email")} className="input" />
        <input name="password" type="password" required placeholder={t("auth.password")} className="input" />
        <button className="w-full font-bold py-3 rounded-xl bg-gradient-to-br from-brand to-brand-light text-black">
          {t(mode === "login" ? "common.login" : "common.register")}
        </button>
        {error && <p className="text-red-400 text-sm">⚠️ {error}</p>}
        {mode === "register" && (
          <p className="text-white/50 text-xs text-center">🔒 {t("auth.otpSent")}</p>
        )}
      </form>

      <style>{`.input{width:100%;background:#1b2335;border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:12px;color:#eaf0ff;outline:none}`}</style>
    </div>
  );
}
