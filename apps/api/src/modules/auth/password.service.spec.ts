import { ConfigService } from "@nestjs/config";
import { PasswordService } from "./password.service";

describe("PasswordService", () => {
  const config = { get: (k: string) => (k === "security.passwordPepper" ? "test-pepper" : undefined) } as unknown as ConfigService;
  const service = new PasswordService(config);

  it("doğru şifreyi doğrular", async () => {
    const hash = await service.hash("Secret123");
    expect(hash).toMatch(/^\$argon2id\$/);
    await expect(service.verify(hash, "Secret123")).resolves.toBe(true);
  });

  it("yanlış şifreyi reddeder", async () => {
    const hash = await service.hash("Secret123");
    await expect(service.verify(hash, "Wrong000")).resolves.toBe(false);
  });

  it("pepper olmadan üretilen hash eşleşmez (pepper etkisi)", async () => {
    const noPepper = new PasswordService({ get: () => "" } as unknown as ConfigService);
    const hash = await noPepper.hash("Secret123");
    // Pepper'lı servis aynı düz şifreyi doğrulayamamalı
    await expect(service.verify(hash, "Secret123")).resolves.toBe(false);
  });
});
