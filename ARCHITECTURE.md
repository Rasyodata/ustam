# Ustam — Mimari Doküman

Bu belge, Ustam platformunun teknik mimarisini, veri modelini, güvenlik katmanlarını ve çok dilli altyapısını açıklar.

---

## 1. Genel Bakış

Ustam, **tek bir backend API** etrafında dönen çok istemcili (web + admin + iOS + Android) bir hizmet pazaryeridir. İki ana aktör vardır:

- **İlan Veren (Customer)** — bir iş için ilan/talep açar.
- **Hizmet Veren (Provider)** — ilanlara teklif verir. Bireysel usta, teknik servis, imalatçı veya inşaat şirketi olabilir.

Akış (armut.com mantığı):

```
İlan Veren ilan açar  ─▶  Sistem ilgili ustalara bildirir  ─▶  Ustalar teklif verir
      ▲                                                              │
      └──────────── mesajlaşır, teklifi kabul eder ◀────────────────┘
                                   │
                          iş tamamlanır ─▶ çift taraflı değerlendirme
```

---

## 2. Bileşenler

| Uygulama | Port | Teknoloji | Sorumluluk |
|----------|------|-----------|------------|
| `apps/api` | 4000 | NestJS | Tüm iş mantığı, REST + WebSocket, auth, DB erişimi |
| `apps/web` | 3000 | Next.js | Müşteri/usta web arayüzü (SSR + SEO + i18n) |
| `apps/admin` | 3001 | Next.js | Yönetim paneli (RBAC korumalı) |
| `apps/mobile` | — | Expo RN | iOS + Android uygulaması |

Destek servisleri (Docker): **PostgreSQL** (ana DB), **Redis** (cache/kuyruk/rate-limit), **Meilisearch** (arama), **MinIO** (dosya), **Mailhog** (dev e-posta).

---

## 3. Veri Modeli (özet)

Ayrıntılı şema: `apps/api/prisma/schema.prisma`

Ana varlıklar:

- **User** — temel hesap (email, phone, passwordHash, durum, dil). Roller `UserRole` üzerinden (çoktan-çoğa).
- **ProviderProfile** — hizmet verenler için işletme bilgisi, hizmet bölgeleri, kategoriler, doğrulama belgeleri.
- **Category** — hiyerarşik (parent/child), her biri `CategoryTranslation` ile 5 dilde.
- **Listing (İlan)** — ilan sahibinin talebi; kategori, konum, bütçe, medya, durum.
- **Offer (Teklif)** — bir ustanın bir ilana verdiği teklif; fiyat, mesaj, durum.
- **Conversation / Message** — ilan bazlı mesajlaşma.
- **Review** — iş sonrası çift taraflı değerlendirme + puan.
- **OtpCode** — SMS/e-posta doğrulama kodları.
- **RefreshToken / Session** — oturum yönetimi.
- **Notification** — bildirimler.
- **Location** — il / ilçe (Türkiye idari yapısı).
- **AuditLog** — admin işlemleri denetim kaydı.
- **Report** — moderasyon / şikayet.
- **Media** — yüklenen dosyalar (S3/MinIO referansı).

Çok dilli içerik, ayrı `*Translation` tablolarıyla tutulur (kategori adları, statik içerik). Kullanıcı tarafından üretilen serbest metin (ilan açıklaması) orijinal dilinde saklanır + isteğe bağlı otomatik çeviri alanı bırakılır.

---

## 4. Kimlik Doğrulama & Yetkilendirme

