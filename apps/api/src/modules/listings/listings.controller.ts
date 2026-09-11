import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ListingsService } from "./listings.service";
import { CreateListingDto, SearchListingsDto } from "./dto/listing.dto";
import { Public } from "../../common/decorators/public.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser, AuthUser } from "../../common/decorators/current-user.decorator";
import { UserRoleType } from "@ustam/shared";

@Controller("listings")
export class ListingsController {
  constructor(private listings: ListingsService) {}

  @Public()
  @Get()
  search(@Query() query: SearchListingsDto) {
    return this.listings.search(query);
  }

  @Get("mine")
  mine(@CurrentUser() user: AuthUser) {
    return this.listings.listMine(user.id);
  }

  @Public()
  @Get(":id")
  detail(@Param("id") id: string) {
    return this.listings.findById(id);
  }

  @Roles(UserRoleType.CUSTOMER, UserRoleType.COMPANY, UserRoleType.PROVIDER)
  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateListingDto) {
    return this.listings.create(user.id, dto);
  }

  @Patch(":id/complete")
  complete(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.listings.complete(id, user.id);
  }
}
