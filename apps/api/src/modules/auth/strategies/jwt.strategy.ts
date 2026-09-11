import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { UserRoleType } from "@ustam/shared";
import { AuthUser } from "../../../common/decorators/current-user.decorator";

export interface JwtPayload {
  sub: string;
  email: string;
  roles: UserRoleType[];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>("jwt.accessSecret")!,
    });
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    return { id: payload.sub, email: payload.email, roles: payload.roles };
  }
}
