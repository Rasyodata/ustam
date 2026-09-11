import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_GUARD, APP_PIPE } from "@nestjs/core";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { ZodValidationPipe } from "nestjs-zod";
import * as path from "node:path";
import {
  I18nModule,
  QueryResolver,
  AcceptLanguageResolver,
  HeaderResolver,
} from "nestjs-i18n";

import configuration from "./config/configuration";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { VerificationModule } from "./modules/verification/verification.module";
import { CategoriesModule } from "./modules/categories/categories.module";
import { ListingsModule } from "./modules/listings/listings.module";
import { OffersModule } from "./modules/offers/offers.module";
import { ReviewsModule } from "./modules/reviews/reviews.module";
import { LocationsModule } from "./modules/locations/locations.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { AdminModule } from "./modules/admin/admin.module";
import { MessagingModule } from "./modules/messaging/messaging.module";
import { MediaModule } from "./modules/media/media.module";
import { SearchModule } from "./modules/search/search.module";
import { UsersModule } from "./modules/users/users.module";
import { PushModule } from "./modules/push/push.module";
import { PaymentsModule } from "./modules/payments/payments.module";
import { ProvidersModule } from "./modules/providers/providers.module";
import { StatsModule } from "./modules/stats/stats.module";
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";
import { RolesGuard } from "./common/guards/roles.guard";
import { Reflector } from "@nestjs/core";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),

    // Rate limiting (global) — Redis ile dağıtık ortamda da tutarlı
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: (config.get<number>("security.rateLimitTtl") ?? 60) * 1000,
            limit: config.get<number>("security.rateLimitMax") ?? 120,
          },
        ],
      }),
    }),

    // Çok dilli backend mesajları (hata, e-posta, SMS şablonları)
    I18nModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        fallbackLanguage: config.get<string>("defaultLocale") ?? "tr",
        loaderOptions: {
          path: path.join(__dirname, "/i18n/"),
          watch: true,
        },
      }),
      resolvers: [
        new HeaderResolver(["x-lang"]),
        new QueryResolver(["lang"]),
        AcceptLanguageResolver,
      ],
    }),

    PrismaModule,
    SearchModule,
    PushModule,
    AuthModule,
    UsersModule,
    ProvidersModule,
    StatsModule,
    VerificationModule,
    CategoriesModule,
    ListingsModule,
    OffersModule,
    ReviewsModule,
    LocationsModule,
    NotificationsModule,
    MessagingModule,
    MediaModule,
    PaymentsModule,
    AdminModule,
  ],
  providers: [
    // Girdi doğrulama: zod tabanlı (paylaşılan şemalar)
    { provide: APP_PIPE, useClass: ZodValidationPipe },
    // Önce rate-limit, sonra JWT, sonra RBAC
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    Reflector,
  ],
})
export class AppModule {}
