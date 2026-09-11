import { BadRequestException, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createHash, randomInt } from "node:crypto";
import { PrismaService } from "../../prisma/prisma.service";
import { MailProvider } from "./providers/mail.provider";
import { SmsProvider } from "./providers/sms.provider";
import { OtpChannel, OtpPurpose, SECURITY } from "@ustam/shared";

/** SMS + e-posta OTP üretimi ve doğrulaması. */
@Injectable()
export class VerificationService {
  private readonly ttlSec: number;
  private readonly maxAttempts: number;

  constructor(
    private prisma: PrismaService,
    private mail: MailProvider,
    private sms: SmsProvider,
    config: ConfigService,
  ) {
    this.ttlSec = config.get<number>("security.otpTtlSeconds") ?? SECURITY.OTP_TTL_SECONDS;
    this.maxAttempts = config.get<number>("security.otpMaxAttempts") ?? SECURITY.OTP_MAX_ATTEMPTS;
  }

  private hash(code: string) {
    return createHash("sha256").update(code).digest("hex");
  }

  /** Kod üret, hash'le sakla, ilgili kanaldan gönder. */
  async requestOtp(userId: string, channel: OtpChannel, purpose: OtpPurpose) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException({ code: "NOT_FOUND", message: "errors.notFound" });

    // Aynı amaçla çok sık istek → basit cooldown (son 60 sn)
    const recent = await this.prisma.otpCode.findFirst({
      where: { userId, purpose, createdAt: { gt: new Date(Date.now() - 60_000) } },
      orderBy: { createdAt: "desc" },
    });
    if (recent) {
      throw new HttpException(
        { code: "RATE_LIMITED", message: "errors.rateLimited" },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const code = randomInt(0, 1_000_000).toString().padStart(SECURITY.OTP_LENGTH, "0");
    await this.prisma.otpCode.create({
      data: {
        userId,
        channel,
        purpose,
        codeHash: this.hash(code),
        expiresAt: new Date(Date.now() + this.ttlSec * 1000),
      },
    });

    if (channel === OtpChannel.EMAIL) {
      await this.mail.sendOtp(user.email, code, user.locale as any);
    } else if (user.phone) {
      await this.sms.sendOtp(user.phone, code);
    }
    return { sent: true, channel };
  }

  /** Kodu doğrula; başarılıysa ilgili alanı (email/phone) doğrulanmış işaretle. */
  async verifyOtp(userId: string, channel: OtpChannel, purpose: OtpPurpose, code: string) {
    const otp = await this.prisma.otpCode.findFirst({
      where: { userId, channel, purpose, consumedAt: null },
      orderBy: { createdAt: "desc" },
    });
    if (!otp || otp.expiresAt < new Date()) {
      throw new BadRequestException({ code: "OTP_INVALID", message: "errors.otpInvalid" });
    }
    if (otp.attempts >= this.maxAttempts) {
      throw new HttpException(
        { code: "OTP_TOO_MANY", message: "errors.otpTooMany" },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    if (otp.codeHash !== this.hash(code)) {
      await this.prisma.otpCode.update({
        where: { id: otp.id },
        data: { attempts: { increment: 1 } },
      });
      throw new BadRequestException({ code: "OTP_INVALID", message: "errors.otpInvalid" });
    }

    await this.prisma.otpCode.update({
      where: { id: otp.id },
      data: { consumedAt: new Date() },
    });

    // Doğrulama etkisi
    if (purpose === OtpPurpose.VERIFY_EMAIL) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { emailVerifiedAt: new Date(), status: "ACTIVE" },
      });
    } else if (purpose === OtpPurpose.VERIFY_PHONE) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { phoneVerifiedAt: new Date() },
      });
    }
    return { verified: true };
  }
}
