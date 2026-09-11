import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { PushService } from "../push/push.module";
import { PaymentProvider } from "./payment-provider";
import { calcCommission } from "@ustam/shared";

/**
 * Taahhüt/escrow akışı:
 *  1) Müşteri kabul ettiği teklif için ödemeyi başlatır → tutar EMANETTE (HELD) tutulur.
 *  2) İş tamamlanınca müşteri onaylar → komisyon kesilir, kalan ustaya aktarılır (RELEASED).
 *  3) Anlaşmazlık/iptal → müşteriye iade (REFUNDED).
 */
@Injectable()
export class PaymentsService {
  private readonly commissionRate: number;

  constructor(
    private prisma: PrismaService,
    private provider: PaymentProvider,
    private push: PushService,
    config: ConfigService,
  ) {
    this.commissionRate = config.get<number>("payment.commissionRate") ?? 0.1;
  }

  /** Kabul edilen teklif için ödemeyi başlat → emanete al. */
  async pay(offerId: string, payerId: string) {
    const offer = await this.prisma.offer.findUnique({
      where: { id: offerId },
      include: { listing: true },
    });
    if (!offer) throw new NotFoundException({ code: "NOT_FOUND", message: "errors.notFound" });
    if (offer.listing.ownerId !== payerId) {
      throw new ForbiddenException({ code: "FORBIDDEN", message: "errors.forbidden" });
    }
    if (offer.status !== "ACCEPTED") {
      throw new BadRequestException({ code: "OFFER_NOT_ACCEPTED", message: "errors.generic" });
    }
    const existing = await this.prisma.payment.findUnique({ where: { offerId } });
    if (existing) {
      throw new BadRequestException({ code: "PAYMENT_EXISTS", message: "errors.generic" });
    }

    const amount = Number(offer.price);
    const { commission, payout } = calcCommission(amount, this.commissionRate);

    const charge = await this.provider.charge(amount, offer.currency, { offerId });
    if (!charge.success) {
      await this.prisma.payment.create({
        data: {
          listingId: offer.listingId,
          offerId,
          payerId,
          payeeId: offer.providerId,
          amount: new Prisma.Decimal(amount),
          commission: new Prisma.Decimal(commission),
          payout: new Prisma.Decimal(payout),
          currency: offer.currency,
          status: "FAILED",
          provider: charge.provider,
        },
      });
      throw new BadRequestException({ code: "PAYMENT_FAILED", message: "errors.generic" });
    }

    const payment = await this.prisma.payment.create({
      data: {
        listingId: offer.listingId,
        offerId,
        payerId,
        payeeId: offer.providerId,
        amount: new Prisma.Decimal(amount),
        commission: new Prisma.Decimal(commission),
        payout: new Prisma.Decimal(payout),
        currency: offer.currency,
        status: "HELD",
        provider: charge.provider,
        providerRef: charge.providerRef,
        heldAt: new Date(),
      },
    });
    await this.push.sendToUser(offer.providerId, "Ustam", "Ödeme emanete alındı, işe başlayabilirsiniz", {
      offerId,
    });
    return payment;
  }

  /** İş tamamlandı → müşteri onayı: emanetten ustaya aktar (komisyon kesilir). */
  async release(offerId: string, payerId: string) {
    const payment = await this.prisma.payment.findUnique({ where: { offerId } });
    if (!payment) throw new NotFoundException({ code: "NOT_FOUND", message: "errors.notFound" });
    if (payment.payerId !== payerId) {
      throw new ForbiddenException({ code: "FORBIDDEN", message: "errors.forbidden" });
    }
    if (payment.status !== "HELD") {
      throw new BadRequestException({ code: "NOT_HELD", message: "errors.generic" });
    }

    await this.provider.payout(Number(payment.payout), payment.currency, payment.payeeId);
    const updated = await this.prisma.$transaction(async (tx) => {
      const p = await tx.payment.update({
        where: { offerId },
        data: { status: "RELEASED", releasedAt: new Date() },
      });
      await tx.listing.update({
        where: { id: payment.listingId },
        data: { status: "COMPLETED", completedAt: new Date() },
      });
      return p;
    });
    await this.push.sendToUser(payment.payeeId, "Ustam", "Ödemeniz hesabınıza aktarıldı 🎉", {
      offerId,
    });
    return updated;
  }

  /** Anlaşmazlık/iptal → müşteriye iade. */
  async refund(offerId: string, requesterId: string) {
    const payment = await this.prisma.payment.findUnique({ where: { offerId } });
    if (!payment) throw new NotFoundException({ code: "NOT_FOUND", message: "errors.notFound" });
    if (payment.payerId !== requesterId) {
      throw new ForbiddenException({ code: "FORBIDDEN", message: "errors.forbidden" });
    }
    if (payment.status !== "HELD") {
      throw new BadRequestException({ code: "NOT_HELD", message: "errors.generic" });
    }
    await this.provider.refund(payment.providerRef ?? "");
    return this.prisma.payment.update({
      where: { offerId },
      data: { status: "REFUNDED", refundedAt: new Date() },
    });
  }

  list(userId: string) {
    return this.prisma.payment.findMany({
      where: { OR: [{ payerId: userId }, { payeeId: userId }] },
      orderBy: { createdAt: "desc" },
      include: { listing: { select: { id: true, title: true } } },
    });
  }
}
