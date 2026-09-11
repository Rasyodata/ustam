"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { API_BASE } from "@/lib/api";

export default function PostPage() {
  const t = useTranslations();
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch(`${API_BASE}/listings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken") ?? ""}`,
        },
        body: JSON.stringify({
          title: form.get("title"),
          description: form.get("description"),
          categoryId: form.get("categoryId"),
          cityId: form.get("cityId"),
          urgency: form.get("urgency"),
        }),
      });
      setStatus(res.ok ? "ok" : "err");
    } catch {
      setStatus("err");
    }
  }

  return (
    <div className="max-w-xl mx-auto px-5 py-10">
      <h1 className="text-2xl font-bold mb-6">{t("listing.create")}</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label={t("listing.title")}>
          <input name="title" required className="input" placeholder={t("common.searchPlaceholder")} />
        </Field>
        <Field label={t("listing.description")}>
          <textarea name="description" required rows={5} className="input" />
        </Field>
        <Field label={t("listing.urgency")}>
          <select name="urgency" className="input">
            <option value="FLEXIBLE">{t("listing.urgencyFlexible")}</option>
            <option value="WITHIN_WEEK">{t("listing.urgencyWithinWeek")}</option>
            <option value="URGENT">{t("listing.urgencyUrgent")}</option>
            <option value="EMERGENCY">{t("listing.urgencyEmergency")}</option>
          </select>
        </Field>
        <button
          disabled={status === "sending"}
          className="w-full font-bold py-3 rounded-xl bg-gradient-to-br from-brand to-brand-light text-black"
        >
          {t("listing.create")} →
        </button>
        {status === "ok" && <p className="text-green-400 text-sm">✅ {t("notifications.listingMatch")}</p>}
        {status === "err" && <p className="text-red-400 text-sm">⚠️ {t("errors.generic")}</p>}
      </form>

      <style>{`.input{width:100%;background:#1b2335;border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:12px;color:#eaf0ff;outline:none}`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm text-white/60 mb-1.5 font-semibold">{label}</span>
      {children}
    </label>
  );
}
