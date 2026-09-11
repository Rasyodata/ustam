import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { UserRoleType } from "@ustam/shared";

export interface AuthUser {
  id: string;
  email: string;
  roles: UserRoleType[];
}

/** İstekteki doğrulanmış kullanıcıyı enjekte eder. */
export const CurrentUser = createParamDecorator(
  (data: keyof AuthUser | undefined, ctx: ExecutionContext): AuthUser | AuthUser[keyof AuthUser] => {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user as AuthUser;
    return data ? user?.[data] : user;
  },
);
