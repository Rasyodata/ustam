import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { createHash, randomBytes } from "node:crypto";
import { PrismaService } from "../../prisma/prisma.service";
import { UserRoleType, AuthTokens } from "@ustam/shared";
import { JwtPayload } from "./strategies/jwt.strategy";

/** Access + refresh token üretimi, rotasyonu ve iptali. */
@Injectable()
export class TokenService {
  constructor(
    private jwt: JwtService,
    private config: ConfigService,
    private prisma: PrismaService,
  ) {}

  private sha256(v: string) {
    return createHash("sha256").update(v).digest("hex");
  }

  async issue(
    user: { id: string; email: string; roles: UserRoleType[] },
    ctx?: { userAgent?: string; ip?: string },
  ): Promise<AuthTokens> {
    const payload: JwtPayload = { sub: user.id, email: user.email, roles: user.roles };

    const accessTtl = this.config.get<string>("jwt.accessTtl")!;
    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.get<string>("jwt.accessSecret"),
      expiresIn: accessTtl,
    });

    // Refresh token opak (DB'de hash'lenmiş saklanır → iptal edilebilir)
    const refreshToken = randomBytes(48).toString("base64url");
    const expiresAt = new Date(Date.now() + this.refreshMs());
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: this.sha256(refreshToken),
        userAgent: ctx?.userAgent,
        ip: ctx?.ip,
        expiresAt,
      },
    });

    return { accessToken, refreshToken, expiresIn: this.accessSeconds() };
  }

  /** Refresh token doğrula + rotasyon (eskiyi iptal et, yeni üret). */
  async rotate(refreshToken: string, ctx?: { userAgent?: string; ip?: string }) {
    const hash = this.sha256(refreshToken);
    const record = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: hash },
      include: { user: { include: { roles: true } } },
    });
    if (!record || record.revokedAt || record.expiresAt < new Date()) {
      return null;
    }
    await this.prisma.refreshToken.update({
      where: { id: record.id },
      data: { revokedAt: new Date() },
    });
    return this.issue(
      {
        id: record.user.id,
        email: record.user.email,
        roles: record.user.roles.map((r) => r.role as UserRoleType),
      },
      ctx,
    );
  }

  async revoke(refreshToken: string) {
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash: this.sha256(refreshToken), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllForUser(userId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private accessSeconds() {
    return this.parseMs(this.config.get<string>("jwt.accessTtl")!) / 1000;
  }
  private refreshMs() {
    return this.parseMs(this.config.get<string>("jwt.refreshTtl")!);
  }
  private parseMs(ttl: string): number {
    const m = ttl.match(/^(\d+)([smhd])$/);
    if (!m) return 900_000;
    const n = parseInt(m[1], 10);
    const unit = { s: 1e3, m: 6e4, h: 36e5, d: 864e5 }[m[2]]!;
    return n * unit;
  }
}
