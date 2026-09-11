import { Controller, Get, Module, Param } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { Public } from "../../common/decorators/public.decorator";

@Controller("locations")
class LocationsController {
  constructor(private prisma: PrismaService) {}

  @Public()
  @Get("cities")
  cities() {
    return this.prisma.city.findMany({ orderBy: { name: "asc" } });
  }

  @Public()
  @Get("cities/:cityId/districts")
  districts(@Param("cityId") cityId: string) {
    return this.prisma.district.findMany({
      where: { cityId },
      orderBy: { name: "asc" },
    });
  }
}

@Module({ controllers: [LocationsController] })
export class LocationsModule {}
