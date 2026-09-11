import { SetMetadata } from "@nestjs/common";

export const IS_PUBLIC_KEY = "isPublic";
/** Bir uç noktayı JWT guard'dan muaf tutar. */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
