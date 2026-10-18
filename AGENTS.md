# CookFire — yapay zekâ müzik stüdyosu (mobil PWA + Capacitor 8 + Next.js 15 API + Firebase)

Yanıt dili: Türkçe. Hedef: iOS/Android mağaza uygulaması (`ios/`, `android/`; appId `com.fetsangrup.cookrapper`). Arayüzde ve mağaza metninde KIE/Suno adı geçmez (yalnız sunucu kodunda).

## Bağlam tasarrufu (her oturumda uy)
- Projeyi tarama: önce aşağıdaki haritaya bak, sonra yalnız ilgili dosyayı aç. Bilinmeyen yer → `Grep`, ardından `Read` ile yalnız o satır aralığı (offset/limit).
- Büyük dosyaları baştan sona okuma: `public/app.js` (~110 KB, 1080 satır, satırlar çok uzun), `app.css` (~80 KB), `i18n.js` (~30 KB sözlük), `terms.html`/`privacy.html` (~60 KB). `app.js` bölümleri `// …` açıklama satırlarıyla başlar → `grep -n "^// " public/app.js` ile içindekiler çıkar.
- Okuma: `package-lock.json`, `node_modules/`, `.next/`, `www/`, `ios/App/App/public/`, `android/app/src/main/assets/public/` (son üçü `public/` kopyası), `public/vendor/firebase.js` (paketlenmiş, düzenlenmez), görseller/fontlar.
- Firestore şeması için önce `lib/data/schema.ts`; sabitler için `public/config/app.json` — kodda aramadan önce bunlara bak.
- Değişiklik sonrası yalnız ilgili kontrolü çalıştır (aşağıda “Doğrulama”); `npm run build` gerekmedikçe çalıştırma.