### 4.1 Kimlik (Authentication)
- **Kayıt**: email + şifre (argon2id ile hash) + telefon.
- **Doğrulama**: kayıt sonrası e-posta OTP **ve/veya** SMS OTP (`OtpCode`). Doğrulanmadan belirli işlemler kısıtlanır.
- **Giriş**: JWT **access token** (kısa ömürlü, ~15dk) + **refresh token** (uzun ömürlü, DB'de saklanır, iptal edilebilir).
- **Şifre sıfırlama**: tek kullanımlık token + e-posta.
- **Oturum**: `Session` / `RefreshToken` tablosu → cihaz bazlı oturum listesi, uzaktan çıkış.

### 4.2 Yetki (Authorization / RBAC)
Roller: `CUSTOMER`, `PROVIDER`, `COMPANY`, `MODERATOR`, `SUPPORT`, `ADMIN`, `SUPER_ADMIN`.

- `@Roles(...)` dekoratörü + `RolesGuard` ile endpoint koruması.
- İnce taneli izinler için `Permission` (ileride genişletilebilir).
- Admin panel endpoint'leri yalnız `MODERATOR+` rollerine açık; kritik işlemler (`SUPER_ADMIN`).

---

## 5. Güvenlik Katmanları

| Tehdit | Önlem |
|--------|-------|
| Brute-force / flood | Redis tabanlı **rate limiting** (global + login + OTP özel) |
| Şifre sızıntısı | **argon2id** hashing, pepper, şifre politikası |
| XSS | Çıktı encode, CSP header (helmet), input sanitization |
| CSRF | SameSite cookie + token; API token-based |
| SQL injection | Prisma parametreli sorgular |
| Veri sızıntısı | DTO whitelist (`class-validator`), response serialization |
| Yetkisiz erişim | JWT guard + RBAC guard + kaynak sahipliği kontrolü |
| Hassas log | Audit log (admin işlemleri), PII maskeleme |
| Dosya yükleme | MIME/boyut kontrolü, imzalı URL, AV taraması kancası |

OTP ve login için **özel rate limit** (ör. 5 deneme / 15 dk), hesap kilitleme ve şüpheli giriş bildirimi.

---

## 6. Çok Dilli Altyapı (i18n)

- **Arayüz (web/admin/mobile)**: `packages/shared/src/i18n` altında dil başına JSON sözlükler (`tr`, `en`, `de`, `fr`, `es`). Web/Admin `next-intl`, mobil `i18next` kullanır.
- **Backend mesajları** (hata, e-posta, SMS, bildirim şablonları): `nestjs-i18n` ile aynı 5 dil. İstek dili `Accept-Language` header veya kullanıcı tercihinden belirlenir.
- **Veritabanı içeriği**: kategoriler gibi sistem içeriği `*Translation` tablolarında; eksik çeviride varsayılan dile (TR) düşer.
- **Para/tarih/sayı biçimi**: `Intl` API ile yerelleştirilir.

Yeni dil eklemek = yeni locale kodu + sözlük dosyası + (gerekirse) `*Translation` kayıtları. Mimari 5 dille sınırlı değil, genişletilebilir.

---

## 7. Performans & Ölçeklenebilirlik

- **Sayfalama**: cursor tabanlı (büyük veri setlerinde offset yerine) — "veri sınırına takılmama" hedefi.
- **Önbellek**: Redis ile sık okunan veriler (kategoriler, popüler ilanlar).
- **Arama**: Meilisearch ile DB'den bağımsız, hızlı full-text.
- **Kuyruk**: SMS/e-posta/bildirim/çeviri işleri BullMQ ile asenkron.
- **Yatay ölçekleme**: API stateless (oturum Redis/DB'de) → birden çok instance çalıştırılabilir, load balancer arkasında.
- **DB indeksleri**: sık sorgulanan alanlarda (kategori, konum, durum, createdAt) indeks.

> Not: "Hız/veri sınırı olmaması" kod tarafında doğru mimariyle hedeflenir; gerçek kapasite seçilen sunucu/hosting altyapısına bağlıdır.

---

## 8. Dizin Yapısı (Backend)

```
apps/api/src/
├── main.ts                 # bootstrap (helmet, cors, validation, i18n)
├── app.module.ts
├── common/                 # guard, decorator, filter, interceptor, pipe
├── config/                 # ortam konfigürasyonu
├── prisma/                 # PrismaService
└── modules/
    ├── auth/               # kayıt, giriş, refresh, şifre
    ├── verification/       # SMS + e-posta OTP
    ├── users/              # profil, roller
    ├── providers/          # usta/firma profilleri
    ├── categories/         # kategori ağacı + çeviri
    ├── listings/           # ilanlar
    ├── offers/             # teklifler
    ├── messaging/          # konuşma + mesaj (WebSocket)
    ├── reviews/            # değerlendirme
    ├── search/             # Meilisearch entegrasyonu
    ├── notifications/      # bildirim
    ├── media/              # dosya yükleme
    ├── locations/          # il/ilçe
    └── admin/              # yönetim paneli uçları + audit
```

---

## 9. Sonraki Adımlar

Bkz. `README.md` yol haritası. İnşa sırası: veri modeli → auth/RBAC/OTP → kategori/ilan/teklif → arama/mesaj/değerlendirme → web → admin → mobil.
