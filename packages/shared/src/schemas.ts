/**
 * Ustam — paylaşılan zod doğrulama şemaları.
 * Backend DTO doğrulaması ve frontend form doğrulaması aynı kuralları kullanır.
 */
import { z } from "zod";
import { LOCALES } from "./enums";
import { PASSWORD, LISTING, OFFER } from "./constants";

export const localeSchema = z.enum(LOCALES);

export const emailSchema = z.string().trim().toLowerCase().email();

/** E.164 benzeri telefon (ülke kodu ile). */
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[1-9]\d{7,14}$/, "invalid_phone");

export const passwordSchema = z
  .string()
  .min(PASSWORD.MIN)
  .max(PASSWORD.MAX)
  .regex(PASSWORD.REGEX, "weak_password");

export const registerSchema = z.object({
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
  displayName: z.string().trim().min(2).max(80),
  locale: localeSchema.optional(),
  role: z.enum(["CUSTOMER", "PROVIDER", "COMPANY"]).default("CUSTOMER"),
  acceptTerms: z.literal(true),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const otpVerifySchema = z.object({
  channel: z.enum(["EMAIL", "SMS"]),
  purpose: z.enum(["VERIFY_EMAIL", "VERIFY_PHONE", "PASSWORD_RESET", "LOGIN_2FA"]),
  code: z.string().length(6).regex(/^\d+$/),
});
export type OtpVerifyInput = z.infer<typeof otpVerifySchema>;

export const requestOtpSchema = z.object({
  channel: z.enum(["EMAIL", "SMS"]),
  purpose: z.enum(["VERIFY_EMAIL", "VERIFY_PHONE", "PASSWORD_RESET", "LOGIN_2FA"]),
});
export type RequestOtpInput = z.infer<typeof requestOtpSchema>;

export const createListingSchema = z.object({
  title: z.string().trim().min(LISTING.TITLE_MIN).max(LISTING.TITLE_MAX),
  description: z
    .string()
    .trim()
    .min(LISTING.DESCRIPTION_MIN)
    .max(LISTING.DESCRIPTION_MAX),
  categoryId: z.string().uuid(),
  cityId: z.string().uuid(),
  districtId: z.string().uuid().optional(),
  urgency: z
    .enum(["FLEXIBLE", "WITHIN_WEEK", "URGENT", "EMERGENCY"])
    .default("FLEXIBLE"),
  budgetType: z.enum(["FIXED", "RANGE", "NEGOTIABLE"]).default("NEGOTIABLE"),
  budgetMin: z.number().nonnegative().optional(),
  budgetMax: z.number().nonnegative().optional(),
  currency: z.string().default("TRY"),
  photoIds: z.array(z.string().uuid()).max(LISTING.MAX_PHOTOS).default([]),
  locale: localeSchema.optional(),
});
export type CreateListingInput = z.infer<typeof createListingSchema>;

export const createOfferSchema = z.object({
  listingId: z.string().uuid(),
  priceAmount: z.number().positive(),
  currency: z.string().default("TRY"),
  message: z.string().trim().min(OFFER.MESSAGE_MIN).max(OFFER.MESSAGE_MAX),
  estimatedDays: z.number().int().positive().max(3650).optional(),
});
export type CreateOfferInput = z.infer<typeof createOfferSchema>;

export const createReviewSchema = z.object({
  listingId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(2000).optional(),
});
export type CreateReviewInput = z.infer<typeof createReviewSchema>;

export const paginationQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const searchListingsSchema = paginationQuerySchema.extend({
  q: z.string().trim().max(200).optional(),
  categoryId: z.string().uuid().optional(),
  cityId: z.string().uuid().optional(),
  districtId: z.string().uuid().optional(),
  urgency: z.enum(["FLEXIBLE", "WITHIN_WEEK", "URGENT", "EMERGENCY"]).optional(),
  minBudget: z.coerce.number().nonnegative().optional(),
  maxBudget: z.coerce.number().nonnegative().optional(),
  sort: z.enum(["recent", "budget_asc", "budget_desc", "urgent"]).default("recent"),
});
export type SearchListingsInput = z.infer<typeof searchListingsSchema>;
