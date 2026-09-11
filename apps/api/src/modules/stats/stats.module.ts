import { Controller, Get, Injectable, Module, Query } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { Public } from "../../common/decorators/public.decorator";
import { Locale, DEFAULT_LOCALE } from "@ustam/shared";

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  private name(translations: { locale: string; name: string }[], locale: Locale) {
    return (
      translations.find((t) => t.locale === locale)?.name ??
      translations.find((t) => t.locale === DEFAULT_LOCALE)?.name ??
      translations[0]?.name ??
      ""
    );
  }

  /**
   * Herkese açık genel analiz: kategori başına iş + usta sayısı, toplamlar.
   * cityId verilirse tüm sayımlar o şehre göre filtrelenir.
   */
  async overview(locale: Locale = DEFAULT_LOCALE, cityId?: string) {
    // Şehre göre usta kapsamı: o şehre hizmet veren (ya da bölge belirtmemiş) ustalar
    const providerCityFilter: Prisma.ProviderProfileWhereInput | undefined = cityId
      ? { OR: [{ serviceAreas: { some: { cityId } } }, { serviceAreas: { none: {} } }] }
      : undefined;

    const listingWhere: Prisma.ListingWhereInput = {
      status: "PUBLISHED",
      ...(cityId ? { cityId } : {}),
    };

    const [cats, listingGroups, providerGroups, totalListings, activeListings, totalProviders, totalOffers, totalCities] =
      await Promise.all([
        this.prisma.category.findMany({ where: { active: true }, include: { translations: true } }),
        this.prisma.listing.groupBy({ by: ["categoryId"], _count: true, where: listingWhere }),
        this.prisma.providerCategory.groupBy({
          by: ["categoryId"],
          _count: true,
          ...(providerCityFilter ? { where: { provider: providerCityFilter } } : {}),
        }),
        this.prisma.listing.count({ where: cityId ? { cityId } : {} }),
        this.prisma.listing.count({ where: listingWhere }),
        this.prisma.providerProfile.count({ where: providerCityFilter }),
        this.prisma.offer.count(),
        this.prisma.city.count(),
      ]);

    const listingMap = new Map(listingGroups.map((g) => [g.categoryId, g._count]));
    const providerMap = new Map(providerGroups.map((g) => [g.categoryId, g._count]));

    const categories = cats
      .map((c) => ({
        id: c.id,
        slug: c.slug,
        icon: c.icon,
        parentId: c.parentId,
        name: this.name(c.translations, locale),
        listingCount: (listingMap.get(c.id) as number) ?? 0,
        providerCount: (providerMap.get(c.id) as number) ?? 0,
      }))
      .sort((a, b) => b.listingCount - a.listingCount);

    return {
      cityId: cityId ?? null,
      totals: {
        listings: totalListings,
        activeListings,
        providers: totalProviders,
        offers: totalOffers,
        cities: totalCities,
        categories: cats.length,
      },
      categories,
    };
  }
}

@Controller("stats")
class StatsController {
  constructor(private stats: StatsService) {}

  @Public()
  @Get()
  overview(@Query("lang") lang?: string, @Query("cityId") cityId?: string) {
    return this.stats.overview((lang ?? DEFAULT_LOCALE) as Locale, cityId || undefined);
  }
}

@Module({ controllers: [StatsController], providers: [StatsService] })
export class StatsModule {}
