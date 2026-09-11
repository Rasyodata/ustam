import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { SearchService } from "../search/search.service";
import { PushService } from "../push/push.module";
import {
  CreateListingInput,
  SearchListingsInput,
  LISTING,
  Paginated,
} from "@ustam/shared";

@Injectable()
export class ListingsService {
  constructor(
    private prisma: PrismaService,
    private search: SearchService,
    private push: PushService,
  ) {}

  /**
   * Akıllı eşleştirme (armut.com çekirdeği): yeni ilana uygun ustaları bul
   * (kategori eşleşir + hizmet bölgesi ilan şehrini kapsar ya da bölge kısıtı yok),
   * her birine LISTING_MATCH bildirimi + push gönder.
   */
  private async notifyMatchingProviders(listing: {
    id: string;
    categoryId: string;
    cityId: string;
    title: string;
    ownerId: string;
  }) {
    const profiles = await this.prisma.providerProfile.findMany({
      where: {
        categories: { some: { categoryId: listing.categoryId } },
        user: { status: "ACTIVE", id: { not: listing.ownerId } },
        OR: [
          { serviceAreas: { some: { cityId: listing.cityId } } },
          { serviceAreas: { none: {} } }, // bölge belirtmemiş = her yere hizmet
        ],
      },
      select: { userId: true },
      take: 200,
    });
    if (profiles.length === 0) return;

    await this.prisma.notification.createMany({
      data: profiles.map((p) => ({
        userId: p.userId,
        type: "LISTING_MATCH" as const,
        titleKey: "notifications.listingMatch",
        data: { listingId: listing.id },
      })),
    });
    await Promise.all(
      profiles.map((p) =>
        this.push.sendToUser(p.userId, "Ustam", "Size uygun yeni bir ilan var", {
          listingId: listing.id,
        }),
      ),
    );
  }

  /** İlanı Meilisearch'e indeksle (hata-toleranslı). */
  private async indexListing(listing: any) {
    await this.search.indexListing({
      id: listing.id,
      title: listing.title,
      description: listing.description,
      categoryId: listing.categoryId,
      categorySlug: listing.category?.slug ?? "",
      cityId: listing.cityId,
      cityName: listing.city?.name ?? "",
      urgency: listing.urgency,
      budgetMin: listing.budgetMin != null ? Number(listing.budgetMin) : null,
      budgetMax: listing.budgetMax != null ? Number(listing.budgetMax) : null,
      status: listing.status,
      createdAt: new Date(listing.createdAt).getTime(),
    });
  }

  /** Yeni ilan — moderasyon için PENDING_REVIEW (demo/otomatik onay seçilebilir). */
  async create(ownerId: string, input: CreateListingInput) {
    const expiresAt = new Date(Date.now() + LISTING.PUBLISHED_TTL_DAYS * 864e5);
    const listing = await this.prisma.listing.create({
      data: {
        ownerId,
        categoryId: input.categoryId,
        cityId: input.cityId,
        districtId: input.districtId,
        title: input.title,
        description: input.description,
        locale: (input.locale ?? "tr") as any,
        urgency: input.urgency as any,
        budgetType: input.budgetType as any,
        budgetMin: input.budgetMin != null ? new Prisma.Decimal(input.budgetMin) : null,
        budgetMax: input.budgetMax != null ? new Prisma.Decimal(input.budgetMax) : null,
        currency: input.currency,
        status: "PUBLISHED", // MVP: otomatik yayın; moderasyon açılabilir
        publishedAt: new Date(),
        expiresAt,
        photos: input.photoIds.length
          ? { connect: input.photoIds.map((id) => ({ id })) }
          : undefined,
      },
      include: this.detailInclude(),
    });
    await this.indexListing(listing);
    if (listing.status === "PUBLISHED") {
      await this.notifyMatchingProviders({
        id: listing.id,
        categoryId: listing.categoryId,
        cityId: listing.cityId,
        title: listing.title,
        ownerId: listing.ownerId,
      }).catch(() => void 0);
    }
    return listing;
  }

  /** Cursor tabanlı, filtreli liste — "veri sınırına takılmama" için offset yerine cursor. */
  async search(input: SearchListingsInput): Promise<Paginated<any>> {
    const where: Prisma.ListingWhereInput = {
      status: "PUBLISHED",
      ...(input.categoryId ? { categoryId: input.categoryId } : {}),
      ...(input.cityId ? { cityId: input.cityId } : {}),
      ...(input.districtId ? { districtId: input.districtId } : {}),
      ...(input.urgency ? { urgency: input.urgency as any } : {}),
      ...(input.q
        ? {
            OR: [
              { title: { contains: input.q, mode: "insensitive" } },
              { description: { contains: input.q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(input.minBudget != null || input.maxBudget != null
        ? {
            budgetMax: input.minBudget != null ? { gte: input.minBudget } : undefined,
            budgetMin: input.maxBudget != null ? { lte: input.maxBudget } : undefined,
          }
        : {}),
    };

    const orderBy: Prisma.ListingOrderByWithRelationInput =
      input.sort === "budget_asc"
        ? { budgetMin: "asc" }
        : input.sort === "budget_desc"
          ? { budgetMax: "desc" }
          : input.sort === "urgent"
            ? { urgency: "desc" }
            : { createdAt: "desc" };

    const take = Math.min(input.limit, LISTING_MAX);
    const items = await this.prisma.listing.findMany({
      where,
      orderBy,
      take: take + 1,
      ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
      include: this.listInclude(),
    });

    let nextCursor: string | null = null;
    if (items.length > take) {
      nextCursor = items[take - 1].id;
      items.length = take;
    }
    return { items, nextCursor };
  }

  async findById(id: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      include: this.detailInclude(),
    });
    if (!listing) throw new NotFoundException({ code: "NOT_FOUND", message: "errors.notFound" });
    await this.prisma.listing
      .update({ where: { id }, data: { viewCount: { increment: 1 } } })
      .catch(() => void 0);
    return listing;
  }

  async listMine(ownerId: string) {
    return this.prisma.listing.findMany({
      where: { ownerId },
      orderBy: { createdAt: "desc" },
      include: this.listInclude(),
    });
  }

  async complete(id: string, ownerId: string) {
    const listing = await this.prisma.listing.findUnique({ where: { id } });
    if (!listing) throw new NotFoundException({ code: "NOT_FOUND", message: "errors.notFound" });
    if (listing.ownerId !== ownerId) {
      throw new ForbiddenException({ code: "FORBIDDEN", message: "errors.forbidden" });
    }
    return this.prisma.listing.update({
      where: { id },
      data: { status: "COMPLETED", completedAt: new Date() },
    });
  }

  private listInclude() {
    return {
      category: { include: { translations: true } },
      city: true,
      district: true,
      photos: true,
      owner: { select: { id: true, displayName: true, avatarUrl: true } },
      _count: { select: { offers: true } },
    } satisfies Prisma.ListingInclude;
  }

  private detailInclude() {
    return {
      ...this.listInclude(),
      offers: {
        include: {
          provider: {
            select: {
              id: true,
              displayName: true,
              avatarUrl: true,
              providerProfile: true,
            },
          },
        },
        orderBy: { createdAt: "desc" as const },
      },
    } satisfies Prisma.ListingInclude;
  }
}

const LISTING_MAX = 100;
