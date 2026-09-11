import { Body, Controller, Post } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { VerificationService } from "./verification.service";
import { RequestOtpDto, VerifyOtpDto } from "../auth/dto/auth.dto";
import { CurrentUser, AuthUser } from "../../common/decorators/current-user.decorator";

@Controller("verification")
export class VerificationController {
  constructor(private verification: VerificationService) {}

  @Throttle({ default: { limit: 3, ttl: 60_000 } }) // OTP isteği: dakikada 3
  @Post("request")
  request(@CurrentUser() user: AuthUser, @Body() dto: RequestOtpDto) {
    return this.verification.requestOtp(user.id, dto.channel as any, dto.purpose as any);
  }

  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post("verify")
  verify(@CurrentUser() user: AuthUser, @Body() dto: VerifyOtpDto) {
    return this.verification.verifyOtp(user.id, dto.channel as any, dto.purpose as any, dto.code);
  }
}
