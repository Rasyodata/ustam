import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { OffersService } from "./offers.service";
import { CreateOfferDto } from "./dto/offer.dto";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser, AuthUser } from "../../common/decorators/current-user.decorator";
import { UserRoleType } from "@ustam/shared";

@Controller("offers")
export class OffersController {
  constructor(private offers: OffersService) {}

  @Roles(UserRoleType.PROVIDER, UserRoleType.COMPANY)
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateOfferDto) {
    return this.offers.create(user.id, dto);
  }

  @Get("mine")
  mine(@CurrentUser() user: AuthUser) {
    return this.offers.listMine(user.id);
  }

  @Patch(":id/accept")
  accept(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.offers.accept(id, user.id);
  }

  @Patch(":id/reject")
  reject(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.offers.reject(id, user.id);
  }

  @Patch(":id/withdraw")
  withdraw(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.offers.withdraw(id, user.id);
  }
}
