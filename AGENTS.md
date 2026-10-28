# CookFire — yapay zekâ müzik stüdyosu (mobil PWA + Capacitor 8 + Next.js 15 API + Firebase)

Yanıt dili: Türkçe. Hedef: iOS/Android mağaza uygulaması (appId `com.emircanbulut.cookfire`). Arayüzde ve mağaza metninde KIE/Suno adı geçmez (yalnız sunucu kodunda).

## Bağlam tasarrufu
- Önce bu haritaya bak, yalnız ilgili dosyayı aç; bilinmeyen yer → `Grep`, sonra `Read` offset/limit. Özellik ayrıntısı gerekiyorsa `docs/ozellikler.md`'nin yalnız o bölümü.
- Baştan sona okuma: `public/app.js` (~110 KB, uzun satırlar; içindekiler `grep -n "^// " public/app.js`), `app.css`, `i18n*.js`, `terms|privacy.html`.
- Hiç okuma: `package-lock.json`, `node_modules/`, `.next/`, `www/`, `ios/App/App/public/`, `android/app/src/main/assets/public/` (son üçü `public/` kopyası), `public/vendor/*`, görsel/font.
- Şema `lib/data/schema.ts`, sabitler `public/config/app.json` — koddan önce bunlar. Yalnız ilgili kontrolü çalıştır; `npm run build` gerekmedikçe yok.

## Çalışma tarzı (token koruma)
- İstenen değişikliği doğrudan yap; istenmeden kod incelemesi, analiz, refactor, “iyileştirme önerisi”, güvenlik taraması yapma.
- Alt ajan (Agent/Explore/workflow), plan modu, web araması yalnız kullanıcı isterse.
- Aynı dosyayı tekrar okuma; düzenledikten sonra doğrulamak için yeniden açma. Konuşmada bilinen bilgiyi yeniden araştırma.
- Doğrulama: yalnız değişen dosyaya `node --check` / `tsc`; tarayıcı önizleme, ekran görüntüsü, build yalnız istenirse ya da görsel değişiklik başka türlü doğrulanamıyorsa.
- Yanıtlar kısa: ne değişti + dosya bağlantısı; kodu ya da diff'i sohbete tekrar yazma, uzun özet yok.

## Harita
**İstemci `public/`** (düz JS, mobilde `www/`): `index.html` · `app.css` · `app.js` tüm arayüz (`costOf` ~77; Analiz/mashup `CH`, `chopRun`) · `fb.js` Firebase istemci (Apple/Google + misafir, 3 dinleyici) · `auth.js` giriş kapısı + profil · `i18n.js` (EN) + `i18n-langs.js` (DE/PT/JA) · `recorder.js` ses kaydı · `chop.js` Analiz kesici · `wave.js` dalga seçici · `exaudio.js` keşfet motoru · `credits.js` planlar · `docs.js` yasal alt pencere · `native.js` köprü `window.CR` · `env.js` · `promo.*` tanıtım videosu (yalnız admin) · `admin.*` panel (yalnız web) · `privacy|terms|support.html` + `legal.*` · abonelik yalnız iOS: `CR.purchase/restore/products` (@capgo/native-purchases)
**Sunucu** (Next.js yalnız API; sayfalar `next.config.ts` rewrite): `app/api/` `music/{generate,audio,tasks/[id],lyrics,write}` · `me` · `upload` · `media` · `persona` · `voice/phrase`→`voice` · `report` · `issues` · `billing/apple` (StoreKit 2 JWS → `lib/appleStore.ts` Apple kök zinciri; `iap/{originalTransactionId}` tek hesaba bağ → `startPlan`) · `account` (DELETE: hesap silme) · `callback` (KIE webhook) · `health` · `admin/*` — `lib/auth.ts` (`requireUser`/`requireAccount`, `HttpError`) · `lib/admin.ts` · `lib/kie.ts` + `kieInputBuilder.ts` + `kieErrors.ts` · `lib/results.ts` · `lib/webhook.ts` · `lib/validation.ts` (zod) · `lib/data/` (`schema` `config` `users` `tasks` `storage` `mirror` `extras` `media`) · `middleware.ts` CORS
**Altyapı**: `firestore.rules|indexes.json` · `storage.rules` · `apphosting.yaml` · `capacitor.config.ts` · `codemagic.yaml` (iOS → TestFlight) · `scripts/{build-www,seed,vendor,grant-admin}.mjs` · `assets/` `resources/` (simge)

