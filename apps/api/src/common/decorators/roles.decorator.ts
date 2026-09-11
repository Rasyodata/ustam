import { SetMetadata } from "@nestjs/common";
import { UserRoleType } from "@ustam/shared";

export const ROLES_KEY = "roles";
/** Erişim için gereken rollerden en az birini şart koşar. */
export const Roles = (...roles: UserRoleType[]) => SetMetadata(ROLES_KEY, roles);
