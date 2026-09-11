/**
 * Ustam — merkezi i18n sözlükleri.
 * Web (next-intl), admin ve mobil (i18next) bu dosyaları kullanır.
 * Backend (nestjs-i18n) aynı JSON'ları okuyabilir.
 */
import tr from "./locales/tr.json" assert { type: "json" };
import en from "./locales/en.json" assert { type: "json" };
import de from "./locales/de.json" assert { type: "json" };
import fr from "./locales/fr.json" assert { type: "json" };
import es from "./locales/es.json" assert { type: "json" };
import type { Locale } from "../enums.js";

/** TR referans sözlük tipi; diğer diller bununla uyumlu olmalı. */
export type MessageSchema = typeof tr;

const messages: Record<Locale, MessageSchema> = {
  tr,
  en: en as MessageSchema,
  de: de as MessageSchema,
  fr: fr as MessageSchema,
  es: es as MessageSchema,
};

export default messages;
