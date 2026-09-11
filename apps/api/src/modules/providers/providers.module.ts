import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Injectable,
  Module,
  NotFoundException,
  Param,
  Post,
  Query,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { PushService } from "../push/push.module";
import { CurrentUser, AuthUser } from "../../common/decorators/current-user.decorator";
import { Public } from "../../common/decorators/public.decorator";
import { computeProviderTier, PAGINATION } from "@ustam/shared";

@Injectable()
export class ProvidersService {
  constructor(
    private prisma: PrismaService,
    private push: PushService,
  ) {}

  /**
   * Usta dizini — kategori/şehir filtreli, MÜŞTERİ PUANLARINA GÖRE SIRALI.
   * (En yüksek ortalama puan + en çok tamamlanan iş üstte = sektör sıralaması.)
   */
  async list(opts: {
    categoryId?: string;
    cityId?: string;
    verifiedOnly?: boolean;
    limit?: number;
  }) {
    const take = Math.min(opts.limit ?? PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
    const where: Prisma.ProviderProfileWhereInput = {
      user: { status: "ACTIVE" },
      ...(opts.verifiedOnly ? { verified: true } : {}),
      ...(opts.categoryId ? { categories: { some: { categoryId: opts.categoryId } } } : {}),
      ...(opts.cityId
        ? { OR: [{ serviceAreas: { some: { cityId: opts.cityId } } }, { serviceAreas: { none: {} } }] }
        : {}),
    };

    const profiles = await this.prisma.providerProfile.findMany({
      where,
      // Sektör sıralaması: önce puan, sonra tamamlanan iş, sonra yorum sayısı
      orderBy: [{ avgRating: "desc" }, { completedJobs: "desc" }, { reviewCount: "desc" }],
      take,
      include: {
        user: { select: { id: true, displayName: true, avatarUrl: true } },
        categories: { include: { category: { include: { translations: true } } } },
      },
    });

    return profiles.map((p, i) => ({
      rank: i + 1,
      userId: p.userId,
      displayName: p.user.displayName,
      avatarUrl: p.user.avatarUrl,
      businessName: p.businessName,
      kind: p.kind,
      verified: p.verified,
      avgRating: p.avgRating,
      reviewCount: p.reviewCount,
      completedJobs: p.completedJobs,
      tier: computeProviderTier({
        avgRating: p.avgRating,
        reviewCount: p.reviewCount,
        completedJobs: p.completedJobs,
        verified: p.verified,
      }),
      categoryIds: p.categories.map((c) => c.categoryId),
    }));
  }

  /** Müşteri belirli bir ustadan teklif ister (davet). İsteğe bağlı ilan bağlanır. */
  async requestQuote(customerId: string, providerUserId: string, listingId?: string, message?: string) {
    const provider = await this.prisma.user.findFirst({
      where: { id: providerUserId, providerProfile: { isNot: null } },
    });
    if (!provider) throw new NotFoundException({ code: "NOT_FOUND", message: "errors.notFound" });
    if (providerUserId === customerId) {
      throw new BadRequestException({ code: "SELF_REQUEST", message: "errors.generic" });
    }
    if (listingId) {
      const listing = await this.prisma.listing.findUnique({ where: { id: listingId } });
      if (!listing) throw new NotFoundException({ code: "NOT_FOUND", message: "errors.notFound" });
      if (listing.ownerId !== customerId) {
        throw new ForbiddenException({ code: "FORBIDDEN", message: "errors.forbidden" });
      }
    }

    await this.prisma.notification.create({
      data: {
        userId: providerUserId,
        type: "LISTING_MATCH",
        titleKey: "notifications.quoteRequested",
        data: { customerId, listingId, message },
      },
    });
    await this.push.sendToUser(providerUserId, "Ustam", "Bir müşteri sizden teklif istiyor", {
      listingId,
    });
    return { requested: true };
  }
}

@Controller("providers")
class ProvidersController {
  constructor(private providers: ProvidersService) {}

  @Public()
  @Get()
  list(
    @Query("categoryId") categoryId?: string,
    @Query("cityId") cityId?: string,
    @Query("verified") verified?: string,
    @Query("limit") limit?: string,
  ) {
    return this.providers.list({
      categoryId,
      cityId,
      verifiedOnly: verified === "true",
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Post(":providerUserId/request-quote")
  requestQuote(
    @CurrentUser() user: AuthUser,
    @Param("providerUserId") providerUserId: string,
    @Body() body: { listingId?: string; message?: string },
  ) {
    return this.providers.requestQuote(user.id, providerUserId, body.listingId, body.message);
  }
}

@Module({ controllers: [ProvidersController], providers: [ProvidersService], exports: [ProvidersService] })
export class ProvidersModule {}
