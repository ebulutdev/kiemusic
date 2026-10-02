# CookRapper — yapay zekâ müzik stüdyosu (mobil PWA + Capacitor + Next.js API + Firebase)

Yanıt dili: Türkçe. Hedef: iOS/Android mobil uygulama (Capacitor 8, `ios/` + `android/`). Arayüzde KIE/Suno adı geçmez.

## Harita (önce buraya bak, projeyi tarama)
- `public/index.html` iskelet · `public/app.css` stil · `public/app.js` tüm arayüz mantığı (tek dosya, ~70 KB — ilgili fonksiyonu Grep ile bul)
- `public/fb.js` Firebase istemci: giriş (Apple/Google/e-posta/misafir, misafir→hesap bağlama), 3 dinleyici (config/app, users/{uid}, users/{uid}/tracks), diff+batch yazım
- `public/recorder.js` ses kaydedici bileşeni (kaydet → dinle/sar → sil ya da kaydet; WAV'a çevirip /api/upload) — Sesten ekranı ve ses klonu kullanır
- `public/auth.js` + `auth.css` giriş/kayıt ekranı (kapı) ve profil hesap kartı · tasarım: siyah/fildişi zemin + canlı sıcak vurgu (altın #F5B83D, alev turuncusu #FF7A2F, kehribar, koyu kırmızı), başlık fontu Grenze Gotisch; mor/mavi kullanma
- `public/config/app.json` dinamik sabitlerin seed kaynağı (fiyat, katalog, KIE) → `npm run db:seed` ile Firestore `config/app`
- `lib/data/schema.ts` Firestore/Storage yolları + tipler (tek doğruluk kaynağı) · `config.ts` (60 sn önbellek) · `users.ts` (kredi, persona, ses) · `tasks.ts` · `storage.ts` · `mirror.ts`
- `lib/auth.ts` Firebase ID token doğrulama · `lib/firebaseAdmin.ts` · `lib/kie.ts` KIE istemcisi · `lib/kieInputBuilder.ts` · `lib/validation.ts` (zod) · `lib/results.ts`
- `app/api/*` rotalar: music/generate, music/audio, music/tasks/[id] (durum + persona/ses sonucu), music/lyrics, me, upload, persona, voice/phrase → voice (ses klonu 2 adım), callback, health
- KIE işlem ↔ model: `lib/kie.ts` KIE_MODEL · input alanları `lib/kieInputBuilder.ts` (docs.kie.ai ile birebir) · sonuç okuma `lib/results.ts` (stem: vocal_removal_info | vocal_separation_info) · persona/ses tamamlanınca `lib/data/extras.ts`
- `public/native.js` yerel köprü `window.CR` (api adresi, media = kilit ekranı/bildirim, save, share) · `public/env.js` (mobilde build-www yeniden yazar)
- `public/vendor/firebase.js` + `public/fonts/` gömülü (CDN yok) → `npm run vendor` (scripts/vendor.mjs, scripts/firebase-entry.js)
- `lib/data/media.ts` ses kaynağı doğrulama (yalnız kullanıcının uploads/media'sı ya da kendi görev sonucu; yüklemede hak onayı) · `app/api/report` içerik bildirimi → `reports`
- `middleware.ts` /api CORS (capacitor://localhost, https://localhost) · `capacitor.config.ts` · mobil derleme: `npm run mobile:build`
- `firestore.rules` · `storage.rules` (seed yayınlar)

## Kurallar
- Sabit değer (fiyat, liste, model, limit) koda yazılmaz → `public/config/app.json` + `npm run db:seed`
- Kredi yalnız sunucuda düşer/iade edilir (transaction); istemci sadece gösterir
- Beat = KIE `instrumental: true` + stil sonuna `catalog.beatTags`; Enstrümantal modu yok
- Okuma/yazma maliyeti: yeni koleksiyon/dinleyici eklemeden önce mevcut tek belgeye (config/app, users/{uid}) alan eklemeyi düşün
- Gizli: `.env`, `firebase-service-account.json` — okuma, commit etme
- Webhook HMAC production'da zorunlu (`KIE_WEBHOOK_HMAC_KEY`); sesi olmayan parça çalınmaz (deneme/synth sesi yok)
- Uzak kod/font yükleme ekleme (mağaza paketi çevrimdışı açılmalı); yeni istemci bağımlılığı → scripts/firebase-entry.js ya da vendor
- Dev: `npm run dev` (http://localhost:3000) · tip kontrolü: `npx tsc --noEmit` · JS: `node --check public/app.js`
