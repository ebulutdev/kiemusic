# CookFire · Yapılacaklar ve Yayın Durumu (Claude / IDE Ortak Notu)

Son güncelleme: **19 Ekim 2026**.

---

## 1. Tamamlananlar (Kod + Bulut Panelleri)

### Kod & Mimari (`c66c1b2`)
- [x] **Paket kimliği & hedef:** `com.emircanbulut.cookfire`, Team ID `Y48QM468RF`, yalnız iPhone (`TARGETED_DEVICE_FAMILY = 1`).
- [x] **Yerel giriş (iOS & Android):** `@capacitor-firebase/authentication@8.5.2` (`skipNativeAuth: true`) ile Apple ve Google yerel girişi → Firebase Web SDK (`indexedDBLocalPersistence`) ve misafir hesabı bağlama (`public/fb.js`, `public/auth.js`). E-posta/şifre girişi kaldırıldı.
- [x] **iOS yapılandırması:** `ios/App/App/GoogleService-Info.plist` Xcode `Resources` içinde; `REVERSED_CLIENT_ID` URL şeması `Info.plist`'te; `Sign in with Apple` `App.entitlements` içinde tanımlı.
- [x] **Mağaza içi abonelik (StoreKit 2 + sunucu doğrulaması):** `@capgo/native-purchases` (`public/native.js` → `CR.products`, `CR.purchase`, `CR.restore`, açılışta `sendActive`) + sunucuda Apple Root CA - G3 zinciriyle JWS doğrulayan `lib/appleStore.ts` ve `app/api/billing/apple/route.ts` (`iap/{originalTransactionId}` + `startPlan`).
- [x] **Uygulama içi hesap silme (Apple 5.1.1(v)):** Profil › "Hesabımı sil" + `DELETE /api/account`.
- [x] **Destek ve yasal sayfalar:** `/support` (`public/support.html`), `/privacy`, `/terms` (`v2026-10-18`, iletişim `emircanbulut04@gmail.com`).
- [x] **Codemagic yapılandırması:** `codemagic.yaml` (`APP_STORE_APPLE_ID: 6824189190`, entegrasyon adı: `CookFire ASC`).

### Apple Developer (`developer.apple.com`) & Firebase Console (`rapper-fcc44`)
- [x] **Apple App Store Small Business Program (%15 komisyon):** `Emir Bulut` (`Y48QM468RF`) için başvuru tamamlandı ve Apple'a gönderildi (`19 Ekim 2026`).
- [x] **Ömür boyu tek seferlik 12 başlangıç kredisi (2 şarkı):** `startCredits` `28`'den `12`'ye çekildi (`public/config/app.json` + canlı Firestore `config/app` `version: 19`). Sunucuda (`lib/auth.ts`, `lib/data/users.ts`) Apple/Google kimliğinin SHA-256 özeti (`iap/gift_<hash>`) ile ömür boyu 1 kez verilecek şekilde kilitlendi (hesap silip yeniden açsa bile 2. kez hediye kredi verilmez). `public/credits.js` içinde ücretsiz kullanıcıdaki yanıltıcı `"30 gün sonra sıfırlanır"` ibaresi kaldırıldı.
- [x] **Apple App ID:** `com.emircanbulut.cookfire` (`24RT7CH9BJ`) — *In-App Purchase* ve *Sign In with Apple* aktif.
- [x] **Apple Services ID & Key:** `com.emircanbulut.cookfire.signin` (`SLC9HW86AL`) ve Sign in with Apple anahtarı (`7F5GD4VWBF`) oluşturuldu ve Firebase Auth › Apple sağlayıcısına girildi (**Enabled**).
- [x] **Firebase Auth & Uygulamalar:** `CookFire iOS` (`1:807604270953:ios:7c2abe2aed7aa43f17aff8`) ve `CookFire Android` eklendi; eski `cookrapper` uygulamaları silindi; Email/Password kapatıldı.
- [x] **Canlı Sunucu & Veritabanı:** Firestore `config/app` (`version: 19`, `startCredits: 12`, `max_monthly`: 1425 kredi / ₺799) güncellendi; App Hosting `kiemusic` üzerinde yayında.

### App Store Connect (`6824189190` — CookFire)
- [x] **Paid Apps Agreement, Banka & Vergi:** Active (`Business` altında tüm sözleşme, banka ve W-8BEN formları aktif).
- [x] **App Privacy:** Published (6 veri tipi ve `/privacy` adresi yayında).
- [x] **Uygulama Metinleri:** Alt başlık, açıklama (`/terms` ve `/privacy` bağlantılı), anahtar kelimeler, `/support` URL'si, yaş derecelendirmesi (`9+`) dolduruldu.
- [x] **4 Abonelik Ürünü (`CookFire Planları` — Group ID `22490216`):**
  - `starter_monthly` (`6824191274` — ₺99,99) — **Yeni 12 kredilik Review Screenshot yüklendi ve kaydedildi** (`19 Ekim 2026`).
  - `plus_monthly` (`6824191573` — ₺249,99) — **Yeni 12 kredilik Review Screenshot yüklendi ve kaydedildi** (`19 Ekim 2026`).
  - `pro_monthly` (`6824191933` — ₺499,99) — **Yeni 12 kredilik Review Screenshot yüklendi ve kaydedildi** (`19 Ekim 2026`).
  - `max_monthly` (`6824192136` — ₺799,99) — **Yeni 12 kredilik Review Screenshot yüklendi ve kaydedildi** (`19 Ekim 2026`).
