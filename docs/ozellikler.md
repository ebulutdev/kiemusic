# CookFire — özellik ayrıntıları

AGENTS.md'deki kısa haritanın ayrıntısı. Yalnız ilgili özellik üzerinde çalışırken o bölümü oku (`grep -n "^## " docs/ozellikler.md`).

## Giriş / Firebase istemci (`fb.js`, `auth.js`)
- `fb.js`: giriş yalnız Apple / Google + misafir; misafir→hesap bağlama; mobilde telefonun yerel girişi `@capacitor-firebase/authentication`, skipNativeAuth → kimlik bilgisiyle JS katmanında oturum. 3 dinleyici (config/app, users/{uid}, users/{uid}/tracks), diff+batch yazım.
- `auth.js` + `auth.css`: giriş kapısı (e-posta / şifre girişi yok — sağlayıcı e-postayı doğrulamış olur) ve profil hesap kartı.
- Başlangıç hediyesi ve harcama yalnız Apple / Google ile bağlı hesaba (`requireUser().verified`: giriş sağlayıcısı ya da `firebase.identities`). E-posta / şifre hesabı (arayüzde yok; Firebase'de açık kalsa bile REST ile açılabilir) kredi 0, dönem başlamaz (`users/{uid}.unverified`), harcama `TrustedLoginRequired` (403).
- Misafir (anonim) kredisi 0 ve harcayamaz: kredi/yükleme uçları `requireAccount`; başlangıç kredisi hesabın ilk dönemi (`ensureUser`).

## Mobil giriş yapılandırması
- `capacitor.config.ts` › `plugins.FirebaseAuthentication`
- iOS: `ios/App/App/GoogleService-Info.plist` (Xcode kaynaklarında) + `App.entitlements` (Sign in with Apple) + `Info.plist` URL şeması (REVERSED_CLIENT_ID)
- Android: `android/app/google-services.json` (debug SHA-1 Firebase'e ekli; yayın / Play imza anahtarının SHA-1'i de eklenmeli) + `variables.gradle` `rgcfaIncludeGoogle`
- Firebase uygulamaları: CookFire iOS / Android (`firebase apps:list`). Apple girişi için Firebase Auth'ta Apple sağlayıcısı yapılandırılmalı.

## i18n (`i18n.js`, `i18n-langs.js`)
5 dil (TR, EN, DE, PT, JA): arayüz Türkçe yazılır; diğer dillerde metin düğümleri + placeholder/aria-label/title sözlükten çevrilir (`window.I18N.t/has/loc`). EN sözlüğü i18n.js'te, DE/PT/JA paketleri i18n-langs.js'te (anahtar = Türkçe metin; eksik metin İngilizceye düşer); `localStorage.sf_lang`. Kullanıcı içeriği `data-noi18n` / SKIP listesiyle çevrilmez. Yasal sayfalar yalnız TR + EN (DE/PT/JA'da İngilizce gösterilir).

## Ses kaydı / dalga formu / keşfet
- `recorder.js`: bölümlü ses kaydı (duraklat/devam, geri al = son bölüm), AudioWorklet PCM → WAV → `/api/upload`; `loadUrl` (keşfet müziği) — Sesten ekranı ve ses klonu kullanır.
- `wave.js`: `createWavePicker` (range = Bölüm değiştir, point = Uzat); ses `/api/media` üzerinden çözülür (Storage CORS vermez).
- `exaudio.js`: keşfet müzik motoru (2 çalar, yumuşak geçiş, SETTLE; Storage CORS → seed). Kutular: config/app `catalog.genres[i]` {label, style, prompt, action custom|cover, preview}, en fazla `catalog.exploreMax`.

## Analiz sekmesi (Oluştur › `pair` modu; app.js `CH`, `chopRun`)
Vokal ve/veya müzik ayrı yüklenir, seçilince ilk 20 sn.ye kırpılır → `chop.js` cihazda düzenler (her 2/3/4/5 sn'de bir 1–4 sn'lik kesit, iki parçaya aynı kesim listesi, hece başına hizalı) → “Gönderilecek ses” önizlemesi → önizlemede seçili ses tek bir `mashup` görevine iki kez gider (KIE `ai-music-api/mashup`; sabit stil metni config/app `catalog.mashup.style` sunucuda kullanıcı stilinin önüne eklenir, süre `catalog.mashup.duration`; söz boşsa servis sözleri sesten kendisi yazar). `vendor/lame.js` MP3 kodlayıcı (LGPL) önizlemeyi “MP3 indir” yapar; yalnız web, mobil pakete girmez.

## Krediler / planlar (`credits.js`)
- Aylık plan penceresi + `Credits.info()`. Planlar config/app `pricing.plans` + özel kredi çubuğu `pricing.custom` {min,max,step} (admin › Ayarlar › Aylık paketler'den düzenlenir; `db:seed` app.json değerleriyle üzerine yazar). Satın alma `window.CR.purchase` = mağaza içi abonelik (henüz bağlı değil).
- Fiyat hedefi: 1 kullanıcı kredisi = 1 KIE token (ölçülen: generate/cover/extend/add-vocals = 12). Gerçek tüketim admin › Ayarlar'da işlem başına görünür, fiyat oradan düzenlenir. Plan şarkı sayısı otomatik (kredi / generate × 2).
- Krediler aylık: dönem (`users/{uid}.period`) bitince bakiye sıfırlanır, abonelik (`plan`) varsa plan kredisine yenilenir, devretmez. Satın alınan kredi süreli olamaz (App Store 3.1.1) → ücretli kredi yalnız abonelik.
- Yapay zekâ söz yazımı ücretli (`/api/music/write` → KIE generate-lyrics, `pricing.costs.lyrics` = 1 kredi, sunucuda düşer, başarısızsa iade): Özel, Sesten ve araçların söz alanlarındaki “Yapay zekâ yaz” düğmesi (`[data-aiw]`).
- Kaynak parçayla çalışan işlemler (uzat, stem, bölüm) `taskId` ile gelir; görev kullanıcıya ait ve `audioId` o görevin sonucu olmalı (değilse 404, kredi düşmez). Ücretsiz uçlar (persona, voice-phrase, voice) günlük sınırlı: config/app `limits` → `takeQuota` (`users/{uid}.quota`, 429). Teslim edilmiş (COMPLETED + sonuçlu) görev sonradan başarısız sayılmaz, iade edilmez. Parça silmek kredi iade etmez.
- Kâr analizi: görev `kieCredits` (servis creditsConsumed) · config/app `economics` {usdPerCredit, kieUsdPerCredit, kieCreditsEstimate}.

## Üretim servisi hataları (`lib/kieErrors.ts`)
Kullanıcıya ham ileti / servis adı gitmez, resmi kısa Türkçe metin gösterilir. 402/429/455/5xx = “sistem yoğun” (`ProviderBusy`, 503 + `busy:true`; arayüz: Tamam + **Bildir** penceresi `showBusy`) ve saatte bir otomatik uyarı düşer. Bildir → `/api/issues` → Firestore `issues` (yalnız sunucu; günlük sınır `limits.issue`) → admin › Bildirimler (+ içerik şikâyetleri `reports`). Kullanıcı kredisi biterse (`Kredi yetersiz`, 402) kredi satın alma penceresi açılır.

## Yasal / kabul kaydı
- `/privacy` `/terms` → `privacy.html` `terms.html` (TR+EN) + `legal.css|js` (yalnız web) · config/app `legal` {version, terms, privacy, contact}. `docs.js` `a[data-legal]` bağlantılarını uygulama içinde alttan pencerede açar (paketteki dosyalar, çevrimdışı) · `window.sheetDrag` ortak sürükle-kapat.
- Apple/Google ile devam “Kabul ediyorum” işaretlenmeden çalışmaz (auth.js `accepted`).
- Kabul kaydı: istemci kabul edilen sürümü `/api/me` ile gönderir (kutu işaretlenince `localStorage.cf_terms`, ya da “Koşullar güncellendi” penceresinde `FB.auth.acceptTerms`); sunucu güncel `legal.version` ile doğrulayıp `users/{uid}.terms` {version, at, prev}'e yazar. Güncel sürüm kabul edilmeden `chargeCredits` `TermsRequired` (403 + `terms:true`) döner → arayüz kabul penceresini açar (eski hesaplar ve sürüm değişimi dahil).
- Hak onayı her üretimde görev kaydında (`tasks.params.rightsConfirmedAt`), ses klonu onayı `params.consent`; admin › Kullanıcılar satırına dokununca (`/api/admin/user`) hepsi görünür. Onay kayıtları hesap silinse de yasal süre boyunca saklanmalı.

## Tanıtım videosu (`promo.html|js|css` → `/promo`)
Instagram Reels / Story 1080×1920. Kütüphanedeki “Tanıtım videosu” kutusu (yalnız yöneticiye görünür: admin claim, `FB.authState.admin` · `fb-admin` olayı) tam ekran katmanda (iframe) açar, web'de de çalışır. Şarkı + kapak (görsel/video) cihazdan seçilir, sunucuya gitmez; bölüm seçici (varsayılan en güçlü bölüm), sırayla çalma, kapaktan renk paleti, vuruş algılama (kanca/çağrı yazısı kelime kelime ritimle, sonda marka + “Uygulamayı ücretsiz indir”). Tam ekran kapak arka plan (alttan gölge, şarkı geçişinde yakınlaşarak yumuşak geçiş) + ortada küçük kart yığını (çalan önde, diğeri arkasında gölgeli; geçişte kartlar yer değiştirir). Sahne `draw(t)` tuvalde → kayıt `captureStream` + Web Audio → MediaRecorder (MP4 öncelikli); mobilde Filesystem + Share ile kaydedilir.

## Sunucu ayrıntıları
- `app/api/music/tasks/[id]`: durum + KIE yedek sorgu + medya kopya + persona/ses sonucu · `voice/phrase` → `voice` (ses klonu 2 adım) · `media` kendi sesini same-origin verir.
- `lib/kieInputBuilder.ts` input alanları docs.kie.ai ile birebir · `lib/results.ts` stem: vocal_removal_info | vocal_separation_info · `lib/webhook.ts` HMAC (`${taskId}.${timestamp}`, 5 dk replay).
- `lib/data/`: `config.ts` (60 sn önbellek, `getCost`) · `users.ts` (`ensureUser`, `settlePeriod`, `startPlan`, persona/ses) · `extras.ts` (persona/ses tamamlanınca) · `media.ts` (`classifyMedia`: yalnız kendi uploads/media'sı ya da kendi görev sonucu).
- `middleware.ts` /api CORS (capacitor://localhost, https://localhost; `CORS_EXTRA_ORIGINS`).
- `apphosting.yaml`: Firebase App Hosting, us-east4; gizliler Secret Manager'da, `APP_URL`. `scripts/build-www.mjs`: public → www, `admin.*` ve `legal.css|js` hariç, API adresi apphosting.yaml'dan.
