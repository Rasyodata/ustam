import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UserRoleType } from "@ustam/shared";
import { ROLES_KEY } from "../decorators/roles.decorator";
import { AuthUser } from "../decorators/current-user.decorator";

/** @Roles(...) ile istenen rollerden en az birini şart koşar. */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<UserRoleType[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const user = context.switchToHttp().getRequest().user as AuthUser;
    const ok = user?.roles?.some((r) => required.includes(r));
    if (!ok) {
      throw new ForbiddenException({ code: "FORBIDDEN", message: "errors.forbidden" });
    }
    return true;
  }
}
