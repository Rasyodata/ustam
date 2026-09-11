import { createHash } from "node:crypto";
import { ConfigService } from "@nestjs/config";
import { VerificationService } from "./verification.service";
import { OtpChannel, OtpPurpose } from "@ustam/shared";

function sha(code: string) {
  return createHash("sha256").update(code).digest("hex");
}

describe("VerificationService.verifyOtp", () => {
  const config = {
    get: (k: string) =>
      k === "security.otpTtlSeconds" ? 300 : k === "security.otpMaxAttempts" ? 5 : undefined,
  } as unknown as ConfigService;

  function makeService(otpRow: any) {
    const prisma: any = {
      otpCode: {
        findFirst: jest.fn().mockResolvedValue(otpRow),
        update: jest.fn().mockResolvedValue({}),
      },
      user: { update: jest.fn().mockResolvedValue({}) },
    };
    const mail: any = { sendOtp: jest.fn() };
    const sms: any = { sendOtp: jest.fn() };
    return { service: new VerificationService(prisma, mail, sms, config), prisma };
  }

  it("geçerli kod e-postayı doğrular", async () => {
    const code = "123456";
    const { service, prisma } = makeService({
      id: "otp1",
      codeHash: sha(code),
      attempts: 0,
      expiresAt: new Date(Date.now() + 60_000),
      consumedAt: null,
    });
    const res = await service.verifyOtp("u1", OtpChannel.EMAIL, OtpPurpose.VERIFY_EMAIL, code);
    expect(res).toEqual({ verified: true });
    expect(prisma.user.update).toHaveBeenCalled();
  });

  it("yanlış kod hata fırlatır ve deneme sayısını artırır", async () => {
    const { service, prisma } = makeService({
      id: "otp1",
      codeHash: sha("111111"),
      attempts: 0,
      expiresAt: new Date(Date.now() + 60_000),
      consumedAt: null,
    });
    await expect(
      service.verifyOtp("u1", OtpChannel.EMAIL, OtpPurpose.VERIFY_EMAIL, "000000"),
    ).rejects.toMatchObject({ response: { code: "OTP_INVALID" } });
    expect(prisma.otpCode.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { attempts: { increment: 1 } } }),
    );
  });

  it("süresi dolmuş kod reddedilir", async () => {
    const { service } = makeService({
      id: "otp1",
      codeHash: sha("123456"),
      attempts: 0,
      expiresAt: new Date(Date.now() - 1000),
      consumedAt: null,
    });
    await expect(
      service.verifyOtp("u1", OtpChannel.EMAIL, OtpPurpose.VERIFY_EMAIL, "123456"),
    ).rejects.toMatchObject({ response: { code: "OTP_INVALID" } });
  });
});
