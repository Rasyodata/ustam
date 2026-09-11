import { Body, Controller, Get, Injectable, Module, Param, Patch } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CurrentUser, AuthUser } from "../../common/decorators/current-user.decorator";
import { Public } from "../../common/decorators/public.decorator";

@Injectable()
class UsersService {
  constructor(private prisma: PrismaService) {}

  async profile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { roles: true, providerProfile: { include: { categories: true, serviceAreas: true } } },
    });
    if (!user) return null;
    const { passwordHash, ...safe } = user;
    return safe;
  }

  /** Herkese açık usta profili (puan, yorum, tamamlanan iş). */
  async publicProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        displayName: true,
        avatarUrl: true,
        createdAt: true,
        providerProfile: {
          select: {
            kind: true,
            businessName: true,
            bio: true,
            verified: true,
            avgRating: true,
            reviewCount: true,
            completedJobs: true,
          },
        },
      },
    });
  }

  updateProfile(userId: string, data: { displayName?: string; avatarUrl?: string; locale?: string }) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        displayName: data.displayName,
        avatarUrl: data.avatarUrl,
        ...(data.locale ? { locale: data.locale as any } : {}),
      },
      select: { id: true, displayName: true, avatarUrl: true, locale: true },
    });
  }

  updateProviderProfile(
    userId: string,
    data: { businessName?: string; bio?: string; categoryIds?: string[]; cityIds?: string[] },
  ) {
    return this.prisma.providerProfile.update({
      where: { userId },
      data: {
        businessName: data.businessName,
        bio: data.bio,
        ...(data.categoryIds
          ? {
              categories: {
                deleteMany: {},
                create: data.categoryIds.map((categoryId) => ({ categoryId })),
              },
            }
          : {}),
        ...(data.cityIds
          ? {
              serviceAreas: {
                deleteMany: {},
                create: data.cityIds.map((cityId) => ({ cityId })),
              },
            }
          : {}),
      },
    });
  }
}

@Controller("users")
class UsersController {
  constructor(private users: UsersService) {}

  @Get("me")
  me(@CurrentUser() user: AuthUser) {
    return this.users.profile(user.id);
  }

  @Patch("me")
  update(@CurrentUser() user: AuthUser, @Body() body: any) {
    return this.users.updateProfile(user.id, body);
  }

  @Patch("me/provider")
  updateProvider(@CurrentUser() user: AuthUser, @Body() body: any) {
    return this.users.updateProviderProfile(user.id, body);
  }

  @Public()
  @Get(":id")
  publicProfile(@Param("id") id: string) {
    return this.users.publicProfile(id);
  }
}

@Module({ controllers: [UsersController], providers: [UsersService], exports: [UsersService] })
export class UsersModule {}
