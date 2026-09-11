/**
 * Ustam — paylaşılan enum'lar.
 * Backend (Prisma), web, admin ve mobil bu tek kaynağı kullanır.
 */

/** Desteklenen diller. Yeni dil = buraya kod + i18n sözlüğü ekle. */
export const LOCALES = ["tr", "en", "de", "fr", "es"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "tr";

/** Sağdan-sola yazılan diller (genişletilebilir; şu an yok). */
export const RTL_LOCALES: Locale[] = [];

/** Kullanıcı rolleri (RBAC). */
export enum UserRoleType {
  CUSTOMER = "CUSTOMER", // ilan veren / ev kullanıcısı
  PROVIDER = "PROVIDER", // usta / teknik servis / imalatçı
  COMPANY = "COMPANY", // şirket hesabı
  MODERATOR = "MODERATOR", // içerik moderasyonu
  SUPPORT = "SUPPORT", // destek ekibi
  ADMIN = "ADMIN", // yönetici
  SUPER_ADMIN = "SUPER_ADMIN", // tam yetki
}

/** Panel erişimi olan roller. */
export const STAFF_ROLES: UserRoleType[] = [
  UserRoleType.MODERATOR,
  UserRoleType.SUPPORT,
  UserRoleType.ADMIN,
  UserRoleType.SUPER_ADMIN,
];

/** Hesap durumu. */
export enum UserStatus {
  PENDING = "PENDING", // doğrulama bekliyor
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED", // askıya alınmış
  BANNED = "BANNED",
  DELETED = "DELETED",
}

/** Hizmet veren türü. */
export enum ProviderKind {
  INDIVIDUAL = "INDIVIDUAL", // bireysel usta
  TECHNICAL_SERVICE = "TECHNICAL_SERVICE", // teknik servis
  MANUFACTURER = "MANUFACTURER", // imalatçı
  CONTRACTOR = "CONTRACTOR", // inşaat / taahhüt firması
}

/** İlan (talep) durumu. */
export enum ListingStatus {
  DRAFT = "DRAFT",
  PENDING_REVIEW = "PENDING_REVIEW", // moderasyon
  PUBLISHED = "PUBLISHED",
  IN_PROGRESS = "IN_PROGRESS", // teklif kabul edildi, iş sürüyor
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  EXPIRED = "EXPIRED",
  REJECTED = "REJECTED", // moderasyon reddi
}

/** Aciliyet. */
export enum UrgencyLevel {
  FLEXIBLE = "FLEXIBLE",
  WITHIN_WEEK = "WITHIN_WEEK",
  URGENT = "URGENT", // acil
  EMERGENCY = "EMERGENCY", // çok acil
}

/** Teklif durumu. */
export enum OfferStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  WITHDRAWN = "WITHDRAWN", // usta geri çekti
  EXPIRED = "EXPIRED",
}

/** İş yeri tercihi. */
export enum BudgetType {
  FIXED = "FIXED", // sabit bütçe
  RANGE = "RANGE", // aralık
  NEGOTIABLE = "NEGOTIABLE", // görüşülür
}

/** OTP kanalı. */
export enum OtpChannel {
  EMAIL = "EMAIL",
  SMS = "SMS",
}

/** OTP amacı. */
export enum OtpPurpose {
  VERIFY_EMAIL = "VERIFY_EMAIL",
  VERIFY_PHONE = "VERIFY_PHONE",
  PASSWORD_RESET = "PASSWORD_RESET",
  LOGIN_2FA = "LOGIN_2FA",
}

/** Bildirim türleri. */
export enum NotificationType {
  NEW_OFFER = "NEW_OFFER",
  OFFER_ACCEPTED = "OFFER_ACCEPTED",
  OFFER_REJECTED = "OFFER_REJECTED",
  NEW_MESSAGE = "NEW_MESSAGE",
  LISTING_MATCH = "LISTING_MATCH", // ustaya uygun ilan
  REVIEW_RECEIVED = "REVIEW_RECEIVED",
  SYSTEM = "SYSTEM",
}

/** Değerlendirme yönü. */
export enum ReviewDirection {
  CUSTOMER_TO_PROVIDER = "CUSTOMER_TO_PROVIDER",
  PROVIDER_TO_CUSTOMER = "PROVIDER_TO_CUSTOMER",
}

/** Şikayet/rapor hedefi. */
export enum ReportTargetType {
  USER = "USER",
  LISTING = "LISTING",
  OFFER = "OFFER",
  MESSAGE = "MESSAGE",
  REVIEW = "REVIEW",
}

/** Medya türü. */
export enum MediaType {
  IMAGE = "IMAGE",
  DOCUMENT = "DOCUMENT",
  VIDEO = "VIDEO",
}
