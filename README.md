# SoundForge — KIE + Suno AI Music Studio

Next.js 15 · TypeScript · Firebase (Auth · Firestore · Storage) · KIE API · PWA · iOS & Android uyumlu

---

## Özellikler

| Özellik | Detay |
|---|---|
| Vokalli üretim | Prompt + Lyrics + Style + Gender |
| Beat üretimi | Vokalsiz, davul odaklı (KIE `instrumental: true`) |
| Senkron sözler | KIE timeStamped-lyrics ile kelime kelime karaoke |
| Audio Cover | Kayıt/dosyadan cover |
| Extend | Müziği devam ettir |
| Add Vocals | Mevcut müziğe vokal ekle |
| Vocal Separation | Stem ayırma (vocal/bass/drums/guitar...) |
| Replace Section | Bölüm yeniden üret |
| Persona | Tekrar kullanılabilir vokal persona |
| Custom Voice | Kendi sesini tanıt |
| Advanced Controls | style_weight, weirdness, audio_weight, variety |
| PWA | iOS Safari + Android Chrome install |
| Webhook | HMAC-SHA256 doğrulamalı |
| Polling | 3sn fallback (webhook gelmezse) |

---

## Kurulum

```bash
# 1. Klonla
git clone https://github.com/sizin-repo/kie-suno-music
cd kie-suno-music

# 2. Bağımlılıklar
npm install

# 3. Ortam değişkenleri
cp .env.example .env
# .env dosyasını düzenle

# 4. Firebase servis hesabı anahtarı (Console > Proje ayarları > Hizmet hesapları)
#    → proje köküne firebase-service-account.json olarak koyun (git'e girmez)

# 5. Çalıştır
npm run dev
```

Aç: http://localhost:3000

### Firebase Console kurulumu

1. **Authentication → Sign-in method → Anonymous** açık olmalı
2. **Firestore** oluşturun → Rules: `firestore.rules` içeriği · Indexes: `firestore.indexes.json`
3. **Storage** (Blaze plan) → Rules: `storage.rules` içeriği
4. CLI ile tek komut: `firebase deploy --only firestore,storage`

---

## Environment Variables

```env
KIE_API_KEY=kie_xxxxxxxxxxxxxxxx
KIE_WEBHOOK_HMAC_KEY=xxxxxxxxxxxxxxxx
APP_URL=https://your-domain.com
FIREBASE_SERVICE_ACCOUNT=./firebase-service-account.json   # ya da JSON içeriği tek satır
FIREBASE_STORAGE_BUCKET=rapper-fcc44.firebasestorage.app
```

**Önemli:** `KIE_API_KEY` ve servis hesabı anahtarı asla istemciye / git'e gitmemeli.

---

## Veritabanı (Firebase)

Şema tek yerde: `lib/data/schema.ts` (istemci `public/fb.js` aynı adları kullanır).

| Yol | İçerik | Yazan |
|---|---|---|
| `users/{uid}` | `credits`, `settings` | kredi: sunucu · settings: kullanıcı |
| `users/{uid}/tracks/{id}` | kütüphane | istemci |
| `users/{uid}/lyrics/{id}` | zaman damgalı sözler | istemci |
| `users/{uid}/personas/{id}` · `voices/{id}` | persona / ses | istemci + sunucu |
| `tasks/{kieTaskId}` | KIE görevi, maliyet, iade, sonuçlar | yalnız sunucu |
| Storage `uploads/{uid}/…` | kullanıcı ses kayıtları | sunucu |
| Storage `media/{uid}/{taskId}/…` | MP3 + kapak kopyaları (KIE 14 günde siler) | sunucu |

Kredi düşümü transaction ile atomik; başarısız görevde iade yalnız bir kez yapılır.
İstemci çevrimdışı önbellekli çalışır, yalnız değişen belgeleri toplu (batch) yazar.

---

## Proje Yapısı

