import { Body, Controller, Get, Post, Req } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { Request } from "express";
import { AuthService } from "./auth.service";
import { LoginDto, RegisterDto } from "./dto/auth.dto";
import { Public } from "../../common/decorators/public.decorator";
import { CurrentUser, AuthUser } from "../../common/decorators/current-user.decorator";

function ctxOf(req: Request) {
  return { userAgent: req.headers["user-agent"], ip: req.ip };
}

@Controller("auth")
export class AuthController {
  constructor(private auth: AuthService) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } }) // kayıt: dakikada 5
  @Post("register")
  register(@Body() dto: RegisterDto, @Req() req: Request) {
    return this.auth.register(dto, ctxOf(req));
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } }) // giriş: brute-force koruması
  @Post("login")
  login(@Body() dto: LoginDto, @Req() req: Request) {
    return this.auth.login(dto.email, dto.password, ctxOf(req));
  }

  @Public()
  @Post("refresh")
  refresh(@Body("refreshToken") refreshToken: string, @Req() req: Request) {
    return this.auth.refresh(refreshToken, ctxOf(req));
  }

  @Public()
  @Post("logout")
  logout(@Body("refreshToken") refreshToken: string) {
    return this.auth.logout(refreshToken);
  }

  @Get("me")
  me(@CurrentUser() user: AuthUser) {
    return this.auth.me(user.id);
  }
}
