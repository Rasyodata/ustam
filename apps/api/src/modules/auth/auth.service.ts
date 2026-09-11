import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { PasswordService } from "./password.service";
import { TokenService } from "./token.service";
import { VerificationService } from "../verification/verification.service";
import {
  AuthResult,
  OtpChannel,
  OtpPurpose,
  PublicUser,
  RegisterInput,
  SECURITY,
  UserRoleType,
} from "@ustam/shared";

type ReqCtx = { userAgent?: string; ip?: string };

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private passwords: PasswordService,
    private tokens: TokenService,
    private verification: VerificationService,
  ) {}

  private toPublicUser(u: any): PublicUser {
    return {
      id: u.id,
      displayName: u.displayName,
      avatarUrl: u.avatarUrl ?? undefined,
      roles: u.roles.map((r: any) => r.role as UserRoleType),
      locale: u.locale,
      emailVerified: !!u.emailVerifiedAt,
      phoneVerified: !!u.phoneVerifiedAt,
      status: u.status,
      createdAt: u.createdAt.toISOString(),
    };
  }

  async register(input: RegisterInput, ctx?: ReqCtx): Promise<AuthResult> {
    const email = input.email.toLowerCase();
    const exists = await this.prisma.user.findFirst({
      where: { OR: [{ email }, { phone: input.phone }] },
    });
    if (exists) {
      throw new ConflictException({
        code: exists.email === email ? "EMAIL_TAKEN" : "PHONE_TAKEN",
        message: exists.email === email ? "errors.emailTaken" : "errors.phoneTaken",
      });
    }

    const passwordHash = await this.passwords.hash(input.password);
    const user = await this.prisma.user.create({
      data: {
        email,
        phone: input.phone,
        passwordHash,
        displayName: input.displayName,
        locale: (input.locale ?? "tr") as any,
        status: "PENDING",
        roles: { create: [{ role: input.role as UserRoleType }] },
        // Hizmet veren ise boş profil iskeleti
        ...(input.role !== "CUSTOMER"
          ? {
              providerProfile: {
                create: {
                  kind: input.role === "COMPANY" ? "CONTRACTOR" : "INDIVIDUAL",
                  businessName: input.displayName,
                },
              },
            }
          : {}),
      },
      include: { roles: true },
    });

    // Doğrulama kodlarını gönder (e-posta + SMS)
    await this.verification.requestOtp(user.id, OtpChannel.EMAIL, OtpPurpose.VERIFY_EMAIL);
    if (user.phone) {
      await this.verification
        .requestOtp(user.id, OtpChannel.SMS, OtpPurpose.VERIFY_PHONE)
        .catch(() => void 0);
    }

    const tokens = await this.tokens.issue(
      { id: user.id, email: user.email, roles: [input.role as UserRoleType] },
      ctx,
    );
    return { user: this.toPublicUser(user), tokens };
  }

  async login(email: string, password: string, ctx?: ReqCtx): Promise<AuthResult> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { roles: true },
    });

    // Kullanıcı yoksa bile argon2 çalıştırıp zamanlama sızıntısını azaltabiliriz;
    // sade tutuyoruz ama jenerik hata döndürüyoruz.
    if (!user) {
      throw new UnauthorizedException({
        code: "INVALID_CREDENTIALS",
        message: "errors.invalidCredentials",
      });
    }

    // Hesap kilidi
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new ForbiddenException({ code: "ACCOUNT_LOCKED", message: "errors.otpTooMany" });
    }
    if (["BANNED", "DELETED", "SUSPENDED"].includes(user.status)) {
      throw new ForbiddenException({ code: "ACCOUNT_DISABLED", message: "errors.forbidden" });
    }

    const ok = await this.passwords.verify(user.passwordHash, password);
    if (!ok) {
      const failed = user.failedLogins + 1;
      const lock =
        failed >= SECURITY.LOGIN_MAX_ATTEMPTS
          ? new Date(Date.now() + SECURITY.LOGIN_LOCK_MINUTES * 60_000)
          : null;
      await this.prisma.user.update({
        where: { id: user.id },
        data: { failedLogins: failed, lockedUntil: lock },
      });
      throw new UnauthorizedException({
        code: "INVALID_CREDENTIALS",
        message: "errors.invalidCredentials",
      });
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { failedLogins: 0, lockedUntil: null, lastLoginAt: new Date() },
    });

    const tokens = await this.tokens.issue(
      { id: user.id, email: user.email, roles: user.roles.map((r) => r.role as UserRoleType) },
      ctx,
    );
    return { user: this.toPublicUser(user), tokens };
  }

  async refresh(refreshToken: string, ctx?: ReqCtx) {
    const tokens = await this.tokens.rotate(refreshToken, ctx);
    if (!tokens) {
      throw new UnauthorizedException({ code: "INVALID_TOKEN", message: "errors.unauthorized" });
    }
    return tokens;
  }

  async logout(refreshToken: string) {
    await this.tokens.revoke(refreshToken);
    return { success: true };
  }

  async me(userId: string): Promise<PublicUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { roles: true },
    });
    if (!user) throw new BadRequestException({ code: "NOT_FOUND", message: "errors.notFound" });
    return this.toPublicUser(user);
  }
}
