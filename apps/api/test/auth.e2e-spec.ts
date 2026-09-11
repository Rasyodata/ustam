import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";

/**
 * Uçtan uca akış: kayıt → giriş → ilan → teklif.
 * Çalışması için PostgreSQL ve seed (kategori/şehir) gerekir.
 * CI'da docker postgres + prisma migrate + seed ile koşar.
 */
describe("Ustam E2E akışı", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const uniq = Date.now();
  const customer = { email: `musteri${uniq}@test.app`, phone: `+9050${uniq}`.slice(0, 13), password: "Test1234", displayName: "Test Müşteri" };
  let customerToken: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix("api/v1");
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: customer.email } }).catch(() => {});
    await app.close();
  });

  it("yeni müşteri kaydı yapar ve token alır", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/v1/auth/register")
      .send({ ...customer, role: "CUSTOMER", acceptTerms: true });
    expect(res.status).toBe(201);
    expect(res.body.tokens?.accessToken).toBeDefined();
    expect(res.body.user.emailVerified).toBe(false);
    customerToken = res.body.tokens.accessToken;
  });

  it("aynı e-posta ile tekrar kayıt reddedilir", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/v1/auth/register")
      .send({ ...customer, role: "CUSTOMER", acceptTerms: true });
    expect(res.status).toBe(409);
    expect(res.body.code).toBe("EMAIL_TAKEN");
  });

  it("yanlış şifre ile giriş 401 döner", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({ email: customer.email, password: "yanlis00" });
    expect(res.status).toBe(401);
    expect(res.body.code).toBe("INVALID_CREDENTIALS");
  });

  it("token olmadan /auth/me 401 döner", async () => {
    const res = await request(app.getHttpServer()).get("/api/v1/auth/me");
    expect(res.status).toBe(401);
  });

  it("geçerli token ile /auth/me profili döner", async () => {
    const res = await request(app.getHttpServer())
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${customerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBeUndefined(); // PublicUser email içermez
    expect(res.body.displayName).toBe(customer.displayName);
  });

  it("kategoriler herkese açık listelenir", async () => {
    const res = await request(app.getHttpServer()).get("/api/v1/categories?lang=tr");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
