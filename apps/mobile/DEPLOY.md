# Ustam Mobil — Yayın Rehberi (iOS + Android)

Expo + EAS Build ile mağazalara çıkış. Tüm adımlar senin geliştirici hesaplarını gerektirir (ben yayınlayamam).

## Ön koşullar
- [Expo hesabı](https://expo.dev) + `npm i -g eas-cli` → `eas login`
- **iOS**: Apple Developer Program üyeliği ($99/yıl)
- **Android**: Google Play Console hesabı ($25 tek sefer)

## 1) Projeyi bağla
```bash
cd apps/mobile
eas init            # app.json → extra.eas.projectId otomatik dolar
```
> `app.json` içindeki `projectId` şu an placeholder (`0000...`). `eas init` gerçek değeri yazar.

## 2) Build profilleri (`eas.json`)
- **development** — geliştirme istemcisi (cihazda canlı geliştirme)
- **preview** — iç dağıtım (APK / TestFlight öncesi test)
- **production** — mağaza sürümü (versiyon otomatik artar)

`EXPO_PUBLIC_API_URL` değerlerini kendi canlı API adresinle güncelle (`https://api.ustam.app`).

## 3) Build al
```bash
eas build --profile preview --platform android   # test APK
eas build --profile production --platform ios     # App Store
eas build --profile production --platform android # Play Store (aab)
```

## 4) Push bildirim
- Kod hazır: `src/push.ts` izin ister, Expo push token alır, `/push/register`'a kaydeder.
- Backend `PushService` Expo Push API'ye gönderir (yeni teklif, teklif kabul, yeni mesaj).
- **iOS için**: EAS otomatik APNs anahtarı yönetir (`eas credentials`).
- **Android için**: FCM sunucu anahtarını Expo'ya ekle (`eas credentials`).

## 5) Mağazaya gönder
```bash
eas submit --profile production --platform ios
eas submit --profile production --platform android
```

## Notlar
- İkon/splash görselleri `assets/` altına eklenmeli (şu an renk placeholder).
- Gizlilik politikası + kullanım koşulu sayfaları mağaza reddini önlemek için şart.
- Derin bağlantı şeması: `ustam://` (app.json `scheme`).
