"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { clientApi } from "@/lib/client-api";

const STATUS_STYLE: Record<string, string> = {
  HELD: "bg-teal-400/15 text-teal-300",
  RELEASED: "bg-green-400/15 text-green-300",
  REFUNDED: "bg-slate-200 text-slate-500",
  PENDING: "bg-brand/15 text-brand-light",
  FAILED: "bg-red-400/15 text-red-300",
};

export default function PaymentsPage() {
  const t = useTranslations();
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    clientApi.myPayments().then(setItems).catch(() => setError(true));
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <h1 className="text-2xl font-bold mb-6">💳 Ödemelerim</h1>
      {error && <p className="text-slate-400">{t("errors.unauthorized")}</p>}
      {!error && items.length === 0 && <p className="text-slate-400">—</p>}
      <div className="space-y-3">
        {items.map((p) => (
          <div key={p.id} className="bg-white border border-slate-200 rounded-xl p-4 flex justify-between items-center">
            <div>
              <div className="font-semibold">{p.listing?.title ?? p.listingId}</div>
              <div className="text-slate-400 text-sm">
                {Number(p.amount).toLocaleString()} {p.currency} · komisyon {Number(p.commission).toLocaleString()} {p.currency}
              </div>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_STYLE[p.status] ?? "bg-slate-200"}`}>
              {p.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
