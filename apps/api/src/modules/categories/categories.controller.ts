import { Controller, Get, Query } from "@nestjs/common";
import { I18n, I18nContext } from "nestjs-i18n";
import { CategoriesService } from "./categories.service";
import { Public } from "../../common/decorators/public.decorator";
import { Locale } from "@ustam/shared";

@Controller("categories")
export class CategoriesController {
  constructor(private categories: CategoriesService) {}

  @Public()
  @Get()
  tree(@I18n() i18n: I18nContext, @Query("lang") lang?: string) {
    return this.categories.tree((lang ?? i18n.lang) as Locale);
  }

  @Public()
  @Get("children")
  children(
    @I18n() i18n: I18nContext,
    @Query("parentId") parentId?: string,
    @Query("lang") lang?: string,
  ) {
    return this.categories.children(parentId ?? null, (lang ?? i18n.lang) as Locale);
  }
}