- [x] **1290×2796 px Özgün Ekran Görüntüleri (19 Ekim 2026):**
  Uygulamanın kendi gömülü fontları (`Grenze Gotisch`, `Bricolage Grotesque`, `Geist`) ve özgün Türkçe stüdyo arayüzüyle üretilip proje kök dizinine kaydedildi:
  - `iap-review-screenshot.png` (iOS abonelik/kredi penceresi — 4 abonelik ürününe yüklendi)
  - `appstore-1-ozel-studyo.png` (Özel stüdyo, Türkçe söz ve gelişmiş kontroller)
  - `appstore-2-analiz-mashup.png` (Analiz sekmesi, çift kanal vokal+müzik ritim/kesit kesici)
  - `appstore-3-sesten-kayit.png` (Sesten sekmesi, canlı mikrofon 48 kHz kayıt ve cover/uzat)
  - `appstore-4-kutuphane.png` (Kütüphane ve mini oynatıcı)

---

## 2. iOS 1.0 Yayını İçin Kalan Adımlar (Sıradaki)

- [ ] **1. Apple Developer Sözleşme Onayı (Blocker):**
  `developer.apple.com/account` üst bandındaki güncellenmiş **Apple Developer Program License Agreement** (ve App Store Connect › Business altındaki güncellenmiş **Free Apps Agreement**) onaylanmalı.
- [ ] **2. App Store Connect `1.0 Prepare for Submission` Sayfası Eksikleri:**
  - **Previews and Screenshots:** Proje kökündeki `appstore-1-ozel-studyo.png` .. `appstore-4-kutuphane.png` (`1290×2796 px`) görsellerini `iPhone 6.9" / 6.7" Display` alanına yükle.
  - **In-App Purchases and Subscriptions:** 4 abonelik ürününü (`starter_monthly`, `plus_monthly`, `pro_monthly`, `max_monthly`) sürüm `1.0`'a bağla.
  - **App Review Information:** İletişim bilgilerini (Ad, Soyad, Telefon, E-posta) doldur; `Sign-in required` kutusunun işaretini kaldır (veya inceleme notuna Apple/Google ile girişte tek seferlik 12 başlangıç kredisi tanımlandığını yaz).
- [ ] **3. Codemagic → TestFlight İlk Derleme (IPA):**
  - App Store Connect › *Users and Access › Integrations › App Store Connect API* altındaki `Codemagic CookFire` (`C7JG4MPP93`, Issuer ID `29969abb-c525-4b39-b4ea-f60072964e56`) `.p8` anahtarını indir.
  - Codemagic'te *Team settings › Integrations › Developer Portal* altına **`CookFire ASC`** adıyla ekle ve `ios-testflight` iş akışını başlat.
- [ ] **4. TestFlight Cihaz Testi ve Gönderim (`Add for Review`):**
  - iPhone'da TestFlight derlemesini indirip Apple/Google girişi, Sandbox abonelik satın alma, mikrofon kaydı ve hesap silmeyi doğrula.
  - `1.0 Prepare for Submission` › **Build** bölümünden derlemeyi seçip **Add for Review**'a bas.
- [ ] **5. Apple Small Business Program (%15 Komisyon) Başvuru Sonucunu Kontrol Et:**
  - 19 Ekim 2026'da `developer.apple.com/app-store/small-business-program/enroll/` üzerinden **`Emir Bulut` (`Y48QM468RF` · `emirbulutt1616@icloud.com`)** hesabı için tüm ortaklık/gelir beyanları doldurulup **Submit** edildi ve Apple'dan resmi başvuru alındı onayı (*"Thank you for your submission..."*) alındı.
  - E-posta (`emirbulutt1616@icloud.com`) ve App Store Connect › *Business* üzerinden %15 komisyon onayının aktifleştiğini kontrol et.

---

## 3. Kod Tarafında İsteğe Bağlı İyileştirmeler (Yayını Engellemez)

- [ ] **Apple ilk giriş `displayName` kaydı (`public/fb.js`):** `skipNativeAuth: true` nedeniyle Apple'ın yalnız ilk girişte verdiği `fullName` bilgisi Firebase profilinde `null` kalıyor (profilde yedek olarak e-posta ön eki veya `"Sanatçı"` görünüyor).
- [ ] **Ses yükleme günlük kotası (`/api/upload`):** `limits.upload` + `takeQuota` eklenmesi.
- [ ] **Android yayın hazırlığı:** Yayın keystore SHA-1 parmak izinin Firebase'e eklenmesi ve Google Play Billing bağlantısı.
