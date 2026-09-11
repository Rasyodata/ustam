import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CategoryView, Locale, DEFAULT_LOCALE } from "@ustam/shared";

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  private resolveName(
    translations: { locale: string; name: string }[],
    locale: Locale,
  ): string {
    return (
      translations.find((t) => t.locale === locale)?.name ??
      translations.find((t) => t.locale === DEFAULT_LOCALE)?.name ??
      translations[0]?.name ??
      ""
    );
  }

  /** Verilen dilde kategori ağacını döndürür (eksik çeviride varsayılana düşer). */
  async tree(locale: Locale = DEFAULT_LOCALE): Promise<CategoryView[]> {
    const cats = await this.prisma.category.findMany({
      where: { active: true },
      include: { translations: true, _count: { select: { children: true } } },
      orderBy: { order: "asc" },
    });
    return cats.map((c) => ({
      id: c.id,
      slug: c.slug,
      parentId: c.parentId,
      name: this.resolveName(c.translations, locale),
      icon: c.icon ?? undefined,
      childrenCount: c._count.children,
    }));
  }

  async children(parentId: string | null, locale: Locale = DEFAULT_LOCALE) {
    const cats = await this.prisma.category.findMany({
      where: { parentId, active: true },
      include: { translations: true, _count: { select: { children: true } } },
      orderBy: { order: "asc" },
    });
    return cats.map((c) => ({
      id: c.id,
      slug: c.slug,
      parentId: c.parentId,
      name: this.resolveName(c.translations, locale),
      icon: c.icon ?? undefined,
      childrenCount: c._count.children,
    }));
  }
}
