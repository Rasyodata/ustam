"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { clientApi } from "@/lib/client-api";
import { StarRating } from "./StarRating";

type Step = "idle" | "accepted" | "held" | "released" | "rated" | "error";

/**
 * İlan sahibi için teklif → kabul → güvenli ödeme (escrow) → ustaya aktar → puanla akışı.
 * Komisyon %10 gösterilir.
 */
export function PaymentFlow({
  offerId,
  listingId,
  price,
  currency = "TRY",
}: {
  offerId: string;
  listingId: string;
  price: number;
  currency?: string;
}) {
  const t = useTranslations();
  const [step, setStep] = useState<Step>("idle");
  const [busy, setBusy] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const commission = Math.round(price * 0.1);
  const net = price - commission;

  async function run(fn: () => Promise<unknown>, next: Step) {
    setBusy(true);
    try {
      await fn();
      setStep(next);
    } catch {
      setStep("error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-3 border-t border-white/10 pt-3">
      {step === "idle" && (
        <button
          disabled={busy}
          onClick={() => run(() => clientApi.acceptOffer(offerId), "accepted")}
          className="text-sm font-bold px-4 py-2 rounded-lg bg-gradient-to-br from-brand to-brand-light text-black"
        >
          {t("offer.accept")}
        </button>
      )}

      {step === "accepted" && (
        <div className="space-y-2">
          <div className="text-sm space-y-1 bg-black/20 rounded-lg p-3">
            <Row label={t("offer.price")} value={`${price.toLocaleString()} ${currency}`} />
            <Row label="Komisyon (%10)" value={`− ${commission.toLocaleString()} ${currency}`} muted />
            <Row label="Ustaya" value={`${net.toLocaleString()} ${currency}`} bold />
          </div>
          <button
            disabled={busy}
            onClick={() => run(() => clientApi.pay(offerId), "held")}
            className="w-full text-sm font-bold px-4 py-2 rounded-lg bg-gradient-to-br from-brand to-brand-light text-black"
          >
            🔒 Emanete al & Öde
          </button>
        </div>
      )}

      {step === "held" && (
        <div className="space-y-2">
          <div className="text-xs font-bold text-teal-300 bg-teal-400/10 rounded-full px-3 py-1 inline-block">
            💰 ESCROW · Emanette
          </div>
          <button
            disabled={busy}
            onClick={() => run(() => clientApi.release(offerId), "released")}
            className="w-full text-sm font-bold px-4 py-2 rounded-lg bg-gradient-to-br from-brand to-brand-light text-black"
          >
            ✅ İşi tamamla & Ustaya aktar
          </button>
        </div>
      )}

      {step === "released" && (
        <div className="space-y-2">
          <p className="text-green-400 text-sm font-bold">🎉 Ödeme ustaya aktarıldı!</p>
          <div className="bg-black/20 rounded-lg p-3 space-y-2">
            <p className="text-sm font-semibold">⭐ {t("review.leaveReview")}</p>
            <StarRating value={rating} onChange={setRating} />
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t("review.comment")}
              className="w-full bg-ink-card border border-white/10 rounded-lg p-2 text-sm"
              rows={2}
            />
            <button
              disabled={busy || rating === 0}
              onClick={() => run(() => clientApi.createReview(listingId, rating, comment || undefined), "rated")}
              className="w-full text-sm font-bold px-4 py-2 rounded-lg bg-gradient-to-br from-brand to-brand-light text-black disabled:opacity-50"
            >
              {t("review.leaveReview")} →
            </button>
          </div>
        </div>
      )}
      {step === "rated" && <p className="text-green-400 text-sm font-bold">⭐ {t("review.rating")} ✓</p>}
      {step === "error" && <p className="text-red-400 text-sm">⚠️ {t("errors.generic")}</p>}
    </div>
  );
}

function Row({ label, value, muted, bold }: { label: string; value: string; muted?: boolean; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${muted ? "text-red-300" : ""} ${bold ? "font-bold text-brand-light" : ""}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
