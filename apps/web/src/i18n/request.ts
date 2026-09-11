import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import messages from "@ustam/shared/i18n";
import type { Locale } from "@ustam/shared";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = (await requestLocale) as Locale | undefined;
  if (!locale || !routing.locales.includes(locale)) {
    locale = routing.defaultLocale;
  }
  return { locale, messages: messages[locale] };
});