## Kurallar
- Git: her şey doğrudan `main`; branch açılmaz.
- Sabit değer koda yazılmaz → `public/config/app.json` + `npm run db:seed`.
- Maliyet: istemci `costOf(op, model)` ↔ sunucu `getCost` aynı kural (`pricing.costs` + `pricing.modelCosts`); rozet = kullanıcı kredisi.
- Kredi yalnız sunucuda, transaction ile düşer/iade (bir kez). Misafir ve e-posta/şifre hesabı harcayamaz (yalnız Apple/Google). Teslim edilmiş görev iade edilmez; ücretli kredi yalnız abonelik, aylık sıfırlanır.
- Kaynak parçalı işlemler `taskId` + kendi `audioId`; ücretsiz uçlar `takeQuota` ile günlük sınırlı. Kullanıcı sesi yalnız `classifyMedia` onaylıysa.
- Servis hataları `kieErrors.ts` ile kısa Türkçe metne çevrilir; ham ileti/servis adı kullanıcıya gitmez.
- Anlık bildirim: `lib/push.ts` (`sendToUser`, `notifyTask` ← `lib/data/tasks.ts` COMPLETED/FAILED, tek sefer `tasks.notified`) · cihaz/tercih `users/{uid}.push` (`/api/me`) · metinler `config/app.json › notify.templates` (5 dil) · `notify.enabled` bayrağı · karar `decideSend` (tercih/sessiz saat/kampanya sınırı) · kredi azaldı `notifyLowCredit` (chargeCredits) · yenilendi (startPlan) · ödeme sorunu (apple-notify) · rozet `push.unread` (+ @capawesome/capacitor-badge, `markRead`) · öncelik/TTL/collapse `NOTIFY_TYPES` (urgent, ttlSec) + iOS kategori `STUDIO_READY`/`STUDIO_FAILED` (AppDelegate) · geri kazanım `app/api/cron/notify` (Cloud Scheduler saatlik, `CRON_SECRET`) → `pickReminder` (yerel 18–20, günde 1/haftada 2 `remindAt`, 3 açılmayan → 30 gün mola, %10 `isControlGroup`; unplayed · credits_reset · gift_reminder/comeback yalnız `prefs.marketing`) · admin duyuru `app/api/admin/notify` (`admin.js` önizleme/test/A-B gönderim) · ölçüm `config/stats` (`recordPushStat`, `markOpened` push/inbox) · istemci `CR.push` (native.js) + `pushAsk`/`pushRoute`/`renderNotif` Profil › Bildirimler (app.js) · ses `cookfire_ready.wav` (iOS paket, Android res/raw).
- Beat = `instrumental: true` + `catalog.beatTags`. Sesi olmayan parça çalınmaz.
- Yeni arayüz metni Türkçe; EN `i18n.js`, DE/PT/JA `i18n-langs.js` (dördü birlikte); kullanıcı içeriğine `data-noi18n`.
- Tasarım: siyah/fildişi + altın #F5B83D, alev turuncusu #FF7A2F, kehribar, koyu kırmızı; başlık Grenze Gotisch; mor/mavi yok.
- Yapay zekâ veri paylaşımı izni (Apple 5.1.2): `users/{uid}.aiConsent` (`/api/me` `aiConsent: true|false`) yoksa `chargeCredits` / `requireAiConsent` → `AiConsentRequired` (403 `aiConsent`); istemci `jpost` izin penceresini (`aiConsentAsk`) açar, izin verilirse isteği yineler · Profil › Yapay zekâ veri paylaşımı (`renderAi`). Abonelik başka hesaba bağlıysa taşınır (`billing/apple`, eski plan `endPlan("transfer")`, aynı dönem kredisi bir kez).
- Yasal metin değişirse sayfa sürümü + `legal.version` birlikte. Güncel sürüm kabul edilmeden harcama `TermsRequired`.
- Yeni koleksiyon/dinleyici yerine mevcut belgeye alan ekle. Uzak kod/font yok (çevrimdışı paket). Webhook HMAC production'da zorunlu.
- Gizli: `.env`, `firebase-service-account.json` — okuma, commit etme.

## Doğrulama
- Dev `npm run dev` (:3000) · TS: `npx tsc --noEmit` · JS: `node --check public/<dosya>.js`
- `npm run db:seed` · `npm run admin:grant -- e-posta` · Mobil: `npm run mobile:build` → `mobile:ios|android`
