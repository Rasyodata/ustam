/** Ustam — paylaşılan domain & API tipleri (istemci/sunucu ortak). */

import type {
  Locale,
  UserRoleType,
  UserStatus,
  ProviderKind,
  ListingStatus,
  UrgencyLevel,
  OfferStatus,
  BudgetType,
  NotificationType,
  ReviewDirection,
  MediaType,
} from "./enums.js";

/** Cursor tabanlı sayfalı yanıt. */
export interface Paginated<T> {
  items: T[];
  nextCursor: string | null;
  total?: number;
}

/** Standart API hata gövdesi. */
export interface ApiError {
  statusCode: number;
  code: string; // makine-okur kod, ör. "AUTH_INVALID_CREDENTIALS"
  message: string; // kullanıcıya gösterilebilir (i18n çözülmüş)
  details?: Record<string, unknown>;
}

export interface Money {
  amount: number; // minor birim değil, ondalık (ör. 1500.50)
  currency: string; // "TRY"
}

export interface LocationRef {
  cityId: string;
  cityName: string;
  districtId?: string;
  districtName?: string;
}

export interface MediaRef {
  id: string;
  type: MediaType;
  url: string;
  width?: number;
  height?: number;
}

/** Güvenli kullanıcı görünümü (şifre vb. yok). */
export interface PublicUser {
  id: string;
  displayName: string;
  avatarUrl?: string;
  roles: UserRoleType[];
  locale: Locale;
  emailVerified: boolean;
  phoneVerified: boolean;
  status: UserStatus;
  createdAt: string;
}

export interface ProviderProfileView {
  id: string;
  userId: string;
  kind: ProviderKind;
  businessName: string;
  bio?: string;
  avgRating: number;
  reviewCount: number;
  completedJobs: number;
  verified: boolean;
  serviceCityIds: string[];
  categoryIds: string[];
}

export interface CategoryView {
  id: string;
  slug: string;
  parentId: string | null;
  name: string; // istek diline çözülmüş
  icon?: string;
  childrenCount: number;
}

export interface ListingView {
  id: string;
  title: string;
  description: string;
  status: ListingStatus;
  urgency: UrgencyLevel;
  category: CategoryView;
  location: LocationRef;
  budgetType: BudgetType;
  budgetMin?: number;
  budgetMax?: number;
  currency: string;
  photos: MediaRef[];
  offerCount: number;
  owner: PublicUser;
  createdAt: string;
  publishedAt?: string;
}

export interface OfferView {
  id: string;
  listingId: string;
  provider: ProviderProfileView;
  price: Money;
  message: string;
  status: OfferStatus;
  estimatedDays?: number;
  createdAt: string;
}

export interface ReviewView {
  id: string;
  direction: ReviewDirection;
  rating: number; // 1-5
  comment?: string;
  authorName: string;
  createdAt: string;
}

export interface NotificationView {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  readAt: string | null;
  data?: Record<string, unknown>;
  createdAt: string;
}

/** Auth yanıtı. */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // saniye
}

export interface AuthResult {
  user: PublicUser;
  tokens: AuthTokens;
}
