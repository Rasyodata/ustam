# Ustam — İşini Ustasına Bırak 🛠️

**Ustam**, ev kullanıcılarından inşaat şirketlerine kadar herkesin; küçük/büyük tamirat, imalat & taahhüt ve teknik servis işleri için **ilan** açıp, usta/teknik servis/imalatçılardan **teklif** aldığı çok dilli bir hizmet pazaryeridir. (Armut.com mantığı.)

> **Durum:** Kod tabanı / mimari iskelet. Çalıştırmak için aşağıdaki "Kurulum" adımları gerekir (Node.js + Docker).

---

## ✨ Özellikler (hedef kapsam)

- **İki taraflı pazaryeri**
  - **İlan veren** (ev kullanıcısı, şirket): talep/ilan açar — "Mutfak musluğum damlatıyor", "3 katlı binaya çatı imalatı" vb.
  - **Hizmet veren** (usta, teknik servis, imalatçı, inşaat firması): ilanlara teklif verir.
- **Kategori ağacı** (hiyerarşik): Tesisat → Musluk tamiri; İnşaat → Demir işleri, Çatı; Teknik Servis → Beyaz eşya vb. — tamamı 5 dilde.
- **Gelişmiş arama & filtreleme**: kategori, konum (il/ilçe), bütçe, puan, doğrulanmış usta, anahtar kelime (full-text).
- **Teklif & mesajlaşma**: ilan sahibi ile hizmet veren arasında gerçek zamanlı yazışma.
- **Değerlendirme & puanlama**: iş sonrası çift taraflı yorum.
- **Güvenli kimlik doğrulama**: e-posta + şifre, JWT access/refresh, **SMS + e-posta OTP doğrulama**, şifre sıfırlama, oturum yönetimi.
- **Rol bazlı yetkilendirme (RBAC)**: `CUSTOMER`, `PROVIDER`, `COMPANY`, `MODERATOR`, `SUPPORT`, `ADMIN`, `SUPER_ADMIN`.
- **Gelişmiş yönetim paneli**: kullanıcı/ilan/teklif/kategori yönetimi, moderasyon, denetim kaydı (audit log), istatistikler.
- **5 dil desteği** (🇹🇷 TR · 🇬🇧 EN · 🇩🇪 DE · 🇫🇷 FR · 🇪🇸 ES): tüm arayüzler + içerik + e-posta/SMS şablonları.
- **Güvenlik katmanları**: rate limiting, helmet, input validation, şifre hashing (argon2), CSRF/XSS önlemleri, audit log, RBAC guard'ları.

---

## 🏗️ Mimari (Monorepo)

```
ustam/
├── apps/
│   ├── api/        → Backend API (NestJS + Prisma + PostgreSQL + Redis)
│   ├── web/        → Müşteri web sitesi (Next.js)
│   ├── admin/      → Yönetim paneli (Next.js)
│   └── mobile/     → iOS + Android uygulaması (React Native / Expo)
├── packages/
│   ├── shared/     → Ortak tipler, sabitler, i18n sözlükleri, doğrulama şemaları
│   └── config/     → Ortak tsconfig / eslint / prettier ayarları
├── docker-compose.yml  → PostgreSQL, Redis, Meilisearch, MinIO, Mailhog
└── ...
```

Tüm platformlar **tek bir backend API**'yi kullanır. Tipler ve i18n sözlükleri `packages/shared` üzerinden paylaşılır → web, mobil ve admin arasında tutarlılık.

Ayrıntılı mimari için: [`ARCHITECTURE.md`](./ARCHITECTURE.md)

---

## 🧰 Teknoloji yığını

