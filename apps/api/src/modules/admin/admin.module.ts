import { Body, Controller, Get, Injectable, Module, Param, Patch, Query } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser, AuthUser } from "../../common/decorators/current-user.decorator";
import { UserRoleType, UserStatus } from "@ustam/shared";

@Injectable()
class AdminService {
  constructor(private prisma: PrismaService) {}

  async stats() {
    const [users, providers, listings, offers, openReports] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.providerProfile.count(),
      this.prisma.listing.count(),
      this.prisma.offer.count(),
      this.prisma.report.count({ where: { status: "OPEN" } }),
    ]);
    const byStatus = await this.prisma.listing.groupBy({
      by: ["status"],
      _count: true,
    });
    return { users, providers, listings, offers, openReports, listingsByStatus: byStatus };
  }

  listUsers(q?: string) {
    return this.prisma.user.findMany({
      where: q
        ? { OR: [{ email: { contains: q, mode: "insensitive" } }, { displayName: { contains: q, mode: "insensitive" } }] }
        : undefined,
      take: 50,
      orderBy: { createdAt: "desc" },
      include: { roles: true },
    });
  }

  async setUserStatus(actorId: string, userId: string, status: UserStatus, ip?: string) {
    const user = await this.prisma.user.update({ where: { id: userId }, data: { status } });
    await this.audit(actorId, `user.status.${status}`, `User:${userId}`, { status }, ip);
    return user;
  }

  /** Admin, bir ustanın puanını doğrudan ayarlar (override). 0-5 arası. */
  async setProviderRating(actorId: string, userId: string, rating: number, ip?: string) {
    const clamped = Math.max(0, Math.min(5, rating));
    const profile = await this.prisma.providerProfile.update({
      where: { userId },
      data: { avgRating: clamped },
    });
    await this.audit(actorId, "provider.rating.override", `User:${userId}`, { rating: clamped }, ip);
    return profile;
  }

  async moderateListing(actorId: string, listingId: string, approve: boolean, ip?: string) {
    const listing = await this.prisma.listing.update({
      where: { id: listingId },
      data: approve
        ? { status: "PUBLISHED", publishedAt: new Date() }
        : { status: "REJECTED" },
    });
    await this.audit(actorId, approve ? "listing.approve" : "listing.reject", `Listing:${listingId}`, {}, ip);
    return listing;
  }

  listReports() {
    return this.prisma.report.findMany({
      where: { status: { in: ["OPEN", "REVIEWING"] } },
      orderBy: { createdAt: "desc" },
      include: { reporter: { select: { displayName: true, email: true } } },
    });
  }

  auditLog() {
    return this.prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  }

  private audit(actorId: string, action: string, target: string, meta: any, ip?: string) {
    return this.prisma.auditLog.create({ data: { actorId, action, target, meta, ip } });
  }
}

@Roles(UserRoleType.MODERATOR, UserRoleType.SUPPORT, UserRoleType.ADMIN, UserRoleType.SUPER_ADMIN)
@Controller("admin")
class AdminController {
  constructor(private admin: AdminService) {}

  @Get("stats")
  stats() {
    return this.admin.stats();
  }

  @Get("users")
  users(@Query("q") q?: string) {
    return this.admin.listUsers(q);
  }

  @Roles(UserRoleType.ADMIN, UserRoleType.SUPER_ADMIN)
  @Patch("users/:id/status")
  setStatus(@CurrentUser() actor: AuthUser, @Param("id") id: string, @Body("status") status: UserStatus) {
    return this.admin.setUserStatus(actor.id, id, status);
  }

  @Patch("listings/:id/moderate")
  moderate(@CurrentUser() actor: AuthUser, @Param("id") id: string, @Body("approve") approve: boolean) {
    return this.admin.moderateListing(actor.id, id, approve);
  }

  /** Admin ustanın puanını override eder. */
  @Roles(UserRoleType.ADMIN, UserRoleType.SUPER_ADMIN)
  @Patch("providers/:userId/rating")
  setRating(@CurrentUser() actor: AuthUser, @Param("userId") userId: string, @Body("rating") rating: number) {
    return this.admin.setProviderRating(actor.id, userId, Number(rating));
  }

  @Get("reports")
  reports() {
    return this.admin.listReports();
  }

  @Roles(UserRoleType.ADMIN, UserRoleType.SUPER_ADMIN)
  @Get("audit")
  audit() {
    return this.admin.auditLog();
  }
}

@Module({ controllers: [AdminController], providers: [AdminService] })
export class AdminModule {}
