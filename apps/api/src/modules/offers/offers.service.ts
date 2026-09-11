import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { PushService } from "../push/push.module";
import { CreateOfferInput, OFFER } from "@ustam/shared";

@Injectable()
export class OffersService {
  constructor(
    private prisma: PrismaService,
    private push: PushService,
  ) {}

  /** Usta bir ilana teklif verir. İlan başına tek teklif (unique). */
  async create(providerId: string, input: CreateOfferInput) {
    const listing = await this.prisma.listing.findUnique({ where: { id: input.listingId } });
    if (!listing) throw new NotFoundException({ code: "NOT_FOUND", message: "errors.notFound" });
    if (listing.status !== "PUBLISHED") {
      throw new BadRequestException({ code: "LISTING_CLOSED", message: "errors.generic" });
    }
    if (listing.ownerId === providerId) {
      throw new ForbiddenException({ code: "OWN_LISTING", message: "errors.forbidden" });
    }
    // armut.com mantığı: ilan en fazla 5 teklif alır
    if (listing.offerCount >= OFFER.MAX_PER_LISTING) {
      throw new BadRequestException({ code: "OFFER_LIMIT_REACHED", message: "errors.offerLimit" });
    }

    const existing = await this.prisma.offer.findUnique({
      where: { listingId_providerId: { listingId: input.listingId, providerId } },
    });
    if (existing) {
      throw new BadRequestException({ code: "OFFER_EXISTS", message: "errors.generic" });
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const offer = await tx.offer.create({
        data: {
          listingId: input.listingId,
          providerId,
          price: new Prisma.Decimal(input.priceAmount),
          currency: input.currency,
          message: input.message,
          estimatedDays: input.estimatedDays,
        },
      });
      await tx.listing.update({
        where: { id: input.listingId },
        data: { offerCount: { increment: 1 } },
      });
      // İlan sahibine bildirim
      await tx.notification.create({
        data: {
          userId: listing.ownerId,
          type: "NEW_OFFER",
          titleKey: "notifications.newOffer",
          data: { listingId: listing.id, offerId: offer.id },
        },
      });
      return offer;
    });
    await this.push.sendToUser(listing.ownerId, "Ustam", "İlanınıza yeni teklif geldi", {
      listingId: listing.id,
      offerId: result.id,
    });
    return result;
  }

  /** İlan sahibi teklifi kabul eder → ilan IN_PROGRESS, diğerleri reddedilir. */
  async accept(offerId: string, ownerId: string) {
    const offer = await this.prisma.offer.findUnique({
      where: { id: offerId },
      include: { listing: true },
    });
    if (!offer) throw new NotFoundException({ code: "NOT_FOUND", message: "errors.notFound" });
    if (offer.listing.ownerId !== ownerId) {
      throw new ForbiddenException({ code: "FORBIDDEN", message: "errors.forbidden" });
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const accepted = await tx.offer.update({
        where: { id: offerId },
        data: { status: "ACCEPTED" },
      });
      await tx.offer.updateMany({
        where: { listingId: offer.listingId, id: { not: offerId }, status: "PENDING" },
        data: { status: "REJECTED" },
      });
      await tx.listing.update({
        where: { id: offer.listingId },
        data: { status: "IN_PROGRESS" },
      });
      await tx.notification.create({
        data: {
          userId: offer.providerId,
          type: "OFFER_ACCEPTED",
          titleKey: "notifications.offerAccepted",
          data: { listingId: offer.listingId, offerId },
        },
      });
      return accepted;
    });
    await this.push.sendToUser(offer.providerId, "Ustam", "Teklifiniz kabul edildi!", {
      listingId: offer.listingId,
      offerId,
    });
    return result;
  }

  async reject(offerId: string, ownerId: string) {
    const offer = await this.prisma.offer.findUnique({
      where: { id: offerId },
      include: { listing: true },
    });
    if (!offer) throw new NotFoundException({ code: "NOT_FOUND", message: "errors.notFound" });
    if (offer.listing.ownerId !== ownerId) {
      throw new ForbiddenException({ code: "FORBIDDEN", message: "errors.forbidden" });
    }
    return this.prisma.offer.update({ where: { id: offerId }, data: { status: "REJECTED" } });
  }

  /** Usta kendi teklifini geri çeker. */
  async withdraw(offerId: string, providerId: string) {
    const offer = await this.prisma.offer.findUnique({ where: { id: offerId } });
    if (!offer) throw new NotFoundException({ code: "NOT_FOUND", message: "errors.notFound" });
    if (offer.providerId !== providerId) {
      throw new ForbiddenException({ code: "FORBIDDEN", message: "errors.forbidden" });
    }
    return this.prisma.offer.update({ where: { id: offerId }, data: { status: "WITHDRAWN" } });
  }

  async listMine(providerId: string) {
    return this.prisma.offer.findMany({
      where: { providerId },
      orderBy: { createdAt: "desc" },
      include: { listing: { include: { category: { include: { translations: true } }, city: true } } },
    });
  }
}
