"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { clientApi } from "@/lib/client-api";

/** Belirli bir ustadan teklif iste (müşteri). */
export function RequestQuoteButton({ providerUserId }: { providerUserId: string }) {
  const t = useTranslations();
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onClick() {
    setBusy(true);
    try {
      await clientApi.requestQuote(providerUserId, {});
      setDone(true);
    } catch {
      alert(t("pros.loginToRequest"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      disabled={busy || done}
      onClick={onClick}
      className="font-bold px-5 py-2.5 rounded-xl bg-gradient-to-br from-brand to-brand-light text-black disabled:opacity-60"
    >
      {done ? t("pros.requested") : `📨 ${t("pros.requestQuote")}`}
    </button>
  );
}
