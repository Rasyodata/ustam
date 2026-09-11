import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Tüm yollar, API/_next/statik dosyalar hariç
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