| Katman | Teknoloji | Neden |
|--------|-----------|-------|
| Backend | **NestJS** (TypeScript) | Modüler, kurumsal, test edilebilir |
| ORM / DB | **Prisma + PostgreSQL** | Tip güvenli, migration yönetimi, güçlü ilişkiler |
| Cache / Kuyruk | **Redis + BullMQ** | Oturum, rate-limit, SMS/mail kuyruğu, bildirim |
| Arama | **Meilisearch** | Hızlı, typo-toleranslı, çok dilli full-text arama |
| Depolama | **S3 uyumlu (MinIO)** | İlan fotoğrafları, belgeler |
| Gerçek zamanlı | **Socket.IO** | Teklif & mesaj bildirimleri |
| Web / Admin | **Next.js + Tailwind + shadcn/ui + next-intl** | SSR, SEO, çok dil |
| Mobil | **React Native (Expo)** | Tek kod → iOS + Android |
| Kimlik | **JWT (access+refresh) + argon2 + OTP** | Güvenli, ölçeklenebilir |

---

## 🚀 Kurulum (çalıştırma)

> Ön koşullar: **Node.js ≥ 20**, **pnpm ≥ 9**, **Docker** (PostgreSQL/Redis vb. için).

```bash
# 1) Bağımlılıklar
pnpm install

# 2) Altyapı servislerini başlat (Postgres, Redis, Meilisearch, MinIO, Mailhog)
docker compose up -d

# 3) Ortam değişkenleri
cp .env.example .env        # değerleri doldurun

# 4) Veritabanı şeması + örnek veri
pnpm --filter @ustam/api prisma:migrate
pnpm --filter @ustam/api prisma:seed

# 5) Hepsini geliştirme modunda çalıştır
pnpm dev
# → API:    http://localhost:4000
# → Web:    http://localhost:3000
# → Admin:  http://localhost:3001
# → Mobile: Expo Dev Tools
```

---

## 📦 Geliştirme durumu (yol haritası)

- [x] Monorepo iskeleti + altyapı (Docker, env, config)
- [x] Paylaşılan tipler + 5 dilli i18n altyapısı (130 anahtar × 5 dil)
- [x] Veritabanı modeli (Prisma şeması — tam domain)
- [x] Backend: auth + RBAC + OTP (SMS + e-posta) doğrulama
- [x] Backend: kategori / ilan / teklif / arama / değerlendirme / bildirim / konum / admin
- [x] Web: çok dilli müşteri arayüzü (Next.js + next-intl)
- [x] Admin panel (Next.js, RBAC korumalı — istatistik, moderasyon, audit)
- [x] Mobil uygulama (Expo RN, iOS + Android — i18next ile 5 dil)
- [x] Tarayıcıda açılan interaktif demo: `demo/ustam-demo.html`

- [x] Gerçek zamanlı mesajlaşma (Socket.IO gateway + REST) — `messaging`
- [x] Meilisearch arama servisi + ilan indeksleme (hata-toleranslı) — `search`
- [x] Dosya yükleme (MinIO/S3 imzalı PUT URL, MIME/boyut kontrolü) — `media`
- [x] Kullanıcı/Usta profil modülü — `users`
- [x] Genişletilmiş seed (alt kategoriler, il/ilçe, demo kullanıcı/ilan/teklif)
- [x] Kök araçlar: prettier, editorconfig, nvmrc, eslint, GitHub Actions CI

- [x] E2E testler (Jest + supertest) + birim testler + CI
- [x] Push bildirim (Expo) — teklif/mesaj olaylarında
- [x] App Store / Play Store yayın hattı (EAS Build) — bkz. `apps/mobile/DEPLOY.md`
- [x] Akıllı eşleştirme: ilan açılınca uygun ustalara otomatik bildirim

- [x] Ödeme/taahhüt akışı (escrow: emanet→aktar→iade, %10 komisyon, iyzico/mock soyutlaması)

### Henüz yapılacaklar (sonraki iterasyonlar)
- [ ] Dosya yükleme için görsel küçük resim (thumbnail) + AV taraması kancası
- [ ] Gerçek ödeme sağlayıcı entegrasyonu (iyzico 3D Secure + webhook)
- [ ] İkon/splash görselleri ve mağaza materyalleri

> ⚠️ Çalıştırmak için `node` ve `docker` kurulu olmalı (bu ortamda yoktu). Diski açtıktan sonra "Kurulum" adımlarını izle.

---

## 📝 Lisans & marka

"Ustam" çalışma adıdır; ticari kullanım öncesi **marka tescil kontrolü** önerilir.