```
kie-suno-music/
├── app/
│   ├── api/
│   │   ├── callback/          ← KIE webhook (HMAC doğrulamalı)
│   │   ├── music/
│   │   │   ├── generate/      ← Müzik üretimi
│   │   │   ├── audio/         ← Cover/Extend/AddVocals/RemoveVocals/ReplaceSection
│   │   │   ├── lyrics/        ← Zaman damgalı sözler (önbellekli)
│   │   │   └── tasks/[id]/    ← Task durumu + KIE fallback + medya kopyalama
│   │   ├── me/                ← Kullanıcı belgesi + başlangıç kredisi
│   │   ├── upload/            ← Ses kaydı → Firebase Storage
│   │   ├── persona/           ← Persona oluştur
│   │   ├── voice/             ← Custom Voice oluştur
│   │   └── health/
│   ├── layout.tsx
│   └── globals.css
├── lib/
│   ├── auth.ts                ← Firebase ID token doğrulama, maliyetler, hata yanıtı
│   ├── firebaseAdmin.ts       ← Firebase Admin (Auth · Firestore · Storage)
│   ├── data/
│   │   ├── schema.ts          ← Koleksiyon adları, yollar, tipler
│   │   ├── users.ts           ← Kredi (atomik düşüm / iade)
│   │   ├── tasks.ts           ← KIE görevleri
│   │   ├── storage.ts         ← Yükleme + medya kopyalama
│   │   ├── mirror.ts          ← Tamamlanan görevin medyasını bir kez kopyala
│   │   └── library.ts         ← Persona / ses kayıtları
│   ├── kie.ts                 ← KIE API client (tüm endpointler)
│   ├── kieInputBuilder.ts     ← KIE input nesne oluşturucu
│   ├── results.ts             ← KIE sonuç normalizasyonu
│   ├── validation.ts          ← Zod şemaları
│   └── webhook.ts             ← HMAC doğrulama
├── public/
│   ├── soundforge.html        ← Mobil arayüz
│   └── fb.js                  ← Firebase istemci (Auth + Firestore senkronu)
├── firestore.rules · firestore.indexes.json · storage.rules · firebase.json
└── agents/                    ← Agent instruction dosyaları
```

---

## API Endpoint Referansı

### Uygulama API

```
POST   /api/music/generate          Vokalli / vokalsiz üretim
POST   /api/music/audio             Cover, Extend, AddVocals, RemoveVocals, ReplaceSection
GET    /api/music/tasks             Kullanıcının görevleri
GET    /api/music/tasks/:id         Tek task durumu (id = KIE taskId)
POST   /api/music/lyrics            Zaman damgalı sözler
POST   /api/me                      Kullanıcı belgesi / kredi
POST   /api/upload                  Ses yükleme (Storage)
POST   /api/callback                KIE webhook
POST   /api/persona                 Persona oluştur
POST   /api/voice                   Voice oluştur
GET    /api/health                  Sağlık kontrolü

Tümü (health ve callback hariç) `Authorization: Bearer <Firebase ID token>` ister.
```

### KIE API (backend'de kullanılır)

```
POST   /api/v1/jobs/createTask
GET    /api/v1/jobs/recordInfo?taskId=...
GET    /api/v1/generate/record-info?taskId=...
POST   /api/v1/common/download-url
```

---

## Task Durum Akışı

```
QUEUED → TEXT_READY → FIRST_READY → COMPLETED
                                   → FAILED
```

KIE callback'leri: text → first → complete

---

## Webhook Kurulumu

Production'da KIE'nin ulaşabileceği public URL gereklidir:

```
APP_URL=https://music.yourapp.com
```

Callback URL otomatik: `{APP_URL}/api/callback`

Local development için HTTPS tunnel kullanın:
- ngrok: `ngrok http 3000`
- cloudflared: `cloudflared tunnel --url http://localhost:3000`

---

## Production Build

```bash
npm run build
npm start
```

---

## Validation Kuralları

- `instrumental: true` (Beat) → lyrics, prompt, vocal_gender, audio_weight kaldırılır; style zorunlu
- `customMode: false` → duration, sliders kaldırılır
- Style maks 1000 karakter
- Lyrics maks 5000 karakter (V6)
- Title maks 80 karakter
- Cover audio kaynak maks 8 dakika
- KIE media 14 gün sonra silinir → tamamlanan görevler Firebase Storage'a kopyalanır
- Rate limit ~20 req/10sn → 429'da exponential backoff

---

## Sleek Music Mimarisi

Bu proje [sleek-music](https://github.com/LakhindarPal/sleek-music) müzik player mimarisinden ilham alır.
React Native versiyonu için sleek-music + bu backend kombinasyonu önerilir.

---

## Lisans

MIT

---

## Hızlı başlangıç (anahtar hazır)

`.env.example` dosyasını `.env` olarak kopyalayıp `KIE_API_KEY` değerini girin. Arayüz anahtar istemez; tüm istekler sunucudan gider.

```bash
cp .env.example .env # KIE_API_KEY'i yazın
npm install
npm run dev          # http://localhost:3000 → SoundForge mobil arayüzü
```

Ses kaydı / yükleme ve webhook için KIE'nin sunucunuza erişebilmesi gerekir:

```bash
ngrok http 3000      # çıkan https adresini .env → APP_URL'e yazın, sunucuyu yeniden başlatın
```

iPhone'da adresi Safari'de açıp Paylaş → Ana Ekrana Ekle ile uygulama gibi kullanın.

**Vercel'e alırken:** `.env` GitHub'a gitmez (.gitignore). Vercel → Settings → Environment Variables'a
`KIE_API_KEY`, `APP_URL`, `FIREBASE_SERVICE_ACCOUNT` (JSON içeriği tek satır) ve `FIREBASE_STORAGE_BUCKET` ekleyin.
