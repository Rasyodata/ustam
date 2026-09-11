import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const config = app.get(ConfigService);
  const logger = new Logger("Bootstrap");

  // Güvenlik başlıkları
  app.use(helmet());

  // CORS — yalnız bilinen origin'ler
  app.enableCors({
    origin: [config.get("webUrl"), config.get("adminUrl")].filter(Boolean) as string[],
    credentials: true,
  });

  // Global prefix + versiyon
  app.setGlobalPrefix("api/v1");

  // Girdi doğrulama + whitelist (fazla alanları at, tip dönüşümü)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Standart hata gövdesi
  app.useGlobalFilters(new HttpExceptionFilter());

  app.enableShutdownHooks();

  const port = process.env.PORT ? Number(process.env.PORT) : (config.get<number>("port") ?? 4000);
  await app.listen(port, "0.0.0.0");
  logger.log(`🚀 Ustam API çalışıyor: http://localhost:${port}/api/v1`);
}

bootstrap();
