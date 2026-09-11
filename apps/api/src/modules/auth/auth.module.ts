import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { PasswordService } from "./password.service";
import { TokenService } from "./token.service";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { VerificationModule } from "../verification/verification.module";

@Module({
  imports: [PassportModule, JwtModule.register({}), VerificationModule],
  controllers: [AuthController],
  providers: [AuthService, PasswordService, TokenService, JwtStrategy],
  exports: [AuthService, TokenService, PasswordService],
})
export class AuthModule {}
