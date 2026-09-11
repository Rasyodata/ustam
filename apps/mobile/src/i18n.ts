import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { getLocales } from "expo-localization";
import messages from "@ustam/shared/i18n";
import { DEFAULT_LOCALE, LOCALES, type Locale } from "@ustam/shared";

function deviceLocale(): Locale {
  try {
    const code = getLocales()[0]?.languageCode as Locale | undefined;
    return code && LOCALES.includes(code) ? code : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}

i18n.use(initReactI18next).init({
  resources: Object.fromEntries(
    LOCALES.map((l) => [l, { translation: messages[l] }]),
  ),
  lng: deviceLocale(),
  fallbackLng: DEFAULT_LOCALE,
  interpolation: { escapeValue: false },
});

export default i18n;