## Harita
**İstemci (`public/`, framework yok, düz JS; mobil pakete `www/` olarak gömülür)**
- `index.html` iskelet · `app.css` stil · `app.js` tüm arayüz mantığı (kütüphane, oluştur, stüdyo araçları, çalar, görev takibi; `costOf` satır ~77)
- `fb.js` Firebase istemci: giriş (yalnız Apple / Google + misafir; misafir→hesap bağlama; mobilde telefonun yerel girişi `@capacitor-firebase/authentication`, skipNativeAuth → kimlik bilgisiyle JS katmanında oturum), 3 dinleyici (config/app, users/{uid}, users/{uid}/tracks), diff+batch yazım
- `auth.js` + `auth.css` giriş kapısı (Apple / Google + misafir; e-posta / şifre girişi yok — sağlayıcı e-postayı doğrulamış olur) ve profil hesap kartı
- `i18n.js` + `i18n-langs.js` 5 dil (TR, EN, DE, PT, JA): arayüz Türkçe yazılır; diğer dillerde metin düğümleri + placeholder/aria-label/title sözlükten çevrilir (`window.I18N.t/has/loc`), EN sözlüğü i18n.js'te, DE/PT/JA paketleri i18n-langs.js'te (anahtar = Türkçe metin; eksik metin İngilizceye düşer); `localStorage.sf_lang`. Kullanıcı içeriği `data-noi18n` / SKIP listesiyle çevrilmez. Yasal sayfalar yalnız TR + EN (DE/PT/JA'da İngilizce gösterilir)
- `recorder.js` bölümlü ses kaydı (duraklat/devam, geri al = son bölüm), AudioWorklet PCM → WAV → `/api/upload`; `loadUrl` (keşfet müziği) — Sesten ekranı ve ses klonu kullanır
- Analiz sekmesi (Oluştur › `pair` modu): vokal ve/veya müzik ayrı yüklenir, seçilince ilk 20 sn.ye kırpılır → `chop.js` cihazda düzenler (her 2/3/4/5 sn'de bir 1–4 sn'lik kesit, iki parçaya aynı kesim listesi, hece başına hizalı) → “Gönderilecek ses” önizlemesi → önizlemede seçili ses tek bir `mashup` görevine iki kez gider (KIE `ai-music-api/mashup`; sabit stil metni config/app `catalog.mashup.style` sunucuda kullanıcı stilinin önüne eklenir, süre `catalog.mashup.duration`; söz boşsa servis sözleri sesten kendisi yazar) (app.js `CH`, `chopRun`)
- `wave.js` dalga formu seçici `createWavePicker` (range = Bölüm değiştir, point = Uzat); ses `/api/media` üzerinden çözülür (Storage CORS vermez)
- `exaudio.js` keşfet müzik motoru (2 çalar, yumuşak geçiş, SETTLE; Storage CORS → seed) · kutular: config/app `catalog.genres[i]` {label, style, prompt, action custom|cover, preview}, en fazla `catalog.exploreMax`
- `credits.js` aylık plan penceresi + `Credits.info()` · planlar config/app `pricing.plans` + özel kredi çubuğu `pricing.custom` {min,max,step} (admin › Ayarlar › Aylık paketler'den düzenlenir; `db:seed` app.json değerleriyle üzerine yazar) · satın alma `window.CR.purchase` = mağaza içi abonelik (henüz bağlı değil)
- `docs.js` `a[data-legal]` bağlantılarını uygulama içinde alttan pencerede açar (paketteki terms/privacy.html, çevrimdışı) · `window.sheetDrag` ortak sürükle-kapat
- Yasal: `/privacy` `/terms` → `privacy.html` `terms.html` (TR+EN) + `legal.css|js` (yalnız web) · config/app `legal` {version, terms, privacy, contact} · Apple/Google ile devam “Kabul ediyorum” işaretlenmeden çalışmaz (auth.js `accepted`) · Kabul kaydı: istemci kabul edilen sürümü `/api/me` ile gönderir (kutu işaretlenince `localStorage.cf_terms`, ya da “Koşullar güncellendi” penceresinde `FB.auth.acceptTerms`); sunucu güncel `legal.version` ile doğrulayıp `users/{uid}.terms` {version, at, prev}'e yazar. Güncel sürüm kabul edilmeden `chargeCredits` `TermsRequired` (403 + `terms:true`) döner → arayüz kabul penceresini açar (eski hesaplar ve sürüm değişimi dahil). Hak onayı her üretimde görev kaydında (`tasks.params.rightsConfirmedAt`), ses klonu onayı `params.consent`; admin › Kullanıcılar satırına dokununca (`/api/admin/user`) hepsi görünür. Onay kayıtları hesap silinse de yasal süre boyunca saklanmalı
- `promo.html|js|css` → `/promo` tanıtım videosu (Instagram Reels / Story 1080×1920): kütüphanedeki “Tanıtım videosu” kutusu (yalnız yöneticiye görünür: admin claim, `FB.authState.admin` · `fb-admin` olayı) tam ekran katmanda (iframe) açar, web'de de çalışır. Şarkı + kapak (görsel/video) cihazdan seçilir, sunucuya gitmez; bölüm seçici (varsayılan en güçlü bölüm), sırayla çalma, kapaktan renk paleti, vuruş algılama (kanca/çağrı yazısı kelime kelime ritimle, sonda marka + “Uygulamayı ücretsiz indir”). Ortada kart yok: yalnız tam ekran kapak (alttan gölge, şarkı geçişinde yakınlaşarak yumuşak geçiş). Sahne `draw(t)` tuvalde → kayıt `captureStream` + Web Audio → MediaRecorder (MP4 öncelikli); mobilde Filesystem + Share ile kaydedilir
- `admin.html|js|css` → `/admin` yönetim paneli (yalnız web, mobil pakete girmez)
- `native.js` yerel köprü `window.CR` (api adresi, media = kilit ekranı/bildirim, save, share) · `env.js` (mobilde build-www yeniden yazar)
- `config/app.json` dinamik sabitlerin seed kaynağı (fiyat, katalog, KIE, legal, economics) · `vendor/firebase.js` + `fonts/` gömülü (CDN yok) · `vendor/lame.js` MP3 kodlayıcı (LGPL; Analiz önizlemesini “MP3 indir”, yalnız web, mobil pakete girmez)

**Sunucu (Next.js, yalnız API; sayfalar `next.config.ts` rewrite ile `public/*.html`)**
- `app/api/` rotalar: `music/generate` · `music/audio` (cover/extend/add-vocals/stem/replace) · `music/tasks/[id]` (durum + KIE yedek sorgu + medya kopya + persona/ses sonucu) · `music/lyrics` · `me` · `upload` · `media` (kendi sesini same-origin verir) · `persona` · `voice/phrase` → `voice` (ses klonu 2 adım) · `report` (→ `reports`) · `callback` (KIE webhook) · `health` · `admin/{stats,explore,config}`
- `lib/auth.ts` ID token doğrulama, `requireUser` / `requireAccount`, `HttpError`, `errorResponse` · `lib/admin.ts` admin custom claim · `lib/firebaseAdmin.ts`
- `lib/kie.ts` KIE istemcisi + `KIE_MODEL` · `lib/kieInputBuilder.ts` input alanları (docs.kie.ai ile birebir) · `lib/results.ts` sonuç okuma (stem: vocal_removal_info | vocal_separation_info) · `lib/webhook.ts` HMAC (`${taskId}.${timestamp}`, 5 dk replay) · `lib/validation.ts` (zod)
- `lib/data/`: `schema.ts` yollar + tipler (tek doğruluk kaynağı; `fb.js` aynı adları kullanır) · `config.ts` (60 sn önbellek, `getCost`) · `users.ts` (`ensureUser`, `settlePeriod`, `startPlan`, persona/ses) · `tasks.ts` · `storage.ts` · `mirror.ts` · `extras.ts` (persona/ses tamamlanınca) · `media.ts` (`classifyMedia`: yalnız kendi uploads/media'sı ya da kendi görev sonucu)
- `middleware.ts` /api CORS (capacitor://localhost, https://localhost; `CORS_EXTRA_ORIGINS`)
- Kâr analizi: görev `kieCredits` (servis creditsConsumed) · config/app `economics` {usdPerCredit, kieUsdPerCredit, kieCreditsEstimate}

**Altyapı / betikler**
- `firestore.rules` · `firestore.indexes.json` · `storage.rules` · `firebase.json` (emülatör) · `apphosting.yaml` (Firebase App Hosting, us-east4; gizliler Secret Manager'da, `APP_URL`)
- `capacitor.config.ts` · `scripts/build-www.mjs` (public → www, `admin.*` ve `legal.css|js` hariç, API adresi apphosting.yaml'dan) · `scripts/seed.mjs` · `scripts/vendor.mjs` + `firebase-entry.js` · `scripts/grant-admin.mjs`
- Mobil giriş (Apple / Google): `capacitor.config.ts` › `plugins.FirebaseAuthentication` · iOS `ios/App/App/GoogleService-Info.plist` (Xcode kaynaklarında) + `App.entitlements` (Sign in with Apple) + `Info.plist` URL şeması (REVERSED_CLIENT_ID) · Android `android/app/google-services.json` (debug SHA-1 Firebase'e ekli; yayın / Play imza anahtarının SHA-1'i de eklenmeli) + `variables.gradle` `rgcfaIncludeGoogle`. Firebase uygulamaları: CookFire iOS / Android (`firebase apps:list`). Apple girişi için Firebase Auth'ta Apple sağlayıcısı yapılandırılmalı.
- `assets/` + `resources/` uygulama simge/açılış kaynakları (`npm run mobile:assets`)

## Kurallar
- Git: her geliştirme ve commit doğrudan `main` dalında. Yeni branch açılmaz.
- Sabit değer (fiyat, liste, model, limit) koda yazılmaz → `public/config/app.json` + `npm run db:seed` (Firestore `config/app`).
- Maliyet rozeti: istemci `costOf(op, model)` ↔ sunucu `getCost(op, model)` aynı kural; fiyat yalnız `pricing.costs` + isteğe bağlı `pricing.modelCosts[model][op]`. Rozet = kullanıcı kredisi, KIE token değil.
- Fiyat hedefi: 1 kullanıcı kredisi = 1 KIE token (ölçülen: generate/cover/extend/add-vocals = 12). Gerçek tüketim admin › Ayarlar'da işlem başına görünür, fiyat oradan düzenlenir. Plan şarkı sayısı otomatik (kredi / generate × 2).
- Kredi yalnız sunucuda, transaction ile düşer/iade edilir (iade bir kez); istemci sadece gösterir.
- Misafir (anonim) kredisi 0 ve harcayamaz: kredi/yükleme uçları `requireAccount`; başlangıç kredisi hesabın ilk dönemi (`ensureUser`).
- Yapay zekâ söz yazımı ücretli (`/api/music/write` → KIE generate-lyrics, `pricing.costs.lyrics` = 1 kredi, sunucuda düşer, başarısızsa iade): Özel, Sesten ve araçların söz alanlarındaki “Yapay zekâ yaz” düğmesi (`[data-aiw]`).
- Üretim servisi hataları (`lib/kieErrors.ts`): kullanıcıya ham ileti / servis adı gitmez, resmi kısa Türkçe metin gösterilir. 402/429/455/5xx = “sistem yoğun” (`ProviderBusy`, 503 + `busy:true`; arayüz: Tamam + **Bildir** penceresi `showBusy`) ve saatte bir otomatik uyarı düşer. Bildir → `/api/issues` → Firestore `issues` (yalnız sunucu; günlük sınır `limits.issue`) → admin › Bildirimler (+ içerik şikâyetleri `reports`). Kullanıcı kredisi biterse (`Kredi yetersiz`, 402) kredi satın alma penceresi açılır.
- Başlangıç hediyesi ve harcama yalnız Apple / Google ile bağlı hesaba (`requireUser().verified`: giriş sağlayıcısı ya da `firebase.identities`). E-posta / şifre hesabı (arayüzde yok; Firebase'de açık kalsa bile REST ile açılabilir) kredi 0, dönem başlamaz (`users/{uid}.unverified`), harcama `TrustedLoginRequired` (403).
- Kaynak parçayla çalışan işlemler (uzat, stem, bölüm) `taskId` ile gelir; görev kullanıcıya ait ve `audioId` o görevin sonucu olmalı (değilse 404, kredi düşmez). Ücretsiz uçlar (persona, voice-phrase, voice) günlük sınırlı: config/app `limits` → `takeQuota` (`users/{uid}.quota`, 429). Teslim edilmiş (COMPLETED + sonuçlu) görev sonradan başarısız sayılmaz, iade edilmez. Parça silmek kredi iade etmez.
- Krediler aylık: dönem (`users/{uid}.period`) bitince bakiye sıfırlanır, abonelik (`plan`) varsa plan kredisine yenilenir, devretmez. Satın alınan kredi süreli olamaz (App Store 3.1.1) → ücretli kredi yalnız abonelik.
- Beat = KIE `instrumental: true` + stil sonuna `catalog.beatTags`; ayrı Enstrümantal modu yok.
- Sesi olmayan parça çalınmaz (deneme/synth sesi yok). Kullanıcı ses kaynağı yalnız `classifyMedia` onaylıysa kullanılır; yüklemede hak onayı zorunlu.
- Yeni arayüz metni Türkçe yazılır; İngilizcesi `public/i18n.js`, Almanca/Portekizce/Japonca çevirileri `public/i18n-langs.js` sözlüğüne eklenir (dört dil birlikte); kullanıcı içeriği gösteren öğeye `data-noi18n`.
- Tasarım: siyah/fildişi zemin + sıcak vurgu (altın #F5B83D, alev turuncusu #FF7A2F, kehribar, koyu kırmızı), başlık fontu Grenze Gotisch; mor/mavi kullanma.
- Yasal metin değişirse sayfalardaki sürüm + config/app `legal.version` birlikte güncellenir.
- Okuma/yazma maliyeti: yeni koleksiyon/dinleyici eklemeden önce mevcut belgeye (config/app, users/{uid}) alan eklemeyi düşün.
- Uzak kod/font yükleme yok (mağaza paketi çevrimdışı açılmalı); yeni istemci bağımlılığı → `scripts/firebase-entry.js` ya da vendor.
- Webhook HMAC production'da zorunlu (`KIE_WEBHOOK_HMAC_KEY` yoksa `/api/callback` reddeder).
- Gizli: `.env`, `firebase-service-account.json` — okuma, commit etme, değerleri yazma.

## Komutlar / Doğrulama
- Dev: `npm run dev` → http://localhost:3000 (`/admin`, `/privacy`, `/terms`)
- TS değiştiyse: `npx tsc --noEmit` · istemci JS değiştiyse: `node --check public/<dosya>.js`
- Config: `npm run db:seed` (app.json + kurallar + Storage CORS yayınlar) · admin: `npm run admin:grant -- e-posta`
- Mobil: `npm run vendor` (gerekirse) → `npm run mobile:build` → `npm run mobile:ios` | `mobile:android`
