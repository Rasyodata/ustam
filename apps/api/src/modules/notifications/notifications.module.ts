import { Controller, Get, Injectable, Module, Param, Patch } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CurrentUser, AuthUser } from "../../common/decorators/current-user.decorator";

@Injectable()
class NotificationsService {
  constructor(private prisma: PrismaService) {}

  list(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  markRead(userId: string, id: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { readAt: new Date() },
    });
  }

  markAllRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
  }
}

@Controller("notifications")
class NotificationsController {
  constructor(private notifications: NotificationsService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.notifications.list(user.id);
  }

  @Patch(":id/read")
  read(@CurrentUser() user: AuthUser, @Param("id") id: string) {
    return this.notifications.markRead(user.id, id);
  }

  @Patch("read-all")
  readAll(@CurrentUser() user: AuthUser) {
    return this.notifications.markAllRead(user.id);
  }
}

@Module({ controllers: [NotificationsController], providers: [NotificationsService] })
export class NotificationsModule {}
