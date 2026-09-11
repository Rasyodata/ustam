import { Body, Controller, Delete, Global, Injectable, Logger, Module, Post } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CurrentUser, AuthUser } from "../../common/decorators/current-user.decorator";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

@Injectable()
export class PushService {
  private readonly logger = new Logger("Push");
  constructor(private prisma: PrismaService) {}

  async register(userId: string, token: string, platform?: string) {
    if (!token?.startsWith("ExponentPushToken")) return { ok: false };
    await this.prisma.pushToken.upsert({
      where: { token },
      update: { userId, platform },
      create: { userId, token, platform },
    });
    return { ok: true };
  }

  async unregister(token: string) {
    await this.prisma.pushToken.deleteMany({ where: { token } });
    return { ok: true };
  }

  /** Kullanıcının tüm cihazlarına Expo push bildirimi gönderir. */
  async sendToUser(userId: string, title: string, body: string, data?: Record<string, unknown>) {
    const tokens = await this.prisma.pushToken.findMany({ where: { userId } });
    if (tokens.length === 0) return;
    const messages = tokens.map((t) => ({ to: t.token, title, body, data, sound: "default" }));
    try {
      await fetch(EXPO_PUSH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messages),
      });
    } catch (e) {
      this.logger.warn(`Push gönderilemedi: ${(e as Error).message}`);
    }
  }
}

@Controller("push")
class PushController {
  constructor(private push: PushService) {}

  @Post("register")
  register(
    @CurrentUser() user: AuthUser,
    @Body() body: { token: string; platform?: string },
  ) {
    return this.push.register(user.id, body.token, body.platform);
  }

  @Delete("register")
  unregister(@Body() body: { token: string }) {
    return this.push.unregister(body.token);
  }
}

@Global()
@Module({ controllers: [PushController], providers: [PushService], exports: [PushService] })
export class PushModule {}
